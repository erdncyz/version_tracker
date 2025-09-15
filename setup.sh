#!/bin/bash

echo "🚀 Setting up Version Tracker..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set up environment variables
echo "🔧 Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp env.example .env.local
    echo "📝 Created .env.local file. Please add your GitHub token:"
    echo "   GITHUB_TOKEN=your_github_token_here"
    echo ""
    echo "   You can get a GitHub token from: https://github.com/settings/tokens"
    echo "   Required scopes: public_repo (for public repositories)"
    echo ""
fi

# Set up database
echo "🗄️  Setting up database..."
DATABASE_URL="file:./dev.db" npm run db:push

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "   npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "Don't forget to:"
echo "   1. Add your GitHub token to .env.local"
echo "   2. Search for repositories to track (e.g., 'selenium', 'appium')"
echo "   3. Start tracking projects to see version updates"
echo ""
