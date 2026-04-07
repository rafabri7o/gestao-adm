'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, type ContaWithTags, type Tag } from '@/lib/supabase'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, getEmpresaColor, getMonthRange, EMPRESAS, MESES, exportToCSV, calcContaTotal } from '@/lib/utils'
import EditContaModal from '@/components/EditContaModal'

export default function ContasPagar() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [empresa, setEmpresa] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [busca, setBusca] = useState('')
  const [contas, setContas] = useState<ContaWithTags[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [editConta, setEditConta] = useState<ContaWithTags | null>(null)
  const [sortBy, setSortBy] = useState('vencimento')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function handleSort(col: string) {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  const sortIcon = (col: string) => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

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

  const filteredContas = contas.filter((c) => {
    if (!busca) return true
    const termo = busca.toLowerCase()
    return (
      c.descricao.toLowerCase().includes(termo) ||
      c.empresa.toLowerCase().includes(termo) ||
      c.observacoes?.toLowerCase().includes(termo) ||
      c.contas_tags?.some((ct) => ct.tags?.nome.toLowerCase().includes(termo))
    )
  })

  const sortedContas = [...filteredContas].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'vencimento': cmp = new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime(); break
      case 'valor': cmp = Number(a.valor) - Number(b.valor); break
      case 'acrescimo': cmp = Number(a.acrescimo || 0) - Number(b.acrescimo || 0); break
      case 'juros': cmp = Number(a.juros || 0) - Number(b.juros || 0); break
      case 'multa': cmp = Number(a.multa || 0) - Number(b.multa || 0); break
      case 'desconto': cmp = Number(a.desconto || 0) - Number(b.desconto || 0); break
      case 'total': {
        cmp = calcContaTotal(a) - calcContaTotal(b); break
      }
      case 'nome': cmp = a.descricao.localeCompare(b.descricao); break
      case 'empresa': cmp = a.empresa.localeCompare(b.empresa); break
      case 'status': cmp = a.status.localeCompare(b.status); break
      case 'tags': {
        const aTag = a.contas_tags?.[0]?.tags?.nome || ''
        const bTag = b.contas_tags?.[0]?.tags?.nome || ''
        cmp = aTag.localeCompare(bTag); break
      }
      default: cmp = 0
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  function isUrgent(c: ContaWithTags) {
    if (c.status !== 'pendente' && c.status !== 'a_pagar') return false
    const venc = new Date(c.data_vencimento)
    const hoje = new Date()
    const diff = (venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    if (diff > 5) return false
    const hasTrabalhistas = c.contas_tags?.some((ct) => ct.tags?.nome === 'Despesas Trabalhistas')
    const hasImposto = c.contas_tags?.some((ct) => ct.tags?.nome === 'Imposto')
    return hasTrabalhistas || hasImposto
  }

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
            <option value="a_pagar">A Pagar</option>
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

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Buscar</label>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Descrição, empresa, tag..."
            className={`${filterClass} min-w-[200px]`}
          />
        </div>

        <button
          onClick={() => exportToCSV(sortedContas, `contas-pagar-${MESES[month - 1]}-${year}`)}
          disabled={filteredContas.length === 0}
          className="ml-auto border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span>📥</span> Exportar CSV
        </button>
      </div>

      {/* Summary Boxes */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
          {(() => {
            const aPagar = contas
              .filter((c) => c.status === 'pendente' || c.status === 'a_pagar')
              .reduce((sum, c) => sum + calcContaTotal(c), 0)

            const pago = contas
              .filter((c) => c.status === 'pago')
              .reduce((sum, c) => sum + calcContaTotal(c), 0)

            const total = contas.reduce((sum, c) => sum + calcContaTotal(c), 0)

            return (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">A Pagar</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(aPagar)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Pago</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(pago)}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Total do Mês</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
                </div>
              </>
            )
          })()}
        </div>
      )}

      {/* Pie Chart - Gastos por Tag */}
      {!loading && contas.length > 0 && (() => {
        const tagTotals: Record<string, { nome: string; cor: string; total: number }> = {}
        contas.forEach((c) => {
          if (c.contas_tags && c.contas_tags.length > 0) {
            c.contas_tags.forEach((ct) => {
              const nome = ct.tags?.nome || 'Sem tag'
              const cor = ct.tags?.cor || '#9ca3af'
              if (!tagTotals[nome]) tagTotals[nome] = { nome, cor, total: 0 }
              tagTotals[nome].total += calcContaTotal(c) / c.contas_tags.length
            })
          } else {
            if (!tagTotals['Sem tag']) tagTotals['Sem tag'] = { nome: 'Sem tag', cor: '#9ca3af', total: 0 }
            tagTotals['Sem tag'].total += calcContaTotal(c)
          }
        })

        const entries = Object.values(tagTotals).sort((a, b) => b.total - a.total)
        const grandTotal = entries.reduce((sum, e) => sum + e.total, 0)
        if (grandTotal === 0) return null

        // Build SVG pie slices
        let cumAngle = 0
        const slices = entries.map((entry) => {
          const pct = entry.total / grandTotal
          const startAngle = cumAngle
          cumAngle += pct * 360
          const endAngle = cumAngle
          const startRad = ((startAngle - 90) * Math.PI) / 180
          const endRad = ((endAngle - 90) * Math.PI) / 180
          const largeArc = pct > 0.5 ? 1 : 0
          const x1 = 100 + 80 * Math.cos(startRad)
          const y1 = 100 + 80 * Math.sin(startRad)
          const x2 = 100 + 80 * Math.cos(endRad)
          const y2 = 100 + 80 * Math.sin(endRad)

          if (pct >= 0.999) {
            return { ...entry, pct, path: null }
          }

          const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`
          return { ...entry, pct, path }
        })

        return (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 animate-fade-in">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Gastos por Tag</h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <svg viewBox="0 0 200 200" className="w-48 h-48 flex-shrink-0">
                {slices.map((s, i) =>
                  s.path ? (
                    <path key={i} d={s.path} fill={s.cor} stroke="white" strokeWidth="2" />
                  ) : (
                    <circle key={i} cx="100" cy="100" r="80" fill={s.cor} />
                  )
                )}
              </svg>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {slices.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.cor }} />
                    <span className="text-sm text-gray-700">{s.nome}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(s.total)}</span>
                    <span className="text-xs text-gray-400">({(s.pct * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

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
                  <th onClick={() => handleSort('nome')} className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none">Descrição{sortIcon('nome')}</th>
                  <th onClick={() => handleSort('empresa')} className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none">Empresa{sortIcon('empresa')}</th>
                  <th onClick={() => handleSort('valor')} className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none">Valor{sortIcon('valor')}</th>
                  <th onClick={() => handleSort('acrescimo')} className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none">Acréscimo{sortIcon('acrescimo')}</th>
                  <th onClick={() => handleSort('juros')} className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none">Juros{sortIcon('juros')}</th>
                  <th onClick={() => handleSort('multa')} className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none">Multa{sortIcon('multa')}</th>
                  <th onClick={() => handleSort('desconto')} className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none">Descontos{sortIcon('desconto')}</th>
                  <th onClick={() => handleSort('total')} className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none">Total{sortIcon('total')}</th>
                  <th onClick={() => handleSort('vencimento')} className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none">Vencimento{sortIcon('vencimento')}</th>
                  <th onClick={() => handleSort('status')} className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none">Status{sortIcon('status')}</th>
                  <th onClick={() => handleSort('tags')} className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none">Tags{sortIcon('tags')}</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContas.length === 0 ? (
                  <tr><td colSpan={12} className="text-center py-12 text-gray-400 text-sm">Nenhuma conta encontrada</td></tr>
                ) : (
                  sortedContas.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setEditConta(c)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                        {isUrgent(c) && <span title="Vencimento próximo!" className="mr-1">🚨</span>}
                        {c.descricao}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getEmpresaColor(c.empresa)}`}>
                          {c.empresa}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-bold text-right text-gray-900">{formatCurrency(Number(c.valor))}</td>
                      <td className="px-5 py-3.5 text-sm text-right text-gray-500">{c.acrescimo ? formatCurrency(Number(c.acrescimo)) : '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-right text-gray-500">{c.juros ? formatCurrency(Number(c.juros)) : '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-right text-gray-500">{c.multa ? formatCurrency(Number(c.multa)) : '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-right text-green-600">{c.desconto ? formatCurrency(Number(c.desconto)) : '—'}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-right text-gray-900">
                        {formatCurrency(calcContaTotal(c))}
                      </td>
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
