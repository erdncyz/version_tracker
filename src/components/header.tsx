'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Settings, Plus, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SearchSuggestions } from '@/components/search-suggestions';

interface HeaderProps {
  onSearch: (query: string) => void;
  onAddProject: () => void;
  unreadNotifications?: number;
}

export function Header({ onSearch, onAddProject, unreadNotifications = 0 }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (term: string) => {
    setSearchQuery(term);
    onSearch(term);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length >= 3);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">VT</span>
            </div>
            <h1 className="text-xl font-bold">Version Tracker</h1>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8 relative z-[9998]">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className="pl-10 pr-4"
            />
          </form>
          <SearchSuggestions
            query={searchQuery}
            onSelect={handleSuggestionClick}
            isVisible={showSuggestions}
            onClose={() => setShowSuggestions(false)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddProject}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Project</span>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative" onClick={handleNotifications}>
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Badge>
                )}
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="icon" onClick={handleSettings}>
                <Settings className="h-5 w-5" />
              </Button>

              {/* User Avatar with Dropdown */}
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "User"} />
                  <AvatarFallback>
                    {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{session.user?.name || session.user?.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="h-auto p-0 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sign out
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <a href="/auth/signin">Sign In</a>
              </Button>
              <Button asChild>
                <a href="/auth/signup">Sign Up</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
