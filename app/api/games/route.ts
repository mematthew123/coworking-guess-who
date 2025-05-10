// src/app/api/games/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';

// Create a server-side Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { opponentId, boardMembers } = body;
    
    if (!opponentId) {
      return new NextResponse(
        JSON.stringify({ error: 'Opponent ID is required' }),
        { status: 400 }
      );
    }
    
    // Get the Sanity member ID for the current user
    const currentUserQuery = `*[_type == "member" && clerkId == $clerkId][0]._id`;
    const currentUserId = await client.fetch(currentUserQuery, { clerkId: userId });
    
    if (!currentUserId) {
      return new NextResponse(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404 }
      );
    }
    
    // Create a new game
    const game = {
      _type: 'game',
      startedAt: new Date().toISOString(),
      status: 'active',
      playerOne: {
        _type: 'reference',
        _ref: currentUserId
      },
      playerTwo: {
        _type: 'reference',
        _ref: opponentId
      },
      playerOneTarget: {
        _type: 'reference',
        _ref: opponentId
      },
      playerTwoTarget: {
        _type: 'reference',
        _ref: currentUserId
      },
      boardMembers: boardMembers || [], // Use provided board members or generate them
      currentTurn: currentUserId, // Current user goes first
      moves: []
    };
    
    // If no board members provided, generate them
    if (!boardMembers || boardMembers.length === 0) {
      // Get participating members
      const membersQuery = `*[_type == "member" && gameParticipation == true]._id`;
      const allMembers = await client.fetch(membersQuery);
      
      // Randomly select 16-20 members for the board
      const numBoardMembers = Math.floor(Math.random() * 5) + 16; // 16-20 members
      const shuffledMembers = [...allMembers].sort(() => 0.5 - Math.random());
      
      // Ensure both players are included
      const boardMemberIds = shuffledMembers.slice(0, numBoardMembers);
      if (!boardMemberIds.includes(currentUserId)) {
        boardMemberIds.pop();
        boardMemberIds.push(currentUserId);
      }
      if (!boardMemberIds.includes(opponentId)) {
        boardMemberIds.pop();
        boardMemberIds.push(opponentId);
      }
      
      // Create references for board members
      game.boardMembers = boardMemberIds.map(id => ({
        _key: id,
        _ref: id,
        _type: 'reference'
      }));
    }
    
    // Create the game in Sanity
    const result = await client.create(game);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating game:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create game',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}