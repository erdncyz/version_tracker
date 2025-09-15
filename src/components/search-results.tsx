'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ProjectCard } from './project-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface SearchResult {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  owner: {
    avatar_url: string;
    login: string;
  };
  homepage: string | null;
  topics: string[];
  private: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  isTracked: boolean;
  trackedProjectId: string | null;
}

interface SearchResultsProps {
  query: string;
  onTrack: (fullName: string) => void;
  onUntrack: (projectId: string) => void;
  onRefresh: (projectId: string) => void;
}

export function SearchResults({ query, onTrack, onUntrack, onRefresh }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const searchRepositories = async (searchQuery: string, pageNum: number = 1) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&per_page=10`
      );

      if (!response.ok) {
        throw new Error('Failed to search repositories');
      }

      const data = await response.json();

      if (pageNum === 1) {
        setResults(data.projects);
      } else {
        setResults(prev => [...prev, ...data.projects]);
      }

      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      setPage(1);
      searchRepositories(query, 1);
    } else {
      setResults([]);
      setHasMore(false);
    }
  }, [query]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      searchRepositories(query, page + 1);
    }
  };

  const handleTrack = async (fullName: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          userId: 'demo-user', // In a real app, this would come from auth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track project');
      }

      // Update the local state
      setResults(prev =>
        prev.map(result =>
          result.full_name === fullName
            ? { ...result, isTracked: true, trackedProjectId: 'new-id' }
            : result
        )
      );
    } catch (err) {
      console.error('Error tracking project:', err);
    }
  };

  if (!query) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Search for repositories
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Enter a repository name or description to find projects to track.
            You can search for popular libraries like "selenium", "appium", or "react".
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading && results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
          <p className="text-sm text-gray-500">Searching repositories...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Search Error
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            {error}
          </p>
          <Button
            variant="outline"
            onClick={() => searchRepositories(query, 1)}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Search className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No repositories found
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Try adjusting your search terms or check the spelling.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Search Results ({results.length} repositories)
        </h2>
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <ProjectCard
            key={result.id}
            project={{
              id: result.trackedProjectId || result.id.toString(),
              name: result.name,
              fullName: result.full_name,
              description: result.description,
              language: result.language,
              stars: result.stargazers_count,
              forks: result.forks_count,
              watchers: result.watchers_count,
              avatar: result.owner.avatar_url,
              homepage: result.homepage,
              topics: result.topics.join(','),
              isPrivate: result.private,
              isArchived: result.archived,
              lastChecked: new Date(),
              createdAt: new Date(result.created_at),
              updatedAt: new Date(result.updated_at),
            }}
            isTracked={result.isTracked}
            onTrack={() => handleTrack(result.full_name)}
            onUntrack={() => onUntrack(result.trackedProjectId!)}
            onRefresh={() => onRefresh(result.trackedProjectId!)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Load More</span>
          </Button>
        </div>
      )}
    </div>
  );
}
