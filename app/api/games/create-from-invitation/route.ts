// app/api/games/create-from-invitation/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function POST(request: Request) {
  try {
    // Get authentication details with better error handling
    const authResult = await auth();
    const userId = authResult?.userId;
    
    console.log("Auth check - userId:", userId); // Debug logging
    
    if (!userId) {
      console.error("Authentication failed - no userId found");
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }
    
    // Parse request body with error handling
    let invitationId;
    try {
      const body = await request.json();
      invitationId = body.invitationId;
    } catch (error) {
      console.error("Failed to parse request JSON:", error);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }
    
    // Get user's Sanity ID for verification
    const sanityUser = await client.fetch(
      `*[_type == "member" && clerkId == $clerkId][0]{_id}`,
      { clerkId: userId }
    );
    
    if (!sanityUser) {
      console.error(`No Sanity user found for Clerk ID: ${userId}`);
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    // Get the invitation with character selections
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
    
    // Verify that the user is part of this invitation
    const userSanityId = sanityUser._id;
    if (invitation.from._id !== userSanityId && invitation.to._id !== userSanityId) {
      console.error("User is not part of this invitation");
      return NextResponse.json({ error: 'You are not authorized to access this invitation' }, { status: 403 });
    }
    
    // Verify that both players have selected characters
    if (!invitation.fromCharacterId || !invitation.toCharacterId) {
      return NextResponse.json({ error: 'Both players must select characters' }, { status: 400 });
    }
    
      
    // Create board members from all participating members
    const allParticipatingMembers = await client.fetch(`
      *[_type == "member" && gameParticipation == true]._id
    `);
    
    // Shuffle and select a subset for the board (16-20 members)
    const shuffledMembers = [...allParticipatingMembers].sort(() => 0.5 - Math.random());
    const boardSize = Math.min(Math.floor(Math.random() * 5) + 16, shuffledMembers.length);
    const boardMemberIds = shuffledMembers.slice(0, boardSize);
    
    // Ensure both players' selected characters are in the board
    if (!boardMemberIds.includes(invitation.fromCharacterId)) {
      boardMemberIds[Math.floor(Math.random() * boardMemberIds.length)] = invitation.fromCharacterId;
    }
    if (!boardMemberIds.includes(invitation.toCharacterId)) {
      boardMemberIds[Math.floor(Math.random() * boardMemberIds.length)] = invitation.toCharacterId;
    }
    
    // Create the game
    const game = await client.create({
      _type: 'game',
      startedAt: new Date().toISOString(),
      status: 'active',
      playerOne: { _type: 'reference', _ref: invitation.from._id },
      playerTwo: { _type: 'reference', _ref: invitation.to._id },
      playerOneTarget: { _type: 'reference', _ref: invitation.toCharacterId }, // Player One tries to guess Player Two's character
      playerTwoTarget: { _type: 'reference', _ref: invitation.fromCharacterId }, // Player Two tries to guess Player One's character
      boardMembers: boardMemberIds.map(id => ({
        _key: id,
        _ref: id,
        _type: 'reference'
      })),
      currentTurn: invitation.from._id, // Inviter goes first
      moves: []
    });
    
    // Update invitation with game ID and mark as completed
    await client
      .patch(invitationId)
      .set({
        status: 'completed',
        gameId: game._id
      })
      .commit();
    
    return NextResponse.json({ gameId: "success" });
  } catch (error) {
    console.error('Error in create-from-invitation:', error);
    return NextResponse.json({ 
      error: 'Failed to create game',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}