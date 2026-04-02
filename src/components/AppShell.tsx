'use client'

import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen bg-gray-50 p-8">
        {children}
      </main>
    </div>
  )
}
