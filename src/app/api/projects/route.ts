import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { githubService } from '@/lib/github';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const language = searchParams.get('language');
    const sortBy = searchParams.get('sort') || 'updatedAt';
    const order = searchParams.get('order') || 'desc';
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    // If userId is provided, only show projects tracked by that user
    if (userId) {
      where.trackedBy = {
        some: {
          id: userId
        }
      };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (language) {
      where.language = language;
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = order;

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          versions: {
            orderBy: { publishedAt: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              versions: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      totalCount,
      hasMore: skip + limit < totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
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
    const { fullName } = body;
    const userId = session.user.id;

    if (!fullName) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    // Check if project already exists
    const existingProject = await prisma.project.findUnique({
      where: { fullName },
    });

    let project;
    if (existingProject) {
      // Project exists, just add user to tracking
      project = await prisma.project.update({
        where: { id: existingProject.id },
        data: {
          trackedBy: {
            connect: { id: userId },
          },
        },
        include: {
          versions: {
            orderBy: { publishedAt: 'desc' },
            take: 5,
          },
        },
      });
    } else {
      // Fetch project data from GitHub
      const githubRepo = await githubService.getRepositoryByFullName(fullName);
      
      // Create new project
      project = await prisma.project.create({
        data: {
          name: githubRepo.name,
          fullName: githubRepo.full_name,
          description: githubRepo.description,
          language: githubRepo.language,
          stars: githubRepo.stargazers_count,
          forks: githubRepo.forks_count,
          watchers: githubRepo.watchers_count,
          avatar: githubRepo.owner.avatar_url,
          homepage: githubRepo.homepage,
          topics: Array.isArray(githubRepo.topics) ? githubRepo.topics.join(',') : githubRepo.topics,
          isPrivate: githubRepo.private,
          isArchived: githubRepo.archived,
          trackedBy: {
            connect: { id: userId },
          },
        },
        include: {
          versions: {
            orderBy: { publishedAt: 'desc' },
            take: 5,
          },
        },
      });

      // Fetch and store initial releases
      try {
        const releases = await githubService.getReleasesByFullName(fullName, 1, 20);
        
        if (releases.length > 0) {
          await prisma.version.createMany({
            data: releases.map(release => ({
              tagName: release.tag_name,
              name: release.name,
              body: release.body,
              isPrerelease: release.prerelease,
              isDraft: release.draft,
              publishedAt: new Date(release.published_at || release.created_at),
              projectId: project.id,
            })),
          });
        }
      } catch (error) {
        console.error('Error fetching initial releases:', error);
        // Continue without failing the project creation
      }
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error adding project:', error);
    return NextResponse.json(
      { error: 'Failed to add project' },
      { status: 500 }
    );
  }
}
