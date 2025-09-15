'use client';

import { useState } from 'react';
import { Calendar, Tag, Download, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Version, Project } from '@/types';
import { formatDate, formatRelativeTime, getVersionType, getVersionColor } from '@/lib/utils';

interface VersionDetailsProps {
  version: Version;
  project: Project;
  onCompare?: (version1: Version, version2: Version) => void;
}

export function VersionDetails({ version, project, onCompare }: VersionDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullChangelog, setShowFullChangelog] = useState(false);

  const versionType = getVersionType(version.tagName);
  const versionColor = getVersionColor(versionType);

  const truncateChangelog = (text: string, maxLength: number = 500) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const renderChangelog = () => {
    if (!version.body) {
      return (
        <p className="text-sm text-gray-500 italic">
          No changelog available for this release.
        </p>
      );
    }

    const displayText = showFullChangelog ? version.body : truncateChangelog(version.body);

    return (
      <div className="space-y-3">
        <div className="markdown text-sm">
          <pre className="whitespace-pre-wrap font-sans">{displayText}</pre>
        </div>
        {version.body.length > 500 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullChangelog(!showFullChangelog)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showFullChangelog ? 'Show Less' : 'Show More'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <CardTitle className="text-xl">{version.name || version.tagName}</CardTitle>
              <Badge className={versionColor}>
                {versionType}
              </Badge>
              {version.isPrerelease && (
                <Badge variant="warning">Pre-release</Badge>
              )}
              {version.isDraft && (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Published {formatDate(version.publishedAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Tag className="h-4 w-4" />
                <span>{version.tagName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://github.com/${project.fullName}/releases/tag/${version.tagName}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {/* Changelog */}
            <div>
              <h4 className="font-semibold mb-2">Release Notes</h4>
              {renderChangelog()}
            </div>

            {/* Version Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h5 className="font-medium text-sm text-gray-700 mb-1">Release Type</h5>
                <Badge className={versionColor}>
                  {versionType.charAt(0).toUpperCase() + versionType.slice(1)}
                </Badge>
              </div>
              <div>
                <h5 className="font-medium text-sm text-gray-700 mb-1">Published</h5>
                <p className="text-sm text-gray-600">
                  {formatRelativeTime(version.publishedAt)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-4 border-t">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              {onCompare && (
                <Button variant="outline" size="sm">
                  Compare with Previous
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface VersionListProps {
  versions: Version[];
  project: Project;
  onVersionSelect?: (version: Version) => void;
  selectedVersion?: Version;
}

export function VersionList({ versions, project, onVersionSelect, selectedVersion }: VersionListProps) {
  const [filter, setFilter] = useState<'all' | 'stable' | 'prerelease'>('all');

  const filteredVersions = versions.filter(version => {
    if (filter === 'stable') return !version.isPrerelease;
    if (filter === 'prerelease') return version.isPrerelease;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Filter:</span>
        <div className="flex space-x-1">
          {(['all', 'stable', 'prerelease'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="capitalize"
            >
              {filterType}
            </Button>
          ))}
        </div>
      </div>

      {/* Version List */}
      <div className="space-y-2">
        {filteredVersions.map((version) => {
          const versionType = getVersionType(version.tagName);
          const versionColor = getVersionColor(versionType);
          const isSelected = selectedVersion?.id === version.id;

          return (
            <div
              key={version.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => onVersionSelect?.(version)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{version.tagName}</span>
                  </div>
                  <Badge className={versionColor}>
                    {versionType}
                  </Badge>
                  {version.isPrerelease && (
                    <Badge variant="warning">Pre-release</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span>{formatRelativeTime(version.publishedAt)}</span>
                  {version.name && (
                    <span className="truncate max-w-48">{version.name}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVersions.length === 0 && (
        <div className="text-center py-8">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No versions found
          </h3>
          <p className="text-sm text-gray-500">
            No versions match the current filter.
          </p>
        </div>
      )}
    </div>
  );
}
