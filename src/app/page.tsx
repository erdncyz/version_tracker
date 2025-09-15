'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { 
  Package, 
  Star, 
  GitFork, 
  Eye, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  Code, 
  Bell, 
  BarChart3,
  Github,
  Heart,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If user is authenticated, redirect to dashboard
  if (session) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header
        onSearch={() => {}}
        onAddProject={() => {}}
        unreadNotifications={0}
      />

      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center py-20">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Version Tracker
            </h1>
          </div>
          <p className="text-2xl text-gray-700 mb-4 max-w-3xl mx-auto font-light">
            Never miss an update again
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Track your favorite open source projects, monitor releases, and stay ahead of the curve with intelligent notifications and comprehensive project insights.
          </p>
          <div className="flex items-center justify-center space-x-6">
            <a 
              href="/auth/signin" 
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Github className="mr-2 h-5 w-5" />
              Get Started Free
            </a>
            <a 
              href="#features" 
              className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Version Tracker?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to keep you ahead of the curve in the fast-paced world of open source development.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Package className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Smart Project Tracking</h3>
              <p className="text-gray-600 text-center">Monitor unlimited repositories with intelligent categorization and automatic updates.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Bell className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Instant Notifications</h3>
              <p className="text-gray-600 text-center">Get real-time alerts for new releases, security updates, and breaking changes.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Analytics Dashboard</h3>
              <p className="text-gray-600 text-center">Comprehensive insights into your project portfolio with detailed statistics.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Lightning Fast</h3>
              <p className="text-gray-600 text-center">Optimized performance with GitHub API integration and smart caching.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Secure & Private</h3>
              <p className="text-gray-600 text-center">Your data is protected with enterprise-grade security and privacy controls.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-14 w-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Global Community</h3>
              <p className="text-gray-600 text-center">Join thousands of developers tracking millions of projects worldwide.</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-20 bg-white rounded-3xl shadow-xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Developers Worldwide</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of developers who rely on Version Tracker to stay updated with their favorite projects.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">1M+</div>
              <div className="text-gray-600">Projects Tracked</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-purple-600">50K+</div>
              <div className="text-gray-600">Notifications Sent</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-600">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sign Up</h3>
              <p className="text-gray-600">Create your free account in seconds with GitHub integration.</p>
            </div>
            
            <div className="text-center">
              <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Projects</h3>
              <p className="text-gray-600">Search and add your favorite repositories to start tracking.</p>
            </div>
            
            <div className="text-center">
              <div className="h-20 w-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Stay Updated</h3>
              <p className="text-gray-600">Receive instant notifications and track all your projects in one place.</p>
            </div>
          </div>
        </div>

        {/* Popular Projects Section */}
        <div className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Projects Being Tracked</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what the community is monitoring and discover new projects to follow.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "React", fullName: "facebook/react", stars: "220k", language: "JavaScript" },
              { name: "Vue.js", fullName: "vuejs/vue", stars: "210k", language: "JavaScript" },
              { name: "Next.js", fullName: "vercel/next.js", stars: "120k", language: "TypeScript" },
              { name: "Node.js", fullName: "nodejs/node", stars: "100k", language: "JavaScript" },
              { name: "Python", fullName: "python/cpython", stars: "60k", language: "Python" },
              { name: "TypeScript", fullName: "microsoft/TypeScript", stars: "95k", language: "TypeScript" }
            ].map((project, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">{project.stars}</span>
                    </div>
                    <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {project.language}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Never Miss an Update?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of developers who trust Version Tracker to keep them ahead of the curve. 
              Start tracking your favorite projects today - it's completely free!
            </p>
            <div className="flex items-center justify-center space-x-6">
              <a 
                href="/auth/signin" 
                className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-semibold rounded-xl text-blue-600 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Github className="mr-2 h-5 w-5" />
                Get Started Free
              </a>
              <a 
                href="#features" 
                className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-semibold rounded-xl text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm opacity-75">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Setup in 2 Minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Version Tracker</span>
            </div>
            <p className="text-gray-600 mb-4">
              Made with <Heart className="inline h-4 w-4 text-red-500" /> by Mercury Software
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700">Terms of Service</a>
              <a href="#" className="hover:text-gray-700">Contact</a>
              <a href="#" className="hover:text-gray-700">GitHub</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
