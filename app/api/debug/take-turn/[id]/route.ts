import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function POST(
  request: Request,
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const gameId = url.pathname.split('/').pop();
    if (!gameId) {
      return new NextResponse(
        JSON.stringify({ error: 'Game ID is required' }),
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { playerId } = body;
    
    if (!playerId) {
      return new NextResponse(
        JSON.stringify({ error: 'Player ID is required' }),
        { status: 400 }
      );
    }
    
    // Update the game to set current turn to this player
    const result = await client
      .patch(gameId)
      .set({ currentTurn: playerId })
      .commit();
    
    return NextResponse.json({
      success: true,
      message: 'Turn updated successfully',
      game: result
    });
  } catch (error) {
    console.error('Error taking turn:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update turn' }),
      { status: 500 }
    );
  }
}