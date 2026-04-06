export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr + 'T12:00:00')
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function getMonthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pendente': return 'bg-orange-100 text-orange-800'
    case 'a_pagar': return 'bg-red-100 text-red-800'
    case 'pago': case 'recebido': return 'bg-green-100 text-green-800'
    case 'cancelado': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pendente': return 'Pendente'
    case 'a_pagar': return 'A Pagar'
    case 'pago': return 'Pago'
    case 'recebido': return 'Recebido'
    case 'cancelado': return 'Cancelado'
    default: return status
  }
}

export function getEmpresaColor(empresa: string): string {
  switch (empresa) {
    case 'RB7 Digital': return 'bg-blue-100 text-blue-800'
    case 'RB7 Incorporadora': return 'bg-purple-100 text-purple-800'
    case 'RB7 Participações': return 'bg-indigo-100 text-indigo-800'
    case 'Rafa Brito (Pessoal)': return 'bg-teal-100 text-teal-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const EMPRESAS = [
  'RB7 Digital',
  'RB7 Incorporadora',
  'RB7 Participações',
  'Rafa Brito (Pessoal)',
] as const

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
] as const

export function exportToCSV(
  contas: Array<{
    descricao: string
    empresa: string
    valor: number
    data_vencimento: string
    data_pagamento: string | null
    status: string
    tipo: string
    contas_tags?: Array<{ tags?: { nome?: string } | null }> | null
  }>,
  filename: string
) {
  const header = 'Descrição;Empresa;Tipo;Valor;Vencimento;Pagamento;Status;Tags'
  const rows = contas.map((c) => {
    const tags = c.contas_tags?.map((ct) => ct.tags?.nome || '').filter(Boolean).join(', ') || ''
    return [
      c.descricao,
      c.empresa,
      c.tipo === 'pagar' ? 'Pagar' : 'Receber',
      Number(c.valor).toFixed(2).replace('.', ','),
      formatDate(c.data_vencimento),
      c.data_pagamento ? formatDate(c.data_pagamento) : '',
      getStatusLabel(c.status),
      tags,
    ].join(';')
  })

  const bom = '\uFEFF'
  const csv = bom + [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
