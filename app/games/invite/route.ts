import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { opponentId } = body;
    
    if (!opponentId) {
      return new NextResponse(
        JSON.stringify({ error: 'Opponent ID is required' }),
        { status: 400 }
      );
    }
    
    // Get the current user's Sanity ID
    const currentUser = await client.fetch(`
      *[_type == "member" && clerkId == $clerkId][0]{ _id, name }
    `, { clerkId: userId });
    
    if (!currentUser) {
      return new NextResponse(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404 }
      );
    }
    
    // Check if there's already a pending invitation
    const existingInvitation = await client.fetch(`
      *[_type == "gameInvitation" && 
        ((from._ref == $currentUserId && to._ref == $opponentId) || 
         (from._ref == $opponentId && to._ref == $currentUserId)) && 
        status == "pending"
      ][0]
    `, { 
      currentUserId: currentUser._id,
      opponentId
    });
    
    if (existingInvitation) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'There is already a pending invitation between these players',
          invitation: existingInvitation
        }),
        { status: 409 } // Conflict
      );
    }
    
    // Create a new game invitation
    const invitation = await client.create({
      _type: 'gameInvitation',
      from: { _type: 'reference', _ref: currentUser._id },
      to: { _type: 'reference', _ref: opponentId },
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min expiry
    });
    
    return NextResponse.json({ invitation });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create invitation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    );
  }
}