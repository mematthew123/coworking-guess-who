// src/app/api/members/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';

// Create a server-side Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(request: Request) {
  try {
    // Get the Clerk user
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { name, profession, email, gameParticipation } = body;
    
    // Create a member in Sanity
    const result = await client.create({
      _type: 'member',
      name,
      profession,
      email,
      clerkId: userId,
      gameParticipation,
      joinDate: new Date().toISOString()
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating member:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create member' }),
      { status: 500 }
    );
  }
}