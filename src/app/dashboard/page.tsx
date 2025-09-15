'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { initializeApp } from '@/lib/startup';
import { Header } from '@/components/header';
import { Dashboard } from '@/components/dashboard';
import { SearchResults } from '@/components/search-results';
import { ProjectCard } from '@/components/project-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Project, Version } from '@/types';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  // Load tracked projects on component mount
  useEffect(() => {
    if (session) {
      loadTrackedProjects();
      // Initialize the app (version checker)
      initializeApp();
    }
  }, [session]);

  const loadTrackedProjects = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      console.log('Loading projects for user:', session.user.id);
      const response = await fetch(`/api/projects?userId=${session.user.id}&limit=50`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Projects data:', data);
        setProjects(data.projects || []);
      } else {
        console.error('Failed to load projects:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  const handleTrackProject = async (fullName: string) => {
    if (!session?.user?.id) return;
    
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
        const newProject = await response.json();
        setProjects(prev => [newProject, ...prev]);
        setActiveTab('projects');
      }
    } catch (error) {
      console.error('Error tracking project:', error);
    }
  };

  const handleUntrackProject = async (projectId: string) => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error('Error untracking project:', error);
    }
  };

  const handleRefreshProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'refresh',
        }),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      }
    } catch (error) {
      console.error('Error refreshing project:', error);
    }
  };


  const handleAddProject = () => {
    setActiveTab('search');
  };


  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <a 
            href="/auth/signin" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={handleSearch}
        onAddProject={handleAddProject}
        unreadNotifications={0}
      />

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard projects={projects} />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tracked Projects</h2>
              <div className="text-sm text-gray-500">
                {projects.length} project{projects.length !== 1 ? 's' : ''} tracked
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No projects tracked yet
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Start by searching for repositories to track their versions.
                </p>
                <button
                  onClick={handleAddProject}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Search for Projects
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isTracked={true}
                    onTrack={() => {}}
                    onUntrack={handleUntrackProject}
                    onRefresh={handleRefreshProject}
                  />
                ))}
              </div>
            )}
          </TabsContent>


          <TabsContent value="search" className="space-y-6">
            <SearchResults
              query={searchQuery}
              onTrack={handleTrackProject}
              onUntrack={handleUntrackProject}
              onRefresh={handleRefreshProject}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
