'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type Tag } from '@/lib/supabase'
import { EMPRESAS } from '@/lib/utils'

export default function CadastrarConta() {
  const router = useRouter()
  const [tipo, setTipo] = useState<'pagar' | 'receber'>('pagar')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [dataVencimento, setDataVencimento] = useState('')
  const [empresa, setEmpresa] = useState<string>(EMPRESAS[0])
  const [observacoes, setObservacoes] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTags()
  }, [])

  async function loadTags() {
    const { data } = await supabase.from('tags').select('*').order('nome')
    if (data) setAllTags(data)
  }

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!descricao || !valor || !dataVencimento) return

    setSaving(true)

    const { data: conta, error } = await supabase.from('contas').insert({
      tipo,
      descricao,
      valor: parseFloat(valor),
      data_vencimento: dataVencimento,
      empresa,
      status: 'pendente',
      observacoes: observacoes || null,
    }).select().single()

    if (error || !conta) {
      alert('Erro ao cadastrar conta: ' + (error?.message || 'Erro desconhecido'))
      setSaving(false)
      return
    }

    if (selectedTags.length > 0) {
      await supabase.from('contas_tags').insert(
        selectedTags.map((tag_id) => ({ conta_id: conta.id, tag_id }))
      )
    }

    setSaving(false)
    router.push('/')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cadastrar Conta</h1>
        <p className="text-gray-500 text-sm mt-1">Adicione uma nova conta a pagar ou receber</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Tipo toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo('pagar')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  tipo === 'pagar'
                    ? 'bg-red-100 text-red-700 border-2 border-red-300'
                    : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                💸 Conta a Pagar
              </button>
              <button
                type="button"
                onClick={() => setTipo('receber')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  tipo === 'receber'
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                💰 Conta a Receber
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Aluguel escritório"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento *</label>
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhuma tag cadastrada. Crie tags primeiro.</p>
              ) : (
                allTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
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
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Informações adicionais..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[#1e40af] text-white rounded-xl font-medium text-sm hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Cadastrar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
