'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  RefreshCw, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Search
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    theme: 'light'
  });
  const [stats, setStats] = useState({
    trackedProjects: 0,
    totalNotifications: 0,
    lastSync: null
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      loadUserStats();
    }
  }, [session]);

  const loadUserStats = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/projects?userId=${session.user.id}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          trackedProjects: data.projects?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };


  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };


  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      // Clear tracked projects
      const response = await fetch('/api/projects/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
        }),
      });

      if (response.ok) {
        setStats(prev => ({
          ...prev,
          trackedProjects: 0,
          totalNotifications: 0
        }));
        alert('All data cleared successfully!');
      } else {
        alert('Failed to clear data. Please try again.');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data. Please try again.');
    } finally {
      setLoading(false);
    }
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header
        onSearch={() => {}}
        onAddProject={() => router.push('/dashboard')}
        unreadNotifications={0}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Settings ⚙️
              </h1>
              <p className="text-lg text-gray-600">Manage your account and application preferences</p>
            </div>
            <Badge variant="outline" className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
              <User className="h-4 w-4" />
              <span>{session.user?.name || session.user?.email}</span>
            </Badge>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Settings */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span>Account</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your account information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{session.user?.name || 'User'}</h3>
                      <p className="text-gray-600">{session.user?.email}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive email updates about your tracked projects</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <p className="text-sm text-gray-500">Receive browser notifications for new releases</p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="weekly-digest">Weekly Digest</Label>
                        <p className="text-sm text-gray-500">Get a weekly summary of all project updates</p>
                      </div>
                      <Switch
                        id="weekly-digest"
                        checked={settings.weeklyDigest}
                        onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>


              {/* Data Management */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Database className="h-4 w-4 text-white" />
                    </div>
                    <span>Data Management</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your tracked projects and data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Clear All Data</h3>
                      <p className="text-sm text-gray-500">Remove all tracked projects and notifications</p>
                    </div>
                    <Button
                      onClick={handleClearData}
                      disabled={loading}
                      variant="destructive"
                      size="sm"
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Info className="h-4 w-4 text-white" />
                    </div>
                    <span>Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tracked Projects</span>
                    <Badge variant="outline">{stats.trackedProjects}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Notifications</span>
                    <Badge variant="outline">{stats.totalNotifications}</Badge>
                  </div>
                  {stats.lastSync && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-xs text-gray-500">
                        {new Date(stats.lastSync).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Search className="h-4 w-4 text-white" />
                    </div>
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="w-full justify-start bg-white/50 hover:bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard?tab=search')}
                    variant="outline"
                    className="w-full justify-start bg-white/50 hover:bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Projects
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
