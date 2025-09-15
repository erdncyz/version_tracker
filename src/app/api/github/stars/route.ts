import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { githubService } from '@/lib/github';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's GitHub access token from session
    const githubToken = session.accessToken;
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub access token not found. Please re-authenticate.' },
        { status: 401 }
      );
    }

    // Create GitHub service with user's token
    const userGithubService = new (await import('@/lib/github')).default(githubToken);
    
    // Fetch user's starred repositories
    const starredRepos = await userGithubService.getUserStarredRepositories();

    return NextResponse.json({
      starredRepositories: starredRepos,
      count: starredRepos.length,
    });
  } catch (error: any) {
    console.error('GitHub stars API error:', error);
    
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'GitHub API rate limit exceeded. Please try again later.',
          details: 'You may have reached the rate limit for GitHub API requests.'
        },
        { status: 429 }
      );
    }
    
    if (error.status === 401) {
      return NextResponse.json(
        { 
          error: 'GitHub authentication failed. Please re-authenticate.',
          details: 'Your GitHub token may have expired.'
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch starred repositories',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { syncAll = false } = body;
    const userId = session.user.id;

    // Get user's GitHub access token from session
    const githubToken = session.accessToken;
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub access token not found. Please re-authenticate.' },
        { status: 401 }
      );
    }

    // Create GitHub service with user's token
    const userGithubService = new (await import('@/lib/github')).default(githubToken);
    
    // Fetch user's starred repositories
    const starredRepos = await userGithubService.getUserStarredRepositories();

    // Get existing tracked projects for this user
    const existingProjects = await prisma.project.findMany({
      where: {
        trackedBy: {
          some: {
            userId: userId
          }
        }
      },
      select: {
        fullName: true
      }
    });

    const existingFullNames = new Set(existingProjects.map(p => p.fullName));

    // Filter out already tracked repositories
    const newRepos = starredRepos.filter(repo => !existingFullNames.has(repo.full_name));

    if (newRepos.length === 0) {
      return NextResponse.json({
        message: 'All starred repositories are already tracked',
        added: 0,
        total: starredRepos.length
      });
    }

    // Add new repositories to database
    const addedProjects = [];
    for (const repo of newRepos) {
      try {
        // Check if project already exists in database
        let project = await prisma.project.findUnique({
          where: { fullName: repo.full_name }
        });

        if (!project) {
          // Create new project
          project = await prisma.project.create({
            data: {
              name: repo.name,
              fullName: repo.full_name,
              description: repo.description,
              language: repo.language,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              watchers: repo.watchers_count,
              avatar: repo.owner.avatar_url,
              homepage: repo.homepage,
              topics: Array.isArray(repo.topics) ? repo.topics.join(',') : repo.topics,
              isPrivate: repo.private,
              isArchived: repo.archived,
              lastChecked: new Date(),
              createdAt: new Date(repo.created_at),
              updatedAt: new Date(repo.updated_at),
            }
          });
        }

        // Connect user to project
        await prisma.user.update({
          where: { id: userId },
          data: {
            trackedProjects: {
              connect: { id: project.id }
            }
          }
        });

        addedProjects.push(project);
      } catch (error) {
        console.error(`Error adding repository ${repo.full_name}:`, error);
        // Continue with other repositories
      }
    }

    return NextResponse.json({
      message: `Successfully added ${addedProjects.length} starred repositories`,
      added: addedProjects.length,
      total: starredRepos.length,
      projects: addedProjects.map(p => ({
        id: p.id,
        name: p.name,
        fullName: p.fullName
      }))
    });
  } catch (error: any) {
    console.error('GitHub stars sync error:', error);
    
    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'GitHub API rate limit exceeded. Please try again later.',
          details: 'You may have reached the rate limit for GitHub API requests.'
        },
        { status: 429 }
      );
    }
    
    if (error.status === 401) {
      return NextResponse.json(
        { 
          error: 'GitHub authentication failed. Please re-authenticate.',
          details: 'Your GitHub token may have expired.'
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to sync starred repositories',
        details: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
