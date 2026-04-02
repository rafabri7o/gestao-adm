'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, type ContaWithTags, type Tag } from '@/lib/supabase'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getEmpresaColor, getMonthRange, EMPRESAS, MESES } from '@/lib/utils'
import EditContaModal from '@/components/EditContaModal'

export default function ContasPagar() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [empresa, setEmpresa] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [contas, setContas] = useState<ContaWithTags[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [editConta, setEditConta] = useState<ContaWithTags | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const { start, end } = getMonthRange(year, month)

    let query = supabase
      .from('contas')
      .select('*, contas_tags(conta_id, tag_id, tags(*))')
      .eq('tipo', 'pagar')
      .gte('data_vencimento', start)
      .lte('data_vencimento', end)
      .order('data_vencimento')

    if (empresa) query = query.eq('empresa', empresa)
    if (statusFilter) query = query.eq('status', statusFilter)

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
  }, [month, year, empresa, statusFilter, tagFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function markAsPago(id: string) {
    await supabase.from('contas').update({
      status: 'pago',
      data_pagamento: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    loadData()
  }

  const filterClass = 'border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-300 focus:border-brand-300 focus:outline-none bg-white text-gray-600'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contas a Pagar</h1>
        <p className="text-gray-400 text-sm mt-1">Gerencie suas despesas</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-4 items-end animate-fade-in">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Mês</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={filterClass}>
            {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Ano</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={filterClass}>
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Empresa</label>
          <select value={empresa} onChange={(e) => setEmpresa(e.target.value)} className={filterClass}>
            <option value="">Todas</option>
            {EMPRESAS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterClass}>
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Tag</label>
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className={filterClass}>
            <option value="">Todas</option>
            {tags.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <div className="text-3xl mb-3 animate-pulse-subtle">⏳</div>
          Carregando...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Descrição</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Empresa</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Valor</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Vencimento</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Tags</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contas.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Nenhuma conta encontrada</td></tr>
                ) : (
                  contas.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setEditConta(c)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{c.descricao}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getEmpresaColor(c.empresa)}`}>
                          {c.empresa}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-bold text-right text-gray-900">{formatCurrency(Number(c.valor))}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(c.data_vencimento)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(c.status)}`}>
                          {getStatusLabel(c.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1 flex-wrap">
                          {c.contas_tags?.map((ct) => (
                            <span
                              key={ct.tag_id}
                              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                            >
                              {ct.tags?.nome}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditConta(c) }}
                            className="text-gray-400 hover:text-brand-600 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          {c.status === 'pendente' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAsPago(c.id) }}
                              className="text-xs px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors"
                            >
                              Marcar Pago
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditContaModal
        conta={editConta}
        onClose={() => setEditConta(null)}
        onSaved={() => { setEditConta(null); loadData() }}
      />
    </div>
  )
}
