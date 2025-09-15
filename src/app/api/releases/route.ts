import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/github';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fullName = searchParams.get('fullName');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');

    if (!fullName) {
      return NextResponse.json(
        { error: 'fullName parameter is required' },
        { status: 400 }
      );
    }

    // Fetch all releases for the repository
    const releases = await githubService.getReleasesByFullName(fullName, page, perPage);

    return NextResponse.json({
      releases,
      page,
      perPage,
      hasMore: releases.length === perPage,
    });
  } catch (error: any) {
    console.error('Releases API error:', error);
    
    // Check if it's a GitHub API rate limit error
    if (error.message?.includes('rate limit') || error.status === 403) {
      return NextResponse.json(
        { 
          error: 'GitHub API rate limit exceeded. Please try again later or add a GitHub token for higher limits.',
          details: 'Without authentication, GitHub allows only 60 requests per hour.'
        },
        { status: 429 }
      );
    }
    
    // Check if it's a network error
    if (error.message?.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Network error. Please check your internet connection.',
          details: error.message
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch releases',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
