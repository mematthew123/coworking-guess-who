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
    const { invitationId, accept } = body;
    
    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }
    
    // Get user's Sanity ID
    const sanityUser = await client.fetch(
      `*[_type == "member" && clerkId == $clerkId][0]._id`,
      { clerkId: userId }
    );
    
    if (!sanityUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Get the invitation to verify the user is the recipient
    const invitation = await client.fetch(`
      *[_type == "gameInvitation" && _id == $invitationId][0]{
        to->{_id}
      }
    `, { invitationId });
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // Verify this user is the invitation recipient
    if (invitation.to._id !== sanityUser) {
      return NextResponse.json(
        { error: 'You are not the recipient of this invitation' }, 
        { status: 403 }
      );
    }
    
    // Update the invitation status
    await client
      .patch(invitationId)
      .set({ status: accept ? 'accepted' : 'declined' })
      .commit();
    
    return NextResponse.json({ 
      success: true, 
      status: accept ? 'accepted' : 'declined'
    });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    return NextResponse.json(
      { error: 'Failed to update invitation' }, 
      { status: 500 }
    );
  }
}