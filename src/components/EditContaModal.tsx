'use client'

import { useEffect, useState } from 'react'
import { supabase, type ContaWithTags, type Tag } from '@/lib/supabase'
import { EMPRESAS } from '@/lib/utils'

interface EditContaModalProps {
  conta: ContaWithTags | null
  onClose: () => void
  onSaved: () => void
}

export default function EditContaModal({ conta, onClose, onSaved }: EditContaModalProps) {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [dataVencimento, setDataVencimento] = useState('')
  const [dataPagamento, setDataPagamento] = useState('')
  const [status, setStatus] = useState<string>('pendente')
  const [empresa, setEmpresa] = useState<string>(EMPRESAS[0])
  const [tipo, setTipo] = useState<string>('pagar')
  const [observacoes, setObservacoes] = useState('')
  const [recorrente, setRecorrente] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (conta) {
      setDescricao(conta.descricao)
      setValor(String(conta.valor))
      setDataVencimento(conta.data_vencimento)
      setDataPagamento(conta.data_pagamento || '')
      setStatus(conta.status)
      setEmpresa(conta.empresa)
      setTipo(conta.tipo)
      setObservacoes(conta.observacoes || '')
      setRecorrente((conta as unknown as { recorrente?: boolean }).recorrente || false)
      setSelectedTags(conta.contas_tags?.map((ct) => ct.tag_id) || [])
    }
    loadTags()
  }, [conta])

  async function loadTags() {
    const { data } = await supabase.from('tags').select('*').order('nome')
    if (data) setAllTags(data)
  }

  async function handleSave() {
    if (!conta) return
    setSaving(true)

    const updates = {
      descricao,
      valor: parseFloat(valor),
      data_vencimento: dataVencimento,
      data_pagamento: dataPagamento || null,
      status,
      empresa,
      tipo,
      observacoes: observacoes || null,
      recorrente,
      updated_at: new Date().toISOString(),
    }

    await supabase.from('contas').update(updates).eq('id', conta.id)

    // Update tags
    await supabase.from('contas_tags').delete().eq('conta_id', conta.id)
    if (selectedTags.length > 0) {
      await supabase.from('contas_tags').insert(
        selectedTags.map((tag_id) => ({ conta_id: conta.id, tag_id }))
      )
    }

    setSaving(false)
    onSaved()
  }

  async function handleDelete() {
    if (!conta) return
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return

    await supabase.from('contas_tags').delete().eq('conta_id', conta.id)
    await supabase.from('contas').delete().eq('id', conta.id)
    onSaved()
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  if (!conta) return null

  const statusOptions = tipo === 'pagar'
    ? ['pendente', 'a_pagar', 'pago', 'cancelado']
    : ['pendente', 'recebido', 'cancelado']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Editar Conta</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="pagar">Pagar</option>
              <option value="receber">Receber</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pagamento</label>
              <input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {EMPRESAS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: tag.cor }}
                  />
                  {tag.nome}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={recorrente}
                onChange={(e) => setRecorrente(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">🔄 Conta Recorrente</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
          >
            Excluir
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-[#1e40af] hover:bg-blue-800 rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
