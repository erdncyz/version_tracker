import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/github';
import { prisma } from '@/lib/prisma';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');
    const language = searchParams.get('language');
    const minStars = searchParams.get('min_stars');
    const sortBy = searchParams.get('sort') || 'stars';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Build GitHub search query
    let githubQuery = query;
    if (language) {
      githubQuery += ` language:${language}`;
    }
    if (minStars) {
      githubQuery += ` stars:>=${minStars}`;
    }

    // Search repositories on GitHub
    const searchResult = await githubService.searchRepositories(githubQuery, page, perPage);

    // Check which repositories are already tracked
    const fullNames = searchResult.items.map(repo => repo.full_name);
    const trackedProjects = await prisma.project.findMany({
      where: {
        fullName: {
          in: fullNames,
        },
      },
      select: {
        fullName: true,
        id: true,
      },
    });

    const trackedMap = new Map(trackedProjects.map(p => [p.fullName, p.id]));

    // Fetch real release data for each repository
    const allResults = await Promise.all(
      searchResult.items.map(async (repo) => {
        let latestRelease = null;
        
        try {
          // Try to get the latest release for each repository
          latestRelease = await githubService.getLatestReleaseByFullName(repo.full_name);
        } catch (error: any) {
          // If no releases found or error, latestRelease remains null
          console.log(`No releases found for ${repo.full_name}:`, error.message);
        }
        
        return {
          ...repo,
          isTracked: trackedMap.has(repo.full_name),
          trackedProjectId: trackedMap.get(repo.full_name) || null,
          latestRelease
        };
      })
    );

    return NextResponse.json({
      projects: allResults,
      totalCount: searchResult.total_count,
      hasMore: searchResult.incomplete_results,
      page,
      perPage,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    
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
        error: 'Failed to search repositories',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
