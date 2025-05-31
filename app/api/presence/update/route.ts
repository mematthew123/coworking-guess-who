import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

// How recent a user needs to be to be considered "online"
const ONLINE_THRESHOLD_MINUTES = 5;
const AWAY_THRESHOLD_MINUTES = 30;

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    // Get Sanity user ID from Clerk ID
    const sanityUserId = await client.fetch(
      `*[_type == "member" && clerkId == $clerkId][0]._id`,
      { clerkId: userId }
    );
    
    if (!sanityUserId) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      );
    }
    
    // Update last active timestamp and set status to online
    await client
      .patch(sanityUserId)
      .set({ 
        lastActive: new Date().toISOString(),
        onlineStatus: 'online'
      })
      .commit();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating presence:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update presence' }),
      { status: 500 }
    );
  }
}

// Background job to update statuses of inactive users
export async function GET() {
  try {
    // Find all members who are "online" but haven't been active recently
    const now = new Date();
    const onlineThreshold = new Date(now.getTime() - ONLINE_THRESHOLD_MINUTES * 60 * 1000);
    const awayThreshold = new Date(now.getTime() - AWAY_THRESHOLD_MINUTES * 60 * 1000);
    
    // Get recently inactive users
    const inactiveUsers = await client.fetch(`
      *[_type == "member" && (
        (onlineStatus == "online" && lastActive < $onlineThreshold) ||
        (onlineStatus == "away" && lastActive < $awayThreshold)
      )] {
        _id,
        lastActive,
        onlineStatus
      }
    `, { 
      onlineThreshold: onlineThreshold.toISOString(),
      awayThreshold: awayThreshold.toISOString()
    });
    
    // Update statuses based on inactivity
    for (const user of inactiveUsers) {
      const lastActive = new Date(user.lastActive);
      const newStatus = lastActive < awayThreshold ? 'offline' : 'away';
      
      await client
        .patch(user._id)
        .set({ onlineStatus: newStatus })
        .commit();
    }
    
    return NextResponse.json({ 
      updated: inactiveUsers.length,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Error updating presence statuses:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update presence statuses' }),
      { status: 500 }
    );
  }
}