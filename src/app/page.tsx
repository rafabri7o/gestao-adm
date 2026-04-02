'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, type ContaWithTags, type Tag } from '@/lib/supabase'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getMonthRange, EMPRESAS, MESES } from '@/lib/utils'
import StatsCards from '@/components/StatsCards'

export default function Dashboard() {
  const now = new Date()
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

    if (tagFilter) {
      filtered = filtered.filter((c) =>
        c.contas_tags?.some((ct) => ct.tag_id === tagFilter)
      )
    }

    setContas(filtered)

    const { data: tagsData } = await supabase.from('tags').select('*').order('nome')
    if (tagsData) setTags(tagsData)

    setLoading(false)
  }, [month, year, empresa, tagFilter])

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

  const pendingPagar = contas.filter((c) => c.tipo === 'pagar' && c.status === 'pendente')
  const pendingReceber = contas.filter((c) => c.tipo === 'receber' && c.status === 'pendente')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral das finanças</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Mês</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {MESES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ano</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Empresa</label>
          <select
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Todas</option>
            {EMPRESAS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tag</label>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Todas</option>
            {tags.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <>
          <StatsCards custos={custos} vendas={vendas} entradas={entradas} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Contas a Pagar */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">💸 Contas a Pagar (Pendentes)</h2>
              </div>
              <div className="p-5">
                {pendingPagar.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Nenhuma conta pendente</p>
                ) : (
                  <div className="space-y-3">
                    {pendingPagar.map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.descricao}</p>
                          <p className="text-xs text-gray-500">{c.empresa} · Venc. {formatDate(c.data_vencimento)}</p>
                          <div className="flex gap-1 mt-1">
                            {c.contas_tags?.map((ct) => (
                              <span
                                key={ct.tag_id}
                                className="text-xs px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: ct.tags?.cor || '#6b7280' }}
                              >
                                {ct.tags?.nome}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-red-600">{formatCurrency(Number(c.valor))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contas a Receber */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">💰 Contas a Receber (Pendentes)</h2>
              </div>
              <div className="p-5">
                {pendingReceber.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Nenhuma conta pendente</p>
                ) : (
                  <div className="space-y-3">
                    {pendingReceber.map((c) => (
                      <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.descricao}</p>
                          <p className="text-xs text-gray-500">{c.empresa} · Venc. {formatDate(c.data_vencimento)}</p>
                          <div className="flex gap-1 mt-1">
                            {c.contas_tags?.map((ct) => (
                              <span
                                key={ct.tag_id}
                                className="text-xs px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: ct.tags?.cor || '#6b7280' }}
                              >
                                {ct.tags?.nome}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-600">{formatCurrency(Number(c.valor))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
