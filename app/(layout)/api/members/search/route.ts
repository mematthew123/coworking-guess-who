import { NextResponse, NextRequest } from 'next/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const searchTerm = searchParams.get('search');
    const profession = searchParams.get('profession');
    const skills = searchParams.getAll('skills');
    
    // Build GROQ query dynamically
    let groqQuery = '*[_type == "member" && gameParticipation == true';
    const params: Record<string, unknown> = {};
    
    // Add search filter with scoring
    if (searchTerm) {
      groqQuery = `${groqQuery} && (
        name match $searchTerm ||
        profession match $searchTerm ||
        company match $searchTerm ||
        bio match $searchTerm ||
        $searchTerm in skills[]
      )`;
      params.searchTerm = `${searchTerm}*`; // Wildcard for partial matches
    }
    
    // Add profession filter
    if (profession && profession !== 'all') {
      groqQuery += ' && profession == $profession';
      params.profession = profession;
    }
    
    // Add skills filter
    if (skills && skills.length > 0) {
      groqQuery += ' && count((skills[])[@ in $skills]) == $skillsCount';
      params.skills = skills;
      params.skillsCount = skills.length;
    }
    
    groqQuery += ']';
    
    // Add scoring for relevance when searching
    if (searchTerm) {
      groqQuery += ` | score(
        boost(name match $searchTerm, 5),
        boost(profession match $searchTerm, 3),
        boost(company match $searchTerm, 2),
        boost(bio match $searchTerm, 1),
        boost($searchTerm in skills[], 2)
      ) | order(_score desc, name asc)`;
    } else {
      groqQuery += ' | order(name asc)';
    }
    
    // Add projections
    groqQuery += ` {
      _id,
      name,
      profession,
      company,
      skills,
      bio,
      "image": image{
        "asset": asset->{
          url
        }
      },
      ${searchTerm ? '_score,' : ''}
    }`;
    
    // Allow custom query override
    const finalQuery = query || groqQuery;
    
    // Execute query
    const members = await client.fetch(finalQuery, params);
    
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error searching members:', error);
    return NextResponse.json(
      { error: 'Failed to search members' },
      { status: 500 }
    );
  }
}