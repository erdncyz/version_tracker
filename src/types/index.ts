export interface Project {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  avatar: string | null;
  homepage: string | null;
  topics: string;
  isPrivate: boolean;
  isArchived: boolean;
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
  versions?: Version[];
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
    assets: Array<{
      name: string;
      download_count: number;
      size: number;
    }>;
  } | null;
}

export interface Version {
  id: string;
  tagName: string;
  name: string | null;
  body: string | null;
  isPrerelease: boolean;
  isDraft: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  project?: Project;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'new_release' | 'update' | 'error';
  isRead: boolean;
  createdAt: Date;
  userId: string;
  projectId: string | null;
  user?: User;
  project?: Project;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  trackedProjects?: Project[];
  notifications?: Notification[];
}

export interface SearchFilters {
  language?: string;
  minStars?: number;
  maxStars?: number;
  topics?: string[];
  sortBy?: 'stars' | 'forks' | 'updated' | 'created';
  order?: 'asc' | 'desc';
}

export interface ProjectSearchResult {
  projects: Project[];
  totalCount: number;
  hasMore: boolean;
  page: number;
}

export interface VersionComparison {
  currentVersion: Version;
  latestVersion: Version;
  isUpToDate: boolean;
  versionsBehind: number;
  changelog: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalVersions: number;
  outdatedProjects: number;
  recentReleases: number;
  topLanguages: Array<{
    language: string;
    count: number;
  }>;
  recentActivity: Array<{
    type: 'new_release' | 'project_added' | 'project_updated';
    message: string;
    timestamp: Date;
    projectId?: string;
  }>;
}
