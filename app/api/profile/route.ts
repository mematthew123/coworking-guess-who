import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';
import { MemberUpdate } from '@/types/MemberUpdate';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    // Get the member profile
    const member = await client.fetch(
      `*[_type == "member" && clerkId == $clerkId][0]`,
      { clerkId: userId }
    );
    
    if (!member) {
      return new NextResponse(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404 }
      );
    }
    
    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch profile' }),
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    // Get the member document
    const member = await client.fetch(
      `*[_type == "member" && clerkId == $clerkId][0]`,
      { clerkId: userId }
    );
    
    if (!member) {
      return new NextResponse(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404 }
      );
    }
    
    // Parse the update data
    const updates = await request.json();
    
    // Validate the updates (only allow certain fields to be updated)
    const allowedFields = [
      'name',
      'profession',
      'company',
      'bio',
      'skills',
      'interests',
      'workspacePreferences',
      'socialLinks',
      'gameParticipation'
    ];
    
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key as keyof MemberUpdate] = updates[key];
        return obj;
      }, {} as Partial<MemberUpdate>);
    
    // Update the member document
    const result = await client
      .patch(member._id)
      .set(filteredUpdates)
      .commit();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating profile:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update profile' }),
      { status: 500 }
    );
  }
}

// Handle image uploads
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    // Get the member document
    const member = await client.fetch(
      `*[_type == "member" && clerkId == $clerkId][0]`,
      { clerkId: userId }
    );
    
    if (!member) {
      return new NextResponse(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404 }
      );
    }
    
    // Get the image file from form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return new NextResponse(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400 }
      );
    }
    
    // Upload to Sanity
    const asset = await client.assets.upload('image', imageFile);
    
    // Update the member document with the new image
    const result = await client
      .patch(member._id)
      .set({
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        },
      })
      .commit();
    
    return NextResponse.json({ 
      success: true, 
      image: result.image 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to upload image' }),
      { status: 500 }
    );
  }
}