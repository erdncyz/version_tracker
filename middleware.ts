import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith("/auth/")) {
          return true
        }
        
        // Allow access to home page without token
        if (req.nextUrl.pathname === "/") {
          return true
        }
        
        // Allow access to search page without token (read-only)
        if (req.nextUrl.pathname === "/search") {
          return true
        }
        
        // Require valid token for all other pages (dashboard, projects, etc.)
        if (!token) {
          return false
        }
        
        // If token exists but user ID is missing, redirect to signin
        if (!token.id) {
          return false
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
