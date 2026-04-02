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
    {
      icon: '💸',
      label: 'Custos do Mês',
      value: formatCurrency(custos),
    },
    {
      icon: '💰',
      label: 'Vendas do Mês',
      value: formatCurrency(vendas),
    },
    {
      icon: '🏦',
      label: 'Entradas no Caixa',
      value: formatCurrency(entradas),
    },
    {
      icon: '📈',
      label: 'Margem (Vendas)',
      value: `${margemVendas.toFixed(1)}%`,
    },
    {
      icon: '📊',
      label: 'Margem (Caixa)',
      value: `${margemCaixa.toFixed(1)}%`,
    },
  ]

  return (
    <div className="grid grid-cols-5 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">{card.icon}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{card.value}</div>
          <div className="text-sm text-gray-500 mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
