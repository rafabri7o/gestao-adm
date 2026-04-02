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
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '256px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>Gestão ADM</h1>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Controle Financeiro</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#1d4ed8' : '#6b7280',
                border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: '#9ca3af' }}>© RB7 Digital</p>
      </div>
    </aside>
  )
}
