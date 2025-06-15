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

    // Create the new message object with correct field names matching the schema
    const newMessage = {
      _key: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      _type: 'chatMessage',
      senderId: member._id,  // Changed from userId
      senderName: member.name,  // Changed from userName
      message: message.content,  // Changed from content
      timestamp: new Date().toISOString()
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