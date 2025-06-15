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
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { gameId, message } = body;

    // Get the sender's member info
    const member = await client.fetch(
      `*[_type == "member" && clerkId == $clerkId][0]{_id, name}`,
      { clerkId: userId }
    );

    if (!member) {
      return new NextResponse('Member not found', { status: 404 });
    }

    // Create the new message object with a unique key
    const newMessage = {
      _key: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      _type: 'chatMessage',
      userId: member._id,
      userName: member.name,
      content: message.content, // This should already be in Portable Text format
      timestamp: new Date().toISOString(),
      gameEvent: message.gameEvent || undefined
    };

    // Append the message to the game's chat array
    const result = await client
      .patch(gameId)
      .setIfMissing({ chat: [] })
      .append('chat', [newMessage])
      .commit();

    return NextResponse.json({ 
      success: true, 
      message: newMessage,
      gameId: result._id 
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}