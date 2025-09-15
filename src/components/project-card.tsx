'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Star, GitFork, Eye, ExternalLink, RefreshCw, Trash2, Tag, Calendar, FileText, ExternalLink as ExternalLinkIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatNumber, formatRelativeTime, getVersionType, getVersionColor } from '@/lib/utils';

// Format release notes into readable bullet points
function formatReleaseNotes(body: string): string[] {
  if (!body) return [];
  
  // Clean up the text
  let cleanBody = body
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\r/g, '\n')    // Handle old Mac line endings
    .trim();
  
  // Split by common patterns
  const lines = cleanBody.split('\n');
  const notes: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and version headers (## [version])
    if (!trimmed || trimmed.startsWith('## [') || trimmed.startsWith('### ')) {
      continue;
    }
    
    // Look for bullet points or numbered lists
    if (trimmed.match(/^[-*•]\s+/)) {
      let note = trimmed.replace(/^[-*•]\s+/, '');
      
      // Clean up markdown links: [text](url) -> text
      note = note.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      
      // Clean up commit hashes: (hash) -> removed
      note = note.replace(/\([a-f0-9]{7,}\)/g, '');
      
      // Clean up issue references: (#123) -> #123
      note = note.replace(/\(#(\d+)\)/g, '#$1');
      
      // Clean up extra spaces and parentheses
      note = note.replace(/\s+/g, ' ').replace(/\(\s*\)/g, '').trim();
      
      if (note.length > 0 && note.length < 150) {
        notes.push(note);
      }
    }
    // Look for numbered lists
    else if (trimmed.match(/^\d+\.\s+/)) {
      let note = trimmed.replace(/^\d+\.\s+/, '');
      
      // Clean up markdown links
      note = note.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      note = note.replace(/\([a-f0-9]{7,}\)/g, '');
      note = note.replace(/\(#(\d+)\)/g, '#$1');
      note = note.replace(/\s+/g, ' ').replace(/\(\s*\)/g, '').trim();
      
      if (note.length > 0 && note.length < 150) {
        notes.push(note);
      }
    }
    // Look for lines that start with common change indicators
    else if (trimmed.match(/^(Fixed|Added|Changed|Removed|Updated|Improved|Bug|Feature|Security|Performance|Enhancement)/i)) {
      let note = trimmed;
      
      // Clean up markdown links
      note = note.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      note = note.replace(/\([a-f0-9]{7,}\)/g, '');
      note = note.replace(/\(#(\d+)\)/g, '#$1');
      note = note.replace(/\s+/g, ' ').replace(/\(\s*\)/g, '').trim();
      
      if (note.length < 150) {
        notes.push(note);
      }
    }
    
    // Limit to 4 notes to keep it concise
    if (notes.length >= 4) break;
  }
  
  // If no structured notes found, take first few sentences
  if (notes.length === 0) {
    const sentences = cleanBody.split(/[.!?]+/).filter(s => s.trim().length > 10);
    notes.push(...sentences.slice(0, 2).map(s => s.trim()));
  }
  
  return notes.slice(0, 4);
}
import { Project } from '@/types';

interface Release {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  prerelease: boolean;
  draft: boolean;
  published_at: string | null;
  created_at: string;
  html_url: string;
  assets: Array<{
    name: string;
    download_count: number;
    size: number;
  }>;
}

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
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [allReleases, setAllReleases] = useState<Release[]>([]);
  const [showAllReleases, setShowAllReleases] = useState(false);
  const [loadingReleases, setLoadingReleases] = useState(false);
  
  const latestVersion = project.versions?.[0];
  
  // Get latest release from search results (if available)
  const latestRelease = project.latestRelease;
  
  // Use real release data only - prefer latestRelease from search, fallback to versions array
  const displayRelease = latestRelease || latestVersion;
  
  // Type guard to check if displayRelease is a GitHub release (has tag_name)
  const isGitHubRelease = (release: any): release is { tag_name: string; prerelease: boolean; published_at: string | null; html_url: string; body: string | null } => {
    return release && 'tag_name' in release;
  };
  

  const handleTrack = async () => {
    // Check if user is authenticated
    if (!session) {
      router.push('/auth/signin');
      return;
    }

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
    // Check if user is authenticated
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    try {
      await onRefresh(project.id);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllReleases = async () => {
    if (allReleases.length > 0) {
      setShowAllReleases(!showAllReleases);
      return;
    }

    setLoadingReleases(true);
    try {
      const response = await fetch(`/api/releases?fullName=${encodeURIComponent(project.fullName)}&perPage=20`);
      if (response.ok) {
        const data = await response.json();
        setAllReleases(data.releases);
        setShowAllReleases(true);
      }
    } catch (error) {
      console.error('Error fetching releases:', error);
    } finally {
      setLoadingReleases(false);
    }
  };

  const versionType = latestVersion ? getVersionType(latestVersion.tagName) : 'stable';
  const versionColor = getVersionColor(versionType);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-3">
          {/* Top row: Avatar, title, and action buttons */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={project.avatar || undefined} alt={project.name} />
                <AvatarFallback>
                  {project.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {project.fullName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
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
                className="whitespace-nowrap"
              >
                {isTracked ? (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Untrack
                  </>
                ) : session ? (
                  'Track'
                ) : (
                  'Login to Track'
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {project.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {project.description}
            </p>
          </div>
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

        {/* Releases Section */}
        {(latestVersion || displayRelease) && (
          <div className="mb-3">
            {/* Latest Version Info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Latest:</span>
                <Badge variant="outline" className={`${versionColor} font-mono`}>
                  {latestVersion?.tagName || (isGitHubRelease(displayRelease) ? displayRelease.tag_name : '')}
                </Badge>
                {(latestVersion?.isPrerelease || (isGitHubRelease(displayRelease) && displayRelease.prerelease)) && (
                  <Badge variant="secondary" className="text-xs">Pre-release</Badge>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {formatRelativeTime(latestVersion?.publishedAt || (isGitHubRelease(displayRelease) ? displayRelease.published_at : null) || new Date())}
              </span>
            </div>

            {/* Version Details - Compact */}
            <div className="bg-gray-50 rounded-md p-2 text-xs mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500">Type: <span className="text-gray-700 capitalize">{versionType}</span></span>
                  <span className="text-gray-500">Status: <span className="text-gray-700">{(latestVersion?.isPrerelease || (isGitHubRelease(displayRelease) && displayRelease.prerelease)) ? 'Pre-release' : 'Stable'}</span></span>
                </div>
                <Button
                  variant={showAllReleases ? "outline" : "default"}
                  size="sm"
                  onClick={fetchAllReleases}
                  disabled={loadingReleases}
                  className="h-6 px-2 text-xs"
                >
                  {loadingReleases ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : showAllReleases ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show All
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Latest Release Notes - Compact */}
            {isGitHubRelease(displayRelease) && displayRelease.body && (
              <div className="bg-blue-50 rounded-md p-2 text-xs border border-blue-200">
                <div className="flex items-start space-x-2">
                  <FileText className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-800 mb-1">Release Notes:</div>
                    <div className="space-y-1">
                      {formatReleaseNotes(displayRelease.body).slice(0, 2).map((note, index) => (
                        <div key={index} className="flex items-start space-x-1">
                          <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-blue-700 leading-relaxed text-xs">{note}</span>
                        </div>
                      ))}
                      {formatReleaseNotes(displayRelease.body).length > 2 && (
                        <div className="text-blue-600 text-xs">
                          +{formatReleaseNotes(displayRelease.body).length - 2} more changes...
                        </div>
                      )}
                    </div>
                    {displayRelease.html_url && (
                      <div className="mt-2 pt-1 border-t border-blue-200">
                        <a
                          href={displayRelease.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <span>View full notes</span>
                          <ExternalLinkIcon className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* All Releases */}
            {showAllReleases && allReleases.length > 0 && (
              <div className="bg-blue-50 rounded-md p-3 text-xs border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-blue-800 text-sm flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>Release History</span>
                  </div>
                  <div className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded">
                    {allReleases.length} release{allReleases.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {allReleases.map((release, index) => (
                    <div key={release.id} className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                      {/* Release Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-sm font-mono font-medium bg-blue-100 text-blue-800 border-blue-300">
                            {release.tag_name}
                          </Badge>
                          {release.prerelease && (
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Pre-release</Badge>
                          )}
                          {release.draft && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">Draft</Badge>
                          )}
                        </div>
                        <span className="text-blue-600 text-xs font-medium">
                          {formatRelativeTime(release.published_at || release.created_at)}
                        </span>
                      </div>

                      {/* Release Details - Compact */}
                      <div className="flex items-center justify-between mb-2 text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-600">Type: <span className="text-gray-800 font-medium">{release.prerelease ? 'Beta' : release.draft ? 'Draft' : 'Stable'}</span></span>
                          <span className="text-gray-600">Date: <span className="text-gray-800 font-medium">{new Date(release.published_at || release.created_at).toLocaleDateString()}</span></span>
                        </div>
                      </div>

                      {/* Release Name */}
                      {release.name && release.name !== release.tag_name && (
                        <div className="mb-3">
                          <div className="text-sm font-medium text-gray-800 mb-1">Release Name:</div>
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                            {release.name}
                          </div>
                        </div>
                      )}

                      {/* Release Notes - Compact */}
                      {release.body && (
                        <div className="text-gray-700">
                          <div className="text-sm font-medium text-gray-800 mb-1 flex items-center space-x-2">
                            <FileText className="h-3 w-3" />
                            <span>Notes:</span>
                          </div>
                          <div className="bg-gray-50 p-2 rounded border">
                            <div className="space-y-1">
                              {formatReleaseNotes(release.body).slice(0, 2).map((note, noteIndex) => (
                                <div key={noteIndex} className="flex items-start space-x-1">
                                  <span className="text-blue-500 mt-0.5 flex-shrink-0 text-xs">•</span>
                                  <span className="text-gray-700 leading-relaxed text-xs line-clamp-2">{note}</span>
                                </div>
                              ))}
                              {formatReleaseNotes(release.body).length > 2 && (
                                <div className="text-xs text-gray-500 mt-1 pt-1 border-t border-gray-200">
                                  +{formatReleaseNotes(release.body).length - 2} more changes...
                                </div>
                              )}
                            </div>
                            {release.html_url && (
                              <div className="mt-2 flex justify-end">
                                <a
                                  href={release.html_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  <span>View full</span>
                                  <ExternalLinkIcon className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Release Assets Info */}
                      {release.assets && release.assets.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Assets:</div>
                          <div className="text-xs text-gray-500">
                            {release.assets.length} file{release.assets.length !== 1 ? 's' : ''} available
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Topics - Compact */}
        {project.topics && (
          <div className="flex flex-wrap gap-1 mb-2">
            {project.topics.split(',').slice(0, 3).map((topic, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5">
                {topic.trim()}
              </Badge>
            ))}
            {project.topics.split(',').length > 3 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                +{project.topics.split(',').length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col space-y-2 text-xs text-gray-400">
          <div className="flex items-center space-x-2 flex-wrap">
            {project.language && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs flex-shrink-0">
                {project.language}
              </span>
            )}
            <span className="flex-shrink-0">Updated {formatRelativeTime(project.updatedAt)}</span>
          </div>
          {project.homepage && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                <a href={project.homepage} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
