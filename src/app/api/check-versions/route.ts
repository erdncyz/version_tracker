import { NextRequest, NextResponse } from 'next/server';
import { versionChecker } from '@/lib/version-checker';

export async function POST(request: NextRequest) {
  try {
    const results = await versionChecker.checkAllProjects();
    
    return NextResponse.json({
      success: true,
      checkedProjects: results.length,
      projectsWithUpdates: results.filter(r => r.newVersions.length > 0).length,
      results,
    });
  } catch (error) {
    console.error('Error checking versions:', error);
    return NextResponse.json(
      { error: 'Failed to check versions' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const isRunning = versionChecker.isPeriodicCheckRunning();
    
    return NextResponse.json({
      isRunning,
      message: isRunning ? 'Periodic version checking is active' : 'Periodic version checking is not running',
    });
  } catch (error) {
    console.error('Error getting version check status:', error);
    return NextResponse.json(
      { error: 'Failed to get version check status' },
      { status: 500 }
    );
  }
}
