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
    projects: Array<{
      id: string;
      name: string;
      fullName: string;
    }>;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [allActivities, setAllActivities] = useState<DashboardStats['recentActivity']>([]);
  const activitiesPerPage = 5;
  
  // Top Languages pagination
  const [currentLanguagePage, setCurrentLanguagePage] = useState(1);
  const [allLanguages, setAllLanguages] = useState<DashboardStats['topLanguages']>([]);
  const languagesPerPage = 5;
  
  // Project Overview pagination
  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const projectsPerPage = 5;

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

    // Top languages with project details
    const languageGroups = projects.reduce((acc, project) => {
      if (project.language) {
        if (!acc[project.language]) {
          acc[project.language] = [];
        }
        acc[project.language].push({
          id: project.id,
          name: project.name,
          fullName: project.fullName
        });
      }
      return acc;
    }, {} as Record<string, Array<{ id: string; name: string; fullName: string }>>);

    const allTopLanguages = Object.entries(languageGroups)
      .map(([language, projects]) => ({ 
        language, 
        count: projects.length,
        projects: projects
      }))
      .sort((a, b) => b.count - a.count);

    // Set all languages for pagination
    setAllLanguages(allTopLanguages);

    // Get first page languages
    const topLanguages = allTopLanguages.slice(0, languagesPerPage);

    // Recent activity - get all activities
    const allRecentActivity = projects
      .flatMap(project => [
        ...(project.versions?.slice(0, 3).map(version => ({
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
        {
          type: 'project_updated' as const,
          message: `Project ${project.name} was updated`,
          timestamp: new Date(project.updatedAt),
          projectId: project.id,
        },
      ])
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Set all activities for pagination
    setAllActivities(allRecentActivity);

    // Get first page activities
    const recentActivity = allRecentActivity.slice(0, activitiesPerPage);

    setStats({
      totalProjects,
      totalVersions,
      outdatedProjects,
      recentReleases,
      topLanguages,
      recentActivity,
    });
  }, [projects]);

  // Pagination functions
  const totalPages = Math.ceil(allActivities.length / activitiesPerPage);
  const currentActivities = allActivities.slice(
    (currentPage - 1) * activitiesPerPage,
    currentPage * activitiesPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Top Languages pagination
  const totalLanguagePages = Math.ceil(allLanguages.length / languagesPerPage);
  const currentLanguages = allLanguages.slice(
    (currentLanguagePage - 1) * languagesPerPage,
    currentLanguagePage * languagesPerPage
  );

  const handleLanguagePageChange = (page: number) => {
    setCurrentLanguagePage(page);
  };

  // Project Overview pagination
  const totalProjectPages = Math.ceil(projects.length / projectsPerPage);
  const currentProjects = projects.slice(
    (currentProjectPage - 1) * projectsPerPage,
    currentProjectPage * projectsPerPage
  );

  const handleProjectPageChange = (page: number) => {
    setCurrentProjectPage(page);
  };

  const formatActivityDate = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return timestamp.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

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
            <div className="flex items-center justify-between">
              <CardTitle>Top Languages</CardTitle>
              {allLanguages.length > languagesPerPage && (
                <div className="text-sm text-gray-500">
                  {allLanguages.length} total languages
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentLanguages.map(({ language, count, projects }) => (
                <div key={language} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {language.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{language}</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-medium">
                      {count} project{count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="ml-7 space-y-1">
                    {projects.map((project) => (
                      <div key={project.id} className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-700 font-medium">{project.name}</span>
                        <span className="text-xs text-gray-500">({project.fullName})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {currentLanguages.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No projects tracked yet
                </p>
              )}
            </div>
            
            {/* Top Languages Pagination */}
            {totalLanguagePages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Page {currentLanguagePage} of {totalLanguagePages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLanguagePageChange(currentLanguagePage - 1)}
                    disabled={currentLanguagePage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalLanguagePages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleLanguagePageChange(pageNum)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentLanguagePage === pageNum
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handleLanguagePageChange(currentLanguagePage + 1)}
                    disabled={currentLanguagePage === totalLanguagePages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              {allActivities.length > activitiesPerPage && (
                <div className="text-sm text-gray-500">
                  {allActivities.length} total activities
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    {activity.type === 'new_release' && (
                      <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                    )}
                    {activity.type === 'project_added' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-1"></div>
                    )}
                    {activity.type === 'project_updated' && (
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm text-gray-900 font-medium">
                        {activity.message}
                      </p>
                      {activity.projectId && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {projects.find(p => p.id === activity.projectId)?.name || 'Project'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">
                        {formatActivityDate(activity.timestamp)}
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs text-gray-500">
                        {activity.timestamp.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {currentActivities.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Overview</CardTitle>
            {projects.length > projectsPerPage && (
              <div className="text-sm text-gray-500">
                {projects.length} total projects
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentProjects.map((project) => {
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
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className="bg-green-50 text-green-700 border-green-200 font-medium"
                        >
                          {latestVersion.tagName}
                        </Badge>
                        <span className="text-xs text-green-600 font-medium">
                          Latest
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(project.updatedAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {currentProjects.length === 0 && (
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
          
          {/* Project Overview Pagination */}
          {totalProjectPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Page {currentProjectPage} of {totalProjectPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleProjectPageChange(currentProjectPage - 1)}
                  disabled={currentProjectPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalProjectPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleProjectPageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          currentProjectPage === pageNum
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handleProjectPageChange(currentProjectPage + 1)}
                  disabled={currentProjectPage === totalProjectPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
