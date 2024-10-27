// app/components/DayPicker.tsx
'use client'
import { format, addDays, subDays } from 'date-fns'

export function DayPicker({ 
  selectedDate, 
  onChange 
}: { 
  selectedDate: Date
  onChange: (date: Date) => void
}) {
  return (
    <div className="flex items-center justify-between mb-4 bg-baby-rose/20 rounded-xl p-2">
      <button
        onClick={() => onChange(subDays(selectedDate, 1))}
        className="p-2 text-baby-accent hover:text-baby-soft"
      >
        ←
      </button>
      
      <div className="text-center">
        {format(selectedDate, 'dd MMM yyyy') === format(new Date(), 'dd MMM yyyy') 
          ? 'Today' 
          : format(selectedDate, 'dd MMM yyyy')}
      </div>

      <button
        onClick={() => onChange(addDays(selectedDate, 1))}
        disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
        className="p-2 text-baby-accent hover:text-baby-soft disabled:opacity-50"
      >
        →
      </button>
    </div>
  )
}