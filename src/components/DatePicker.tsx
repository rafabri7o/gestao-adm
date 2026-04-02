'use client'

import { useState, useRef, useEffect } from 'react'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

type Props = {
  startDate: string
  endDate: string
  onChange: (start: string, end: string) => void
}

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtDisplay(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${String(d.getDate()).padStart(2, '0')} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0
}

export default function DatePicker({ startDate, endDate, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [calMonth, setCalMonth] = useState(new Date(startDate + 'T12:00:00').getMonth())
  const [calYear, setCalYear] = useState(new Date(startDate + 'T12:00:00').getFullYear())
  const [selecting, setSelecting] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const today = new Date()
  const todayStr = fmt(today)

  const presets = [
    { label: 'Hoje', fn: () => { const d = fmt(today); onChange(d, d) } },
    { label: 'Ontem', fn: () => { const d = new Date(today); d.setDate(d.getDate() - 1); const s = fmt(d); onChange(s, s) } },
    { label: 'Últimos 7 dias', fn: () => { const d = new Date(today); d.setDate(d.getDate() - 6); onChange(fmt(d), fmt(today)) } },
    { label: 'Últimos 14 dias', fn: () => { const d = new Date(today); d.setDate(d.getDate() - 13); onChange(fmt(d), fmt(today)) } },
    { label: 'Últimos 30 dias', fn: () => { const d = new Date(today); d.setDate(d.getDate() - 29); onChange(fmt(d), fmt(today)) } },
    { label: 'Esta semana', fn: () => { const d = new Date(today); const day = d.getDay(); const diff = day === 0 ? 6 : day - 1; d.setDate(d.getDate() - diff); onChange(fmt(d), fmt(today)) } },
    { label: 'Este mês', fn: () => { const s = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`; onChange(s, fmt(today)) } },
    { label: 'Mês passado', fn: () => { const d = new Date(today.getFullYear(), today.getMonth() - 1, 1); const e = new Date(today.getFullYear(), today.getMonth(), 0); onChange(fmt(d), fmt(e)) } },
  ]

  function handleDayClick(day: number) {
    const clicked = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (!selecting) {
      setSelecting(clicked)
    } else {
      const s = selecting < clicked ? selecting : clicked
      const e = selecting < clicked ? clicked : selecting
      onChange(s, e)
      setSelecting(null)
    }
  }

  function isInRange(day: number) {
    const d = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (selecting) return d === selecting
    return d >= startDate && d <= endDate
  }

  function isStart(day: number) {
    const d = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return d === startDate
  }

  function isEnd(day: number) {
    const d = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return d === endDate
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) }
    else setCalMonth(calMonth - 1)
  }

  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) }
    else setCalMonth(calMonth + 1)
  }

  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDayOfMonth(calYear, calMonth)

  const displayText = startDate === endDate
    ? fmtDisplay(startDate)
    : `${fmtDisplay(startDate)} — ${fmtDisplay(endDate)}`

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-gray-300 transition-colors bg-white"
      >
        <span>📅</span>
        <span>{displayText}</span>
        <span className="text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-lg z-50 flex animate-scale-in">
          {/* Presets */}
          <div className="border-r border-gray-100 p-4 w-48">
            <p className="text-xs font-medium text-gray-400 uppercase mb-3">Atalhos</p>
            <div className="space-y-1">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => { p.fn(); setOpen(false); setSelecting(null) }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="p-4 w-72">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="text-gray-400 hover:text-gray-600 p-1">←</button>
              <span className="text-sm font-medium text-gray-900">
                {MESES[calMonth]} {calYear}
              </span>
              <button onClick={nextMonth} className="text-gray-400 hover:text-gray-600 p-1">→</button>
            </div>

            <div className="grid grid-cols-7 gap-0 mb-2">
              {DIAS_SEMANA.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const inRange = isInRange(day)
                const start = isStart(day)
                const end = isEnd(day)
                const isToday = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` === todayStr

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`text-center text-sm py-1.5 transition-colors rounded-lg
                      ${inRange ? 'bg-brand-100 text-brand-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                      ${start || end ? 'bg-brand-600 text-white font-medium hover:bg-brand-700' : ''}
                      ${isToday && !inRange ? 'font-bold text-brand-600' : ''}
                    `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {selecting && (
              <p className="text-xs text-gray-400 mt-3 text-center">Selecione a data final</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
