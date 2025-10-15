// src/app/api/questions/categories/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0e1e02q1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

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
    const { title, description, icon, questions } = body;
    
    // Create a new question category
    const result = await client.create({
      _type: 'questionCategory',
      title,
      description,
      icon,
      questions: questions || []
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating question category:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create question category' }),
      { status: 500 }
    );
  }
}