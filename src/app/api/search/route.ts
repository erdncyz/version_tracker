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

    // Add tracking status to results
    const projectsWithTracking = searchResult.items.map(repo => ({
      ...repo,
      isTracked: trackedMap.has(repo.full_name),
      trackedProjectId: trackedMap.get(repo.full_name) || null,
    }));

    return NextResponse.json({
      projects: projectsWithTracking,
      totalCount: searchResult.total_count,
      hasMore: searchResult.incomplete_results,
      page,
      perPage,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search repositories' },
      { status: 500 }
    );
  }
}
