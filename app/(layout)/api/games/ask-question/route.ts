/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';

// Server-side Sanity client with proper token
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN, // This token is only available server-side
  useCdn: false,
});

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    const { gameId, categoryId, questionIndex } = body;
    
    if (!gameId || !categoryId || questionIndex === undefined) {
      return new NextResponse(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
    }
    
    // Get the Sanity member ID for the current user
    const sanityUserId = await client.fetch(
      `*[_type == "member" && clerkId == $clerkId][0]._id`,
      { clerkId: userId }
    );
    
    if (!sanityUserId) {
      return new NextResponse(JSON.stringify({ error: 'User profile not found' }), { status: 404 });
    }
    
    // Get game data
    const game = await client.fetch(`
      *[_type == "game" && _id == $gameId][0]{
        ...,
        playerOne->{_id, name},
        playerTwo->{_id, name},
        playerOneTarget->{_id},
        playerTwoTarget->{_id},
        currentTurn,
        boardMembers[]->{
          _id, name, profession, image, skills, interests, workspacePreferences
        }
      }
    `, { gameId });
    
    if (!game) {
      return new NextResponse(JSON.stringify({ error: 'Game not found' }), { status: 404 });
    }
    
    // Check if it's the user's turn
    if (game.currentTurn !== sanityUserId) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Not your turn', 
          debug: { currentTurn: game.currentTurn, yourId: sanityUserId } 
        }),
        { status: 403 }
      );
    }
    
    // Get question data
    const category = await client.fetch(`
      *[_type == "questionCategory" && _id == $categoryId][0]
    `, { categoryId });
    
    if (!category || !category.questions || questionIndex >= category.questions.length) {
      return new NextResponse(JSON.stringify({ error: 'Invalid question' }), { status: 400 });
    }
    
    const question = category.questions[questionIndex];
    const questionId = `${categoryId}:${questionIndex}`;
    
    // Determine the opponent's target
    const playerOneId = game.playerOne._id;
    const playerTwoId = game.playerTwo._id;
    const targetMemberId = sanityUserId === playerOneId
      ? game.playerTwoTarget._id
      : game.playerOneTarget._id;
    
    const targetMember = game.boardMembers.find((m: { _id: any; }) => m._id === targetMemberId);
    if (!targetMember) {
      return new NextResponse(JSON.stringify({ error: 'Target member not found' }), { status: 404 });
    }
    
    // Resolve the answer
    let answer = false;
    const attributePath = question.attributePath;
    const attributeValue = question.attributeValue;
    
    if (attributePath) {
      const value = getNestedProperty(targetMember, attributePath);
      
      if (Array.isArray(value)) {
        answer = attributeValue ? value.includes(attributeValue) : false;
      } else if (typeof value === 'boolean') {
        answer = value === true;
      } else if (typeof value === 'string') {
        answer = attributeValue ? value === attributeValue : false;
      }
    }
    
    // Create a new move
    const newMove = {
      _type: 'gameMove',
      _key: Date.now().toString(),
      playerId: sanityUserId,
      playerName: sanityUserId === playerOneId ? game.playerOne.name : game.playerTwo.name,
      questionId,
      questionText: question.text,
      timestamp: new Date().toISOString(),
      answer
    };
    
    // Calculate next turn
    const nextTurn = sanityUserId === playerOneId ? playerTwoId : playerOneId;
    
    try {
      await client
        .patch(gameId)
        .setIfMissing({ moves: [] })
        .append('moves', [newMove])
        .set({ currentTurn: nextTurn })
        .commit();
    } catch (updateError) {
      console.error('Error updating game:', updateError);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Failed to update game state',
          details: updateError instanceof Error ? updateError.message : 'Unknown error'
        }),
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      move: newMove,
      answer,
      nextTurn
    });
    
  } catch (error) {
    console.error('Error asking question:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to ask question',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}

// Helper function to get nested property
function getNestedProperty(obj: Record<string, any>, path: string): any {
  if (!path) return undefined;
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  
  return current;
}