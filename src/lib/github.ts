import { Octokit } from '@octokit/rest';

export interface GitHubRepository {
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
}

export interface GitHubRelease {
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
}

export interface GitHubSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

class GitHubService {
  private octokit: Octokit;

  constructor(token?: string) {
    const authToken = token || process.env.GITHUB_TOKEN;
    
    // Only add auth if token is provided and not placeholder
    const authConfig = authToken && !authToken.includes('your_github_token_here') 
      ? { auth: authToken } 
      : {};
    
    this.octokit = new Octokit({
      ...authConfig,
      // GitHub API rate limits: 60 requests/hour without auth, 5000/hour with auth
      request: {
        timeout: 10000, // 10 second timeout
      },
    });
  }

  async searchRepositories(query: string, page: number = 1, perPage: number = 10): Promise<GitHubSearchResult> {
    try {
      const response = await this.octokit.rest.search.repos({
        q: query,
        sort: 'stars',
        order: 'desc',
        page,
        per_page: perPage,
      });

      return {
        total_count: response.data.total_count,
        incomplete_results: response.data.incomplete_results,
        items: response.data.items.map(repo => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          watchers_count: repo.watchers_count,
          owner: {
            avatar_url: repo.owner?.avatar_url || '',
            login: repo.owner?.login || '',
          },
          homepage: repo.homepage,
          topics: repo.topics || [],
          private: repo.private,
          archived: repo.archived,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          pushed_at: repo.pushed_at,
        })),
      };
    } catch (error: any) {
      console.error('Error searching repositories:', error);
      
      // Provide more specific error messages
      if (error.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later or add a GitHub token for higher limits.');
      } else if (error.status === 401) {
        throw new Error('GitHub API authentication failed. Please check your token.');
      } else if (error.status === 422) {
        throw new Error('Invalid search query. Please try a different search term.');
      } else if (error.message?.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(`GitHub API error: ${error.message || 'Unknown error'}`);
      }
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      const repoData = response.data;
      return {
        id: repoData.id,
        name: repoData.name,
        full_name: repoData.full_name,
        description: repoData.description,
        language: repoData.language,
        stargazers_count: repoData.stargazers_count,
        forks_count: repoData.forks_count,
        watchers_count: repoData.watchers_count,
        owner: {
          avatar_url: repoData.owner.avatar_url,
          login: repoData.owner.login,
        },
        homepage: repoData.homepage,
        topics: repoData.topics || [],
        private: repoData.private,
        archived: repoData.archived,
        created_at: repoData.created_at,
        updated_at: repoData.updated_at,
        pushed_at: repoData.pushed_at,
      };
    } catch (error: any) {
      console.error('Error fetching repository:', error);
      
      // Handle rate limiting specifically
      if (error.status === 403 && error.message?.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later or add a GitHub token for higher limits.');
      } else if (error.status === 404) {
        throw new Error('Repository not found. Please check the repository name and owner.');
      } else if (error.status === 401) {
        throw new Error('GitHub API authentication failed. Please check your token.');
      } else {
        throw new Error(`Failed to fetch repository: ${error.message || 'Unknown error'}`);
      }
    }
  }

  async getReleases(owner: string, repo: string, page: number = 1, perPage: number = 30): Promise<GitHubRelease[]> {
    try {
      const response = await this.octokit.rest.repos.listReleases({
        owner,
        repo,
        page,
        per_page: perPage,
      });

      return response.data.map(release => ({
        id: release.id,
        tag_name: release.tag_name,
        name: release.name,
        body: release.body || null,
        prerelease: release.prerelease,
        draft: release.draft,
        published_at: release.published_at,
        created_at: release.created_at,
        html_url: release.html_url,
        assets: release.assets.map(asset => ({
          name: asset.name,
          download_count: asset.download_count,
          size: asset.size,
        })),
      }));
    } catch (error: any) {
      console.error('Error fetching releases:', error);
      
      // Handle rate limiting specifically
      if (error.status === 403 && error.message?.includes('rate limit')) {
        throw new Error('GitHub API rate limit exceeded. Please try again later or add a GitHub token for higher limits.');
      } else if (error.status === 404) {
        throw new Error('Repository not found. Please check the repository name and owner.');
      } else if (error.status === 401) {
        throw new Error('GitHub API authentication failed. Please check your token.');
      } else {
        throw new Error(`Failed to fetch releases: ${error.message || 'Unknown error'}`);
      }
    }
  }

  async getLatestRelease(owner: string, repo: string): Promise<GitHubRelease | null> {
    try {
      const response = await this.octokit.rest.repos.getLatestRelease({
        owner,
        repo,
      });

      const release = response.data;
      return {
        id: release.id,
        tag_name: release.tag_name,
        name: release.name,
        body: release.body || null,
        prerelease: release.prerelease,
        draft: release.draft,
        published_at: release.published_at,
        created_at: release.created_at,
        html_url: release.html_url,
        assets: release.assets.map(asset => ({
          name: asset.name,
          download_count: asset.download_count,
          size: asset.size,
        })),
      };
    } catch (error: any) {
      // If no releases found, return null
      if (error.status === 404) {
        return null;
      }
      if (error.status === 403) {
        // Rate limit exceeded
        throw new Error('GitHub API rate limit exceeded');
      }
      console.error('Error fetching latest release:', error);
      throw new Error('Failed to fetch latest release');
    }
  }

  async getRepositoryByFullName(fullName: string): Promise<GitHubRepository> {
    const [owner, repo] = fullName.split('/');
    if (!owner || !repo) {
      throw new Error('Invalid repository full name format');
    }
    return this.getRepository(owner, repo);
  }

  async getReleasesByFullName(fullName: string, page: number = 1, perPage: number = 30): Promise<GitHubRelease[]> {
    const [owner, repo] = fullName.split('/');
    if (!owner || !repo) {
      throw new Error('Invalid repository full name format');
    }
    return this.getReleases(owner, repo, page, perPage);
  }

  async getLatestReleaseByFullName(fullName: string): Promise<GitHubRelease | null> {
    const [owner, repo] = fullName.split('/');
    if (!owner || !repo) {
      throw new Error('Invalid repository full name format');
    }
    return this.getLatestRelease(owner, repo);
  }

  async getUserStarredRepositories(page: number = 1, perPage: number = 100): Promise<GitHubRepository[]> {
    try {
      const response = await this.octokit.rest.activity.listReposStarredByAuthenticatedUser({
        page,
        per_page: perPage,
        sort: 'created',
        direction: 'desc',
      });

      return response.data.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        watchers_count: repo.watchers_count,
        owner: {
          avatar_url: repo.owner.avatar_url,
          login: repo.owner.login,
        },
        homepage: repo.homepage,
        topics: repo.topics || [],
        private: repo.private,
        archived: repo.archived,
        created_at: repo.created_at || '',
        updated_at: repo.updated_at || '',
        pushed_at: repo.pushed_at || '',
      }));
    } catch (error) {
      console.error('Error fetching starred repositories:', error);
      throw new Error('Failed to fetch starred repositories');
    }
  }
}

export const githubService = new GitHubService();
export default GitHubService;
