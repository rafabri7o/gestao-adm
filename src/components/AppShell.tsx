'use client'

import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main style={{ marginLeft: '256px', padding: '32px', minHeight: '100vh' }}>
        {children}
      </main>
    </>
  )
}
