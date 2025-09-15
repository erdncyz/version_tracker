'use client';

import { useState } from 'react';
import { Star, GitFork, Eye, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatNumber, formatRelativeTime, getVersionType, getVersionColor } from '@/lib/utils';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  isTracked?: boolean;
  onTrack: (projectId: string) => void;
  onUntrack: (projectId: string) => void;
  onRefresh: (projectId: string) => void;
}

export function ProjectCard({ 
  project, 
  isTracked = false, 
  onTrack, 
  onUntrack, 
  onRefresh 
}: ProjectCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const latestVersion = project.versions?.[0];

  const handleTrack = async () => {
    setIsLoading(true);
    try {
      if (isTracked) {
        await onUntrack(project.id);
      } else {
        await onTrack(project.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await onRefresh(project.id);
    } finally {
      setIsLoading(false);
    }
  };

  const versionType = latestVersion ? getVersionType(latestVersion.tagName) : 'stable';
  const versionColor = getVersionColor(versionType);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={project.avatar || undefined} alt={project.name} />
              <AvatarFallback>
                {project.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {project.fullName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isTracked && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-8 w-8"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Button
              variant={isTracked ? "destructive" : "default"}
              size="sm"
              onClick={handleTrack}
              disabled={isLoading}
            >
              {isTracked ? (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Untrack
                </>
              ) : (
                'Track'
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {project.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4" />
            <span>{formatNumber(project.stars)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <GitFork className="h-4 w-4" />
            <span>{formatNumber(project.forks)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{formatNumber(project.watchers)}</span>
          </div>
        </div>

        {/* Latest Version */}
        {latestVersion && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Latest:</span>
              <Badge variant="outline" className={versionColor}>
                {latestVersion.tagName}
              </Badge>
              {latestVersion.isPrerelease && (
                <Badge variant="warning">Pre-release</Badge>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {formatRelativeTime(latestVersion.publishedAt)}
            </span>
          </div>
        )}

        {/* Topics */}
        {project.topics && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.topics.split(',').slice(0, 3).map((topic, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {topic.trim()}
              </Badge>
            ))}
            {project.topics.split(',').length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.topics.split(',').length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            {project.language && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                {project.language}
              </span>
            )}
            <span>Updated {formatRelativeTime(project.updatedAt)}</span>
          </div>
          {project.homepage && (
            <Button variant="ghost" size="sm" asChild className="h-6 px-2">
              <a href={project.homepage} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
