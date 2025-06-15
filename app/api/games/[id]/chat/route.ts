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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const gameId = params.id;

    // Fetch the game with chat messages
    const game = await client.fetch(
      `*[_type == "game" && _id == $gameId][0]{
        _id,
        chat[] {
          _key,
          senderId,
          senderName,
          message,
          timestamp
        }
      }`,
      { gameId }
    );

    if (!game) {
      return new NextResponse('Game not found', { status: 404 });
    }

    return NextResponse.json({ 
      messages: game.chat || []
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}