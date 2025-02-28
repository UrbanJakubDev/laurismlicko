// app/components/DayPicker.tsx
'use client'
import { format, addDays, subDays } from 'date-fns'
import { FaCircleChevronLeft, FaCircleChevronRight } from 'react-icons/fa6'
export function DayPicker({ 
  selectedDate, 
  onChange 
}: { 
  selectedDate: Date
  onChange: (date: Date) => void
}) {
  return (
    <div className="flex items-center justify-between mb-4 bg-white border border-gray-100 shadow-md rounded-xl">
      <button
        onClick={() => onChange(subDays(selectedDate, 1))}
        className="p-2 text-baby-accent hover:text-baby-soft text-3xl"
      >
        <FaCircleChevronLeft />
      </button>
      
      <div className="text-center font-semibold">
        {format(selectedDate, 'dd MMM yyyy') === format(new Date(), 'dd MMM yyyy') 
          ? 'Dnes' 
          : format(selectedDate, 'dd MMM yyyy')}
      </div>

      <button
        onClick={() => onChange(addDays(selectedDate, 1))}
        disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
        className="p-2 text-baby-accent hover:text-baby-soft disabled:opacity-50 text-3xl"
      >
        <FaCircleChevronRight />
      </button>
    </div>
  )
}