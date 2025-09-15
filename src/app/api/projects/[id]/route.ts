import { NextRequest, NextResponse } from 'next/server';
import { githubService } from '@/lib/github';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { publishedAt: 'desc' },
        },
        _count: {
          select: {
            versions: true,
            trackedBy: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body;

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (action === 'refresh') {
      // Fetch latest data from GitHub
      const githubRepo = await githubService.getRepositoryByFullName(project.fullName);
      
      // Update project data
      const updatedProject = await prisma.project.update({
        where: { id: params.id },
        data: {
          name: githubRepo.name,
          description: githubRepo.description,
          language: githubRepo.language,
          stars: githubRepo.stargazers_count,
          forks: githubRepo.forks_count,
          watchers: githubRepo.watchers_count,
          avatar: githubRepo.owner.avatar_url,
          homepage: githubRepo.homepage,
          topics: githubRepo.topics,
          isPrivate: githubRepo.private,
          isArchived: githubRepo.archived,
          lastChecked: new Date(),
        },
        include: {
          versions: {
            orderBy: { publishedAt: 'desc' },
          },
        },
      });

      // Fetch latest releases
      try {
        const releases = await githubService.getReleasesByFullName(project.fullName, 1, 50);
        
        // Get existing versions to avoid duplicates
        const existingVersions = await prisma.version.findMany({
          where: { projectId: params.id },
          select: { tagName: true },
        });
        
        const existingTags = new Set(existingVersions.map(v => v.tagName));
        const newReleases = releases.filter(release => !existingTags.has(release.tag_name));
        
        if (newReleases.length > 0) {
          await prisma.version.createMany({
            data: newReleases.map(release => ({
              tagName: release.tag_name,
              name: release.name,
              body: release.body,
              isPrerelease: release.prerelease,
              isDraft: release.draft,
              publishedAt: new Date(release.published_at || release.created_at),
              projectId: params.id,
            })),
          });
        }
      } catch (error) {
        console.error('Error fetching releases:', error);
      }

      return NextResponse.json(updatedProject);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Remove user from tracking
    await prisma.project.update({
      where: { id: params.id },
      data: {
        trackedBy: {
          disconnect: { id: userId },
        },
      },
    });

    // Check if any users are still tracking this project
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            trackedBy: true,
          },
        },
      },
    });

    // If no users are tracking, delete the project
    if (project && project._count.trackedBy === 0) {
      await prisma.project.delete({
        where: { id: params.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing project:', error);
    return NextResponse.json(
      { error: 'Failed to remove project' },
      { status: 500 }
    );
  }
}
