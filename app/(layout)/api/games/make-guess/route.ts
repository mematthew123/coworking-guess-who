import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    
    const body = await request.json();
    const { gameId, memberId } = body;
    
    if (!gameId || !memberId) {
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
        playerOne->{_id},
        playerTwo->{_id},
        playerOneTarget->{_id},
        playerTwoTarget->{_id},
        currentTurn
      }
    `, { gameId });
    
    if (!game) {
      return new NextResponse(JSON.stringify({ error: 'Game not found' }), { status: 404 });
    }
    
    // Check if it's the user's turn
    if (game.currentTurn !== sanityUserId) {
      return new NextResponse(JSON.stringify({ error: 'Not your turn' }), { status: 403 });
    }
    
    // Determine the target - the logic was backwards!
    // playerOneTarget is what Player One is trying to guess (Player Two's character)
    // playerTwoTarget is what Player Two is trying to guess (Player One's character)
    const playerOneId = game.playerOne._id;
    const playerTwoId = game.playerTwo._id;
    const targetMemberId = sanityUserId === playerOneId
      ? game.playerOneTarget._id  // Player 1 is trying to guess playerOneTarget
      : game.playerTwoTarget._id;  // Player 2 is trying to guess playerTwoTarget
    
    const isCorrect = memberId === targetMemberId;
    
    if (isCorrect) {
      // End the game
      await client
        .patch(gameId)
        .set({ 
          status: 'completed',
          winner: sanityUserId,
          endedAt: new Date().toISOString()
        })
        .commit();
        
      return NextResponse.json({
        success: true,
        correct: true,
        gameOver: true,
        winner: sanityUserId
      });
    } else {
      // Wrong guess, switch turns
      await client
        .patch(gameId)
        .set({ 
          currentTurn: sanityUserId === playerOneId ? playerTwoId : playerOneId
        })
        .commit();
        
      return NextResponse.json({
        success: true,
        correct: false,
        nextTurn: sanityUserId === playerOneId ? playerTwoId : playerOneId
      });
    }
    
  } catch (error) {
    console.error('Error making guess:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to make guess',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500 }
    );
  }
}