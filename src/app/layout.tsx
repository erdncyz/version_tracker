import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthSessionProvider } from '@/components/providers/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Version Tracker',
  description: 'Track third-party library versions with GitHub integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthSessionProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
