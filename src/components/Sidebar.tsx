'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/pagar', label: 'Contas a Pagar', icon: '💸' },
  { href: '/receber', label: 'Contas a Receber', icon: '💰' },
  { href: '/cadastrar', label: 'Cadastrar', icon: '➕' },
  { href: '/tags', label: 'Tags', icon: '🏷️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-950 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white tracking-tight">Gestão ADM</h1>
        <p className="text-gray-500 text-xs mt-1">Controle Financeiro</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">© RB7 Digital</p>
      </div>
    </aside>
  )
}
