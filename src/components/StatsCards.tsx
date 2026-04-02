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
    { icon: '💸', label: 'Custos do Mês', value: formatCurrency(custos), percent: null },
    { icon: '💰', label: 'Vendas do Mês', value: formatCurrency(vendas), percent: null },
    { icon: '🏦', label: 'Entradas no Caixa', value: formatCurrency(entradas), percent: null },
    { icon: '📈', label: 'Margem (Vendas)', value: `${margemVendas.toFixed(1)}%`, percent: null },
    { icon: '📊', label: 'Margem (Caixa)', value: `${margemCaixa.toFixed(1)}%`, percent: null },
  ]

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl p-5 border border-gray-100 animate-fade-in"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl">{card.icon}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          <div className="text-xs text-gray-400 mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  )
}
