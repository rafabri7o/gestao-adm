'use client'

import { useEffect, useState } from 'react'
import { supabase, type Tag } from '@/lib/supabase'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#6b7280',
]

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState(PRESET_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editCor, setEditCor] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTags()
  }, [])

  async function loadTags() {
    setLoading(true)
    const { data } = await supabase.from('tags').select('*').order('nome')
    if (data) setTags(data)
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return

    await supabase.from('tags').insert({ nome: nome.trim(), cor })
    setNome('')
    setCor(PRESET_COLORS[0])
    loadTags()
  }

  async function handleUpdate(id: string) {
    if (!editNome.trim()) return
    await supabase.from('tags').update({ nome: editNome.trim(), cor: editCor }).eq('id', id)
    setEditingId(null)
    loadTags()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta tag?')) return
    await supabase.from('contas_tags').delete().eq('tag_id', id)
    await supabase.from('tags').delete().eq('id', id)
    loadTags()
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id)
    setEditNome(tag.nome)
    setEditCor(tag.cor)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Tags</h1>
        <p className="text-gray-500 text-sm mt-1">Organize suas contas com tags</p>
      </div>

      {/* Create Tag */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 max-w-xl">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Nova Tag</h2>
        <form onSubmit={handleCreate} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Marketing"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Cor</label>
            <div className="flex gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    cor === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#1e40af] text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            Criar
          </button>
        </form>
      </div>

      {/* Tag List */}
      <div className="bg-white rounded-2xl shadow-sm max-w-xl">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Tags Cadastradas</h2>
        </div>
        <div className="p-5">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-4">Carregando...</p>
          ) : tags.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Nenhuma tag cadastrada</p>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                  {editingId === tag.id ? (
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="text"
                        value={editNome}
                        onChange={(e) => setEditNome(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <div className="flex gap-1">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEditCor(c)}
                            className={`w-5 h-5 rounded-full ${editCor === c ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => handleUpdate(tag.id)}
                        className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.cor }}
                        />
                        <span className="text-sm font-medium text-gray-900">{tag.nome}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(tag)}
                          className="text-xs px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="text-xs px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
