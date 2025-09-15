'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { SearchResults } from '@/components/search-results';
import { ProjectCard } from '@/components/project-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project } from '@/types';
import { Package, Star, GitFork, Eye, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  const handleTrackProject = async (fullName: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          userId: session.user.id,
        }),
      });

      if (response.ok) {
        alert('Project tracked successfully! Please sign in to view your tracked projects.');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error tracking project:', error);
      alert('Failed to track project. Please try again.');
    }
  };

  const handleUntrackProject = async (projectId: string) => {
    // This won't be used on the landing page
  };

  const handleRefreshProject = async (projectId: string) => {
    // This won't be used on the landing page
  };

  const handleAddProject = () => {
    setActiveTab('search');
  };

  // If user is authenticated, redirect to dashboard
  if (session) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={handleSearch}
        onAddProject={handleAddProject}
        unreadNotifications={0}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">VT</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Version Tracker</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track your favorite open source projects and stay updated with the latest releases. 
            Never miss important updates again.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a 
              href="/auth/signin" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </a>
            <button
              onClick={() => setActiveTab('search')}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Browse Projects
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid gap-8 md:grid-cols-3 py-12">
          <div className="text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Projects</h3>
            <p className="text-gray-600">Monitor your favorite repositories and get notified about new releases.</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h3>
            <p className="text-gray-600">Never miss important updates with our intelligent notification system.</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitor Changes</h3>
            <p className="text-gray-600">Track version changes, release notes, and project statistics.</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 max-w-md mx-auto">
              <TabsTrigger value="search">Search Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Search for Projects</h2>
                <p className="text-gray-600">
                  Find and explore open source projects. Sign in to start tracking them.
                </p>
              </div>
              <SearchResults
                query={searchQuery}
                onTrack={handleTrackProject}
                onUntrack={handleUntrackProject}
                onRefresh={handleRefreshProject}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-600 mb-6">
            Sign in to start tracking your favorite projects and never miss an update.
          </p>
          <a 
            href="/auth/signin" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </main>
    </div>
  );
}
