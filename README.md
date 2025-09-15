# Version Tracker

A comprehensive tool for tracking third-party library versions with GitHub API integration. Built with Next.js, TypeScript, Prisma, and Tailwind CSS.

## Features

- 🔍 **Repository Search**: Search and discover GitHub repositories
- 📊 **Version Tracking**: Track releases and version changes
- 🔔 **Notifications**: Get notified when new versions are released
- 📈 **Dashboard**: Overview of all tracked projects and statistics
- 🎨 **GitHub-style UI**: Clean, modern interface inspired by GitHub
- 🚀 **Real-time Updates**: Automatic version checking and updates
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Prisma with SQLite
- **API**: GitHub REST API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub Personal Access Token

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd version-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` and add your GitHub token:
```
GITHUB_TOKEN=your_github_token_here
DATABASE_URL="file:./dev.db"
```

4. Set up the database:
```bash
npm run db:push
npm run db:generate
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### Adding Projects

1. Go to the **Search** tab
2. Enter a repository name (e.g., "selenium", "appium", "react")
3. Click **Track** on any repository you want to monitor
4. The project will be added to your tracked projects

### Viewing Versions

1. Go to the **Projects** tab to see all tracked projects
2. Click on any project to view its versions
3. Go to the **Versions** tab to see detailed version information
4. Click on any version to see release notes and changelog

### Dashboard

The dashboard provides:
- Total projects and versions tracked
- Outdated projects that need attention
- Recent releases
- Top programming languages
- Recent activity feed

## API Endpoints

- `GET /api/search` - Search GitHub repositories
- `GET /api/projects` - Get tracked projects
- `POST /api/projects` - Add a new project to track
- `PUT /api/projects/[id]` - Update project data
- `DELETE /api/projects/[id]` - Remove project tracking
- `GET /api/versions` - Get project versions
- `GET /api/notifications` - Get user notifications

## Database Schema

The application uses Prisma with the following main models:

- **User**: User accounts and preferences
- **Project**: Tracked GitHub repositories
- **Version**: Release versions and changelogs
- **Notification**: User notifications for new releases

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub.
