'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/pagar', label: 'Contas a Pagar', icon: '💸' },
  { href: '/receber', label: 'Contas a Receber', icon: '💰' },
  { href: '/cadastrar', label: 'Cadastrar', icon: '➕' },

]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Gestão ADM</h1>
        <p className="text-xs text-gray-400 mt-1">Controle Financeiro</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-transparent'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">© RB7 Digital</p>
      </div>
    </aside>
  )
}
