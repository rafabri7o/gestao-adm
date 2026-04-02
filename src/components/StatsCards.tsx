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
      color: 'border-red-400',
      bg: 'bg-red-50',
    },
    {
      icon: '💰',
      label: 'Vendas do Mês',
      value: formatCurrency(vendas),
      color: 'border-blue-400',
      bg: 'bg-blue-50',
    },
    {
      icon: '🏦',
      label: 'Entradas no Caixa',
      value: formatCurrency(entradas),
      color: 'border-green-400',
      bg: 'bg-green-50',
    },
    {
      icon: '📈',
      label: 'Margem (Vendas)',
      value: `${margemVendas.toFixed(1)}%`,
      color: 'border-purple-400',
      bg: 'bg-purple-50',
    },
    {
      icon: '📊',
      label: 'Margem (Caixa)',
      value: `${margemCaixa.toFixed(1)}%`,
      color: 'border-indigo-400',
      bg: 'bg-indigo-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} bg-white rounded-2xl p-5 border-l-4 ${card.color} shadow-sm`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{card.icon}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {card.label}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
