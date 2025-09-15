'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Package, AlertTriangle, Clock, Star, GitFork } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { formatNumber, formatRelativeTime } from '@/lib/utils';

interface DashboardStats {
  totalProjects: number;
  totalVersions: number;
  outdatedProjects: number;
  recentReleases: number;
  topLanguages: Array<{
    language: string;
    count: number;
  }>;
  recentActivity: Array<{
    type: 'new_release' | 'project_added' | 'project_updated';
    message: string;
    timestamp: Date;
    projectId?: string;
  }>;
}

interface DashboardProps {
  projects: Project[];
}

export function Dashboard({ projects }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalVersions: 0,
    outdatedProjects: 0,
    recentReleases: 0,
    topLanguages: [],
    recentActivity: [],
  });

  useEffect(() => {
    // Calculate stats from projects
    const totalProjects = projects.length;
    const totalVersions = projects.reduce((sum, project) => sum + (project.versions?.length || 0), 0);
    
    // Count outdated projects (projects with versions older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const outdatedProjects = projects.filter(project => {
      const latestVersion = project.versions?.[0];
      return latestVersion && new Date(latestVersion.publishedAt) < thirtyDaysAgo;
    }).length;

    // Count recent releases (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentReleases = projects.reduce((sum, project) => {
      return sum + (project.versions?.filter(version => 
        new Date(version.publishedAt) > sevenDaysAgo
      ).length || 0);
    }, 0);

    // Top languages
    const languageCounts = projects.reduce((acc, project) => {
      if (project.language) {
        acc[project.language] = (acc[project.language] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topLanguages = Object.entries(languageCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent activity
    const recentActivity = projects
      .flatMap(project => [
        ...(project.versions?.slice(0, 2).map(version => ({
          type: 'new_release' as const,
          message: `New release ${version.tagName} for ${project.name}`,
          timestamp: new Date(version.publishedAt),
          projectId: project.id,
        })) || []),
        {
          type: 'project_added' as const,
          message: `Started tracking ${project.name}`,
          timestamp: new Date(project.createdAt),
          projectId: project.id,
        },
      ])
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    setStats({
      totalProjects,
      totalVersions,
      outdatedProjects,
      recentReleases,
      topLanguages,
      recentActivity,
    });
  }, [projects]);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = "blue" 
  }: {
    title: string;
    value: number | string;
    icon: any;
    trend?: string;
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Total Versions"
          value={stats.totalVersions}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Outdated Projects"
          value={stats.outdatedProjects}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Recent Releases"
          value={stats.recentReleases}
          icon={Clock}
          color="purple"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Languages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topLanguages.map(({ language, count }) => (
                <div key={language} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">{language}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
              {stats.topLanguages.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No projects tracked yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'new_release' && (
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    )}
                    {activity.type === 'project_added' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    )}
                    {activity.type === 'project_updated' && (
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => {
              const latestVersion = project.versions?.[0];
              const totalStars = project.stars;
              const totalForks = project.forks;

              return (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {project.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.fullName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Star className="h-4 w-4" />
                      <span>{formatNumber(totalStars)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <GitFork className="h-4 w-4" />
                      <span>{formatNumber(totalForks)}</span>
                    </div>
                    {latestVersion && (
                      <Badge variant="outline">
                        {latestVersion.tagName}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(project.updatedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {projects.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No projects tracked yet
                </h3>
                <p className="text-sm text-gray-500">
                  Start by searching for repositories to track their versions.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
