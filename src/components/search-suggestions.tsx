'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Suggestion {
  fullName: string;
  name: string;
  owner: string;
  type: 'popular' | 'search';
  stars?: number;
  description?: string;
}

interface SearchSuggestionsProps {
  query: string;
  onSelect: (fullName: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export function SearchSuggestions({ query, onSelect, isVisible, onClose }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 3 && isVisible) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query, isVisible]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isVisible || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          onSelect(suggestions[selectedIndex].fullName);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onSelect(suggestion.fullName);
  };

  if (!isVisible || query.length < 3) {
    return null;
  }

  return (
    <div 
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 z-[9999] mt-1"
      onKeyDown={handleKeyDown}
    >
      <Card className="shadow-lg border border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">Loading suggestions...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.fullName}
                  className={`flex items-center justify-between p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {suggestion.type === 'popular' ? (
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Search className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 truncate">
                          {suggestion.fullName}
                        </span>
                        {suggestion.type === 'popular' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            Popular
                          </span>
                        )}
                      </div>
                      {suggestion.description && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {suggestion.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {suggestion.stars && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500 flex-shrink-0">
                      <Star className="h-3 w-3" />
                      <span>{suggestion.stars.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : !loading ? (
            <div className="flex items-center justify-center py-4 text-gray-500">
              <Search className="h-4 w-4 mr-2" />
              <span className="text-sm">No suggestions found</span>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}