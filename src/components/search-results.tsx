'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ProjectCard } from './project-card';
import { SearchSuggestions } from './search-suggestions';
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
  latestRelease?: {
    id: number;
    tag_name: string;
    name: string | null;
    body: string | null;
    prerelease: boolean;
    draft: boolean;
    published_at: string | null;
    created_at: string;
    html_url: string;
    assets: any[];
  } | null;
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
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      console.error('Search error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while searching');
      }
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

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setShowSuggestions(value.length >= 3);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setShowSuggestions(false);
      searchRepositories(searchInput.trim(), 1);
    }
  };

  const handleSuggestionSelect = (fullName: string) => {
    setSearchInput(fullName);
    setShowSuggestions(false);
    searchRepositories(fullName, 1);
  };

  const handleInputFocus = () => {
    if (searchInput.length >= 3) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
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
          
          {error.includes('rate limit') && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4 max-w-md">
              <h4 className="font-medium text-blue-900 mb-2">💡 Solution:</h4>
              <p className="text-sm text-blue-800 mb-2">
                GitHub API rate limit exceeded. To get higher limits:
              </p>
              <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
                <li>Go to GitHub → Settings → Developer settings</li>
                <li>Create a Personal Access Token</li>
                <li>Add it to your .env.local file as GITHUB_TOKEN</li>
              </ol>
            </div>
          )}
          
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
              topics: Array.isArray(result.topics) ? result.topics.join(',') : result.topics || '',
              isPrivate: result.private,
              isArchived: result.archived,
              lastChecked: new Date(),
              createdAt: new Date(result.created_at),
              updatedAt: new Date(result.updated_at),
              latestRelease: result.latestRelease,
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
