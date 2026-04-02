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
    case 'pendente': return 'bg-yellow-100 text-yellow-800'
    case 'pago': case 'recebido': return 'bg-green-100 text-green-800'
    case 'cancelado': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pendente': return 'Pendente'
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
