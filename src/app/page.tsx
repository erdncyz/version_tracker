'use client';

import { useState, useEffect } from 'react';
import { initializeApp } from '@/lib/startup';
import { Header } from '@/components/header';
import { Dashboard } from '@/components/dashboard';
import { SearchResults } from '@/components/search-results';
import { ProjectCard } from '@/components/project-card';
import { VersionDetails, VersionList } from '@/components/version-details';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, Version } from '@/types';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [loading, setLoading] = useState(false);

  // Load tracked projects on component mount
  useEffect(() => {
    loadTrackedProjects();
    // Initialize the app (version checker)
    initializeApp();
  }, []);

  const loadTrackedProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/projects?limit=50');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
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
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user',
        }),
      });

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
          setSelectedVersion(null);
        }
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
        
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProject);
        }
      }
    } catch (error) {
      console.error('Error refreshing project:', error);
    }
  };

  const handleProjectSelect = async (project: Project) => {
    setSelectedProject(project);
    setSelectedVersion(project.versions?.[0] || null);
    setActiveTab('versions');
  };

  const handleVersionSelect = (version: Version) => {
    setSelectedVersion(version);
  };

  const handleAddProject = () => {
    setActiveTab('search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={handleSearch}
        onAddProject={handleAddProject}
        unreadNotifications={0}
      />

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className="cursor-pointer"
                  >
                    <ProjectCard
                      project={project}
                      isTracked={true}
                      onTrack={() => {}}
                      onUntrack={handleUntrackProject}
                      onRefresh={handleRefreshProject}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="versions" className="space-y-6">
            {selectedProject ? (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {selectedProject.name} Versions
                    </h3>
                    <VersionList
                      versions={selectedProject.versions || []}
                      project={selectedProject}
                      onVersionSelect={handleVersionSelect}
                      selectedVersion={selectedVersion}
                    />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  {selectedVersion ? (
                    <VersionDetails
                      version={selectedVersion}
                      project={selectedProject}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Select a version
                      </h3>
                      <p className="text-sm text-gray-500">
                        Choose a version from the list to view its details.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No project selected
                </h3>
                <p className="text-sm text-gray-500">
                  Select a project from the Projects tab to view its versions.
                </p>
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
