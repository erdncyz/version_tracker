import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includePrereleases = searchParams.get('include_prereleases') === 'true';

    const skip = (page - 1) * limit;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const where: any = { projectId };
    
    if (!includePrereleases) {
      where.isPrerelease = false;
    }

    const [versions, totalCount] = await Promise.all([
      prisma.version.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
        include: {
          project: {
            select: {
              name: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.version.count({ where }),
    ]);

    return NextResponse.json({
      versions,
      totalCount,
      hasMore: skip + limit < totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}
