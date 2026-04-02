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
    { icon: '💸', label: 'Custos do Mês', value: formatCurrency(custos), color: 'text-red-600' },
    { icon: '💰', label: 'Vendas do Mês', value: formatCurrency(vendas), color: 'text-gray-900' },
    { icon: '🏦', label: 'Entradas no Caixa', value: formatCurrency(entradas), color: 'text-green-600' },
    { icon: '📈', label: 'Margem (Vendas)', value: `${margemVendas.toFixed(1)}%`, color: margemVendas >= 0 ? 'text-green-600' : 'text-red-600' },
    { icon: '📊', label: 'Margem (Caixa)', value: `${margemCaixa.toFixed(1)}%`, color: margemCaixa >= 0 ? 'text-green-600' : 'text-red-600' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl border border-gray-100 p-5 animate-fade-in"
        >
          <div className="text-xl mb-3">{card.icon}</div>
          <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
          <div className="text-xs text-gray-400 mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
