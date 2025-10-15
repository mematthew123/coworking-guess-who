import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function POST(request: Request) {
  try {
    // Get authentication details with better error handling
    const authResult = await auth();
    const userId = authResult?.userId;
    
    console.log("Auth check - userId:", userId);
    
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
    
    // Add a small delay to ensure the character selection has been saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the invitation with character selections AND check if game already exists
    const invitation = await client.fetch(`
      *[_type == "gameInvitation" && _id == $invitationId][0]{
        _id,
        from->{_id},
        to->{_id},
        fromCharacterId,
        toCharacterId,
        status,
        gameId
      }
    `, { invitationId });
    
    console.log('Fetched invitation:', invitation);
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // IMPORTANT: Check if a game was already created for THIS invitation
    if (invitation.gameId) {
      console.log('Game already created for this invitation:', invitation.gameId);
      return NextResponse.json({ gameId: invitation.gameId });
    }
    
    // Verify that the user is part of this invitation
    const userSanityId = sanityUser._id;
    if (invitation.from._id !== userSanityId && invitation.to._id !== userSanityId) {
      console.error("User is not part of this invitation");
      return NextResponse.json({ error: 'You are not authorized to access this invitation' }, { status: 403 });
    }
    
    // Verify that both players have selected characters
    if (!invitation.fromCharacterId || !invitation.toCharacterId) {
      console.error('Missing character selections:', {
        fromCharacterId: invitation.fromCharacterId,
        toCharacterId: invitation.toCharacterId
      });
      
      // Re-fetch to ensure we have the latest data
      const updatedInvitation = await client.fetch(`
        *[_type == "gameInvitation" && _id == $invitationId][0]{
          fromCharacterId,
          toCharacterId
        }
      `, { invitationId });
      
      console.log('Re-fetched invitation:', updatedInvitation);
      
      if (!updatedInvitation?.fromCharacterId || !updatedInvitation?.toCharacterId) {
        return NextResponse.json({ 
          error: 'Both players must select characters',
          details: {
            fromCharacterSelected: !!updatedInvitation?.fromCharacterId,
            toCharacterSelected: !!updatedInvitation?.toCharacterId
          }
        }, { status: 400 });
      }
      
      // Update the invitation object with the latest data
      invitation.fromCharacterId = updatedInvitation.fromCharacterId;
      invitation.toCharacterId = updatedInvitation.toCharacterId;
    }
    
    // Create board members from all participating members
    const allParticipatingMembers = await client.fetch(`
      *[_type == "member" && gameParticipation == true]._id
    `);
    
    // Shuffle and select a subset for the board (16-20 members)
    const shuffledMembers = [...allParticipatingMembers].sort(() => 0.5 - Math.random());
    const boardSize = Math.min(Math.floor(Math.random() * 5) + 16, shuffledMembers.length);
    let boardMemberIds = shuffledMembers.slice(0, boardSize);
    
    // Ensure both players' selected characters are in the board
    if (!boardMemberIds.includes(invitation.fromCharacterId)) {
      boardMemberIds = boardMemberIds.slice(0, -1);
      boardMemberIds.push(invitation.fromCharacterId);
    }
    if (!boardMemberIds.includes(invitation.toCharacterId)) {
      boardMemberIds = boardMemberIds.slice(0, -1);
      boardMemberIds.push(invitation.toCharacterId);
    }
    
    console.log('Creating game with board members:', boardMemberIds.length);
    
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
      moves: [],
      chat: []
    });
    
    console.log('Game created:', game._id);
    
    // Update invitation with game ID and mark as completed
    await client
      .patch(invitationId)
      .set({
        status: 'completed',
        gameId: game._id
      })
      .commit();
    
    return NextResponse.json({ gameId: game._id });
  } catch (error) {
    console.error('Error in create-from-invitation:', error);
    return NextResponse.json({ 
      error: 'Failed to create game',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}