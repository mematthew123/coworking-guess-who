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
    const { gameId } = body;
    
    if (!gameId) {
      return new NextResponse(JSON.stringify({ error: 'Missing gameId' }), { status: 400 });
    }
    
    // Get the Sanity member ID for the current user
    const sanityUserId = await client.fetch(
      `*[_type == "member" && clerkId == $clerkId][0]._id`,
      { clerkId: userId }
    );
    
    if (!sanityUserId) {
      return new NextResponse(JSON.stringify({ error: 'User profile not found' }), { status: 404 });
    }
    
    // Get game data to verify user is a player
    const game = await client.fetch(`
      *[_type == "game" && _id == $gameId][0]{
        playerOne->{_id},
        playerTwo->{_id},
        status
      }
    `, { gameId });
    
    if (!game) {
      return new NextResponse(JSON.stringify({ error: 'Game not found' }), { status: 404 });
    }
    
    // Check if user is a player in this game
    if (game.playerOne._id !== sanityUserId && game.playerTwo._id !== sanityUserId) {
      return new NextResponse(JSON.stringify({ error: 'Not authorized to abandon this game' }), { status: 403 });
    }
    
    // Check if game is already completed or abandoned
    if (game.status !== 'active') {
      return new NextResponse(JSON.stringify({ error: 'Game is not active' }), { status: 400 });
    }
    
    // Update game status to abandoned
    await client
      .patch(gameId)
      .set({ 
        status: 'abandoned',
        endedAt: new Date().toISOString()
      })
      .commit();
      
    return NextResponse.json({
      success: true,
      message: 'Game abandoned successfully'
    });
    
  } catch (error) {
    console.error('Error abandoning game:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to abandon game',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500 }
    );
  }
}