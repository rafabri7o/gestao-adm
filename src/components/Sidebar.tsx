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
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#1e40af] text-white flex flex-col z-50">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-xl font-bold tracking-tight">Gestão ADM</h1>
        <p className="text-blue-200 text-sm mt-1">Controle Financeiro</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-800 text-white border-r-4 border-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-blue-700">
        <p className="text-blue-200 text-xs">© RB7 Digital</p>
      </div>
    </aside>
  )
}
