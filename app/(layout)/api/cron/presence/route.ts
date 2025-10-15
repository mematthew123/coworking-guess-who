import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify this is being called by Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Call the presence cleanup endpoint
    const baseUrl = process.env.NEXT_PUBLIC_URL || `https://${request.headers.get('host')}`;
    const response = await fetch(`${baseUrl}/api/presence/update`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`Presence cleanup failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}