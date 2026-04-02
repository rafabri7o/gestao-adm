'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, type ContaWithTags, type Tag } from '@/lib/supabase'
import { formatCurrency, formatDate, getMonthRange, EMPRESAS, MESES } from '@/lib/utils'
import StatsCards from '@/components/StatsCards'

export default function Dashboard() {
  const now = new Date()
  const [day, setDay] = useState(0)
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [empresa, setEmpresa] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [contas, setContas] = useState<ContaWithTags[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const { start, end } = getMonthRange(year, month)
    const filterDay = day > 0 ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null

    let query = supabase
      .from('contas')
      .select('*, contas_tags(conta_id, tag_id, tags(*))')
      .gte('data_vencimento', start)
      .lte('data_vencimento', end)
      .order('data_vencimento')

    if (empresa) {
      query = query.eq('empresa', empresa)
    }

    const { data } = await query
    let filtered = (data as ContaWithTags[]) || []

    if (filterDay) {
      filtered = filtered.filter((c) => c.data_vencimento === filterDay)
    }

    if (tagFilter) {
      filtered = filtered.filter((c) =>
        c.contas_tags?.some((ct) => ct.tag_id === tagFilter)
      )
    }

    setContas(filtered)

    const { data: tagsData } = await supabase.from('tags').select('*').order('nome')
    if (tagsData) setTags(tagsData)

    setLoading(false)
  }, [day, month, year, empresa, tagFilter])

  const daysInMonth = new Date(year, month, 0).getDate()

  useEffect(() => {
    loadData()
  }, [loadData])

  const custos = contas
    .filter((c) => c.tipo === 'pagar' && c.status === 'pago')
    .reduce((sum, c) => sum + Number(c.valor), 0)

  const vendas = contas
    .filter((c) => c.tipo === 'receber')
    .reduce((sum, c) => sum + Number(c.valor), 0)

  const entradas = contas
    .filter((c) => c.tipo === 'receber' && c.status === 'recebido')
    .reduce((sum, c) => sum + Number(c.valor), 0)

  const pendingPagar = contas.filter((c) => c.tipo === 'pagar' && (c.status === 'pendente' || c.status === 'a_pagar'))
  const pendingReceber = contas.filter((c) => c.tipo === 'receber' && c.status === 'pendente')

  const selectClass = 'px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 text-gray-600 bg-white'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Visão geral das finanças</p>
      </div>

      <StatsCards custos={custos} vendas={vendas} entradas={entradas} />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex items-center gap-4 flex-wrap animate-fade-in">
        <input
          type="text"
          placeholder="Buscar conta..."
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 bg-white"
        />
        <select value={day} onChange={(e) => setDay(Number(e.target.value))} className={selectClass}>
          <option value={0}>Todos os dias</option>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={selectClass}>
          {MESES.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={selectClass}>
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select value={empresa} onChange={(e) => setEmpresa(e.target.value)} className={selectClass}>
          <option value="">Todas as empresas</option>
          {EMPRESAS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className={selectClass}>
          <option value="">Todas as tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <div className="text-3xl mb-3 animate-pulse-subtle">⏳</div>
          Carregando...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Contas a Pagar */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">💸 Contas a Pagar Pendentes</h2>
            </div>
            {pendingPagar.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Nenhuma conta pendente</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingPagar.map((c) => (
                  <div key={c.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.descricao}</p>
                      <p className="text-xs text-gray-400">{c.empresa} · Venc. {formatDate(c.data_vencimento)}</p>
                      <div className="flex gap-1 mt-1">
                        {c.contas_tags?.map((ct) => (
                          <span
                            key={ct.tag_id}
                            className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                          >
                            {ct.tags?.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-red-500">{formatCurrency(Number(c.valor))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contas a Receber */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">💰 Contas a Receber Pendentes</h2>
            </div>
            {pendingReceber.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Nenhuma conta pendente</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingReceber.map((c) => (
                  <div key={c.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.descricao}</p>
                      <p className="text-xs text-gray-400">{c.empresa} · Venc. {formatDate(c.data_vencimento)}</p>
                      <div className="flex gap-1 mt-1">
                        {c.contas_tags?.map((ct) => (
                          <span
                            key={ct.tag_id}
                            className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                          >
                            {ct.tags?.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-500">{formatCurrency(Number(c.valor))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
