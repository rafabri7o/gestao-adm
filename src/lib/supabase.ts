import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Tag = {
  id: string
  nome: string
  cor: string
  created_at: string
}

export type Conta = {
  id: string
  tipo: 'pagar' | 'receber'
  descricao: string
  valor: number
  data_vencimento: string
  data_pagamento: string | null
  status: 'pendente' | 'a_pagar' | 'pago' | 'recebido' | 'cancelado'
  empresa: 'RB7 Digital' | 'RB7 Incorporadora' | 'RB7 Participações' | 'Rafa Brito (Pessoal)'
  observacoes: string | null
  created_at: string
  updated_at: string
}

export type ContaTag = {
  conta_id: string
  tag_id: string
  tags: Tag
}

export type ContaWithTags = Conta & {
  contas_tags: ContaTag[]
}
