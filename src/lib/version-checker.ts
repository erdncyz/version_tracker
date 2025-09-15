import { prisma } from './prisma';
import { githubService } from './github';

export interface VersionCheckResult {
  projectId: string;
  projectName: string;
  newVersions: Array<{
    tagName: string;
    name: string | null;
    body: string | null;
    publishedAt: Date;
    isPrerelease: boolean;
    isDraft: boolean;
  }>;
  error?: string;
}

export class VersionChecker {
  private static instance: VersionChecker;
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): VersionChecker {
    if (!VersionChecker.instance) {
      VersionChecker.instance = new VersionChecker();
    }
    return VersionChecker.instance;
  }

  async checkAllProjects(): Promise<VersionCheckResult[]> {
    if (this.isRunning) {
      console.log('Version check already running, skipping...');
      return [];
    }

    this.isRunning = true;
    const results: VersionCheckResult[] = [];

    try {
      // Get all tracked projects
      const projects = await prisma.project.findMany({
        include: {
          versions: {
            orderBy: { publishedAt: 'desc' },
            take: 1,
          },
          trackedBy: true,
        },
      });

      console.log(`Checking ${projects.length} projects for updates...`);

      for (const project of projects) {
        try {
          const result = await this.checkProject(project);
          if (result) {
            results.push(result);
          }
        } catch (error) {
          console.error(`Error checking project ${project.fullName}:`, error);
          results.push({
            projectId: project.id,
            projectName: project.fullName,
            newVersions: [],
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      console.log(`Version check completed. Found ${results.length} projects with updates.`);
    } catch (error) {
      console.error('Error during version check:', error);
    } finally {
      this.isRunning = false;
    }

    return results;
  }

  private async checkProject(project: any): Promise<VersionCheckResult | null> {
    try {
      // Fetch latest releases from GitHub
      const releases = await githubService.getReleasesByFullName(project.fullName, 1, 10);
      
      if (releases.length === 0) {
        return null;
      }

      // Get existing version tags
      const existingVersions = await prisma.version.findMany({
        where: { projectId: project.id },
        select: { tagName: true },
      });
      
      const existingTags = new Set(existingVersions.map(v => v.tagName));
      
      // Find new releases
      const newReleases = releases.filter(release => !existingTags.has(release.tag_name));
      
      if (newReleases.length === 0) {
        return null;
      }

      // Store new versions in database
      const newVersions = [];
      for (const release of newReleases) {
        const version = await prisma.version.create({
          data: {
            tagName: release.tag_name,
            name: release.name,
            body: release.body,
            isPrerelease: release.prerelease,
            isDraft: release.draft,
            publishedAt: new Date(release.published_at || release.created_at),
            projectId: project.id,
          },
        });

        newVersions.push({
          tagName: version.tagName,
          name: version.name,
          body: version.body,
          publishedAt: version.publishedAt,
          isPrerelease: version.isPrerelease,
          isDraft: version.isDraft,
        });
      }

      // Update project metadata
      const githubRepo = await githubService.getRepositoryByFullName(project.fullName);
      await prisma.project.update({
        where: { id: project.id },
        data: {
          stars: githubRepo.stargazers_count,
          forks: githubRepo.forks_count,
          watchers: githubRepo.watchers_count,
          lastChecked: new Date(),
        },
      });

      // Create notifications for users tracking this project
      for (const user of project.trackedBy) {
        for (const version of newVersions) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: `New release: ${version.tagName}`,
              message: `A new version ${version.tagName} has been released for ${project.name}`,
              type: 'new_release',
              projectId: project.id,
            },
          });
        }
      }

      return {
        projectId: project.id,
        projectName: project.fullName,
        newVersions,
      };
    } catch (error) {
      throw error;
    }
  }

  startPeriodicCheck(intervalMinutes: number = 60): void {
    if (this.intervalId) {
      console.log('Periodic version check already running');
      return;
    }

    console.log(`Starting periodic version check every ${intervalMinutes} minutes`);
    
    // Run immediately
    this.checkAllProjects();
    
    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.checkAllProjects();
    }, intervalMinutes * 60 * 1000);
  }

  stopPeriodicCheck(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Stopped periodic version check');
    }
  }

  isPeriodicCheckRunning(): boolean {
    return this.intervalId !== null;
  }
}

export const versionChecker = VersionChecker.getInstance();
