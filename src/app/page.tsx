'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, type ContaWithTags, type Tag } from '@/lib/supabase'
import { formatCurrency, formatDate, EMPRESAS, exportToCSV, calcContaTotal } from '@/lib/utils'
import StatsCards from '@/components/StatsCards'
import DatePicker from '@/components/DatePicker'

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Dashboard() {
  const now = new Date()
  // Default: current month
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [startDate, setStartDate] = useState(fmt(firstOfMonth))
  const [endDate, setEndDate] = useState(fmt(lastOfMonth))
  const [empresa, setEmpresa] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [contas, setContas] = useState<ContaWithTags[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('contas')
      .select('*, contas_tags(conta_id, tag_id, tags(*))')
      .gte('data_vencimento', startDate)
      .lte('data_vencimento', endDate)
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
  }, [startDate, endDate, empresa, tagFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const custos = contas
    .filter((c) => c.tipo === 'pagar' && c.status === 'pago')
    .reduce((sum, c) => sum + calcContaTotal(c), 0)

  const vendas = contas
    .filter((c) => c.tipo === 'receber')
    .reduce((sum, c) => sum + calcContaTotal(c), 0)

  const entradas = contas
    .filter((c) => c.tipo === 'receber' && c.status === 'recebido')
    .reduce((sum, c) => sum + calcContaTotal(c), 0)

  const totalPagar = contas
    .filter((c) => c.tipo === 'pagar')
    .reduce((sum, c) => sum + calcContaTotal(c), 0)

  const totalReceber = contas
    .filter((c) => c.tipo === 'receber')
    .reduce((sum, c) => sum + calcContaTotal(c), 0)

  const pendingPagar = contas.filter((c) => c.tipo === 'pagar' && (c.status === 'pendente' || c.status === 'a_pagar'))
  const pendingReceber = contas.filter((c) => c.tipo === 'receber' && c.status === 'pendente')

  const selectClass = 'px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 text-gray-600 bg-white'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Visão geral das finanças</p>
      </div>

      <StatsCards custos={custos} vendas={vendas} entradas={entradas} />

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex items-center gap-4 flex-wrap animate-fade-in">
        <DatePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(s, e) => { setStartDate(s); setEndDate(e) }}
        />
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

        <button
          onClick={() => exportToCSV(contas, `dashboard-${startDate}-a-${endDate}`)}
          disabled={contas.length === 0}
          className="ml-auto border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>📥</span> Exportar CSV
        </button>
      </div>

      {/* Totals for filtered period */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Total a Pagar (Período)</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPagar)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Total a Receber (Período)</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceber)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Saldo do Período</p>
            <p className={`text-2xl font-bold ${totalReceber - totalPagar >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalReceber - totalPagar)}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
          <div className="text-3xl mb-3 animate-pulse">⏳</div>
          Carregando...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contas a Pagar */}
          <div className="bg-white rounded-2xl border border-gray-100 animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">💸 Contas a Pagar (Pendentes)</h2>
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
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: ct.tags?.cor || '#6b7280' }}
                          >
                            {ct.tags?.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-red-500">{formatCurrency(calcContaTotal(c))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contas a Receber */}
          <div className="bg-white rounded-2xl border border-gray-100 animate-fade-in">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">💰 Contas a Receber (Pendentes)</h2>
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
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: ct.tags?.cor || '#6b7280' }}
                          >
                            {ct.tags?.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-500">{formatCurrency(calcContaTotal(c))}</span>
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
