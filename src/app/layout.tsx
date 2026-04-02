import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/AppShell'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Gestão ADM — RB7',
  description: 'Sistema de gestão financeira RB7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="h-full font-[family-name:var(--font-inter)]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
