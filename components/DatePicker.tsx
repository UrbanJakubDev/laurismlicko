'use client'
import { format, addDays, subDays } from 'date-fns'
import { cs } from 'date-fns/locale'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import { Card } from './ui/Card'

export function DayPicker({ 
  selectedDate, 
  onChange 
}: { 
  selectedDate: Date
  onChange: (date: Date) => void
}) {
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

  return (
    <Card className="flex items-center justify-between p-2">
      <button
        onClick={() => onChange(subDays(selectedDate, 1))}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-bg-elevated text-text-secondary hover:bg-bg-primary transition-colors active:scale-95"
      >
        <FaChevronLeft size={16} />
      </button>
      
      <div className="text-center font-semibold text-text-primary">
        {isToday 
          ? 'Dnes' 
          : format(selectedDate, 'd. MMMM', { locale: cs })}
      </div>

      <button
        onClick={() => onChange(addDays(selectedDate, 1))}
        disabled={isToday}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
          isToday 
            ? 'opacity-30' 
            : 'bg-bg-elevated text-text-secondary hover:bg-bg-primary active:scale-95'
        }`}
      >
        <FaChevronRight size={16} />
      </button>
    </Card>
  )
}