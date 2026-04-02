'use client'

import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
  custos: number
  vendas: number
  entradas: number
}

export default function StatsCards({ custos, vendas, entradas }: StatsCardsProps) {
  const margemVendas = vendas > 0 ? ((vendas - custos) / vendas) * 100 : 0
  const margemCaixa = entradas > 0 ? ((entradas - custos) / entradas) * 100 : 0

  const cards = [
    { icon: '💸', label: 'Custos do Mês', value: formatCurrency(custos) },
    { icon: '💰', label: 'Vendas do Mês', value: formatCurrency(vendas) },
    { icon: '🏦', label: 'Entradas no Caixa', value: formatCurrency(entradas) },
    { icon: '📈', label: 'Margem (Vendas)', value: `${margemVendas.toFixed(1)}%` },
    { icon: '📊', label: 'Margem (Caixa)', value: `${margemCaixa.toFixed(1)}%` },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #f3f4f6',
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>{card.icon}</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{card.value}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{card.label}</div>
        </div>
      ))}
    </div>
  )
}
