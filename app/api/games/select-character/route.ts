import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { invitationId, characterId } = body;
    
    if (!invitationId || !characterId) {
      return NextResponse.json({ 
        error: 'Invitation ID and character ID are required' 
      }, { status: 400 });
    }
    
    // Get user's Sanity ID
    const currentUser = await client.fetch(
      `*[_type == "member" && clerkId == $clerkId][0]._id`,
      { clerkId: userId }
    );
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Get invitation details
    const invitation = await client.fetch(`
      *[_type == "gameInvitation" && _id == $invitationId][0]{
        from->{_id},
        to->{_id},
        fromCharacterId,
        toCharacterId,
        status
      }
    `, { invitationId });
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // Check invitation status
    if (invitation.status !== 'accepted' && invitation.status !== 'pending') {
      return NextResponse.json({ 
        error: 'This invitation cannot be updated' 
      }, { status: 400 });
    }
    
    // Determine if user is "from" or "to"
    const isFromUser = invitation.from._id === currentUser;
    const isToUser = invitation.to._id === currentUser;
    
    if (!isFromUser && !isToUser) {
      return NextResponse.json({ 
        error: 'You are not part of this invitation' 
      }, { status: 403 });
    }
    
    // Update the character selection based on which user is making the request
    await client
      .patch(invitationId)
      .set({
        [isFromUser ? 'fromCharacterId' : 'toCharacterId']: characterId
      })
      .commit();
    
    // Check if both players have selected characters
    const updatedInvitation = await client.fetch(`
      *[_type == "gameInvitation" && _id == $invitationId][0]{
        fromCharacterId,
        toCharacterId
      }
    `, { invitationId });
    
    const bothPlayersReady = 
      updatedInvitation.fromCharacterId && 
      updatedInvitation.toCharacterId;
    
    return NextResponse.json({ 
      success: true, 
      characterId,
      bothPlayersReady
    });
  } catch (error) {
    console.error('Error selecting character:', error);
    return NextResponse.json({ 
      error: 'Failed to select character',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}