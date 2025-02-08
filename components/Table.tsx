'use client'
import { ReactNode } from 'react'

type Column<T> = {
  header: string
  accessor: keyof T | ((item: T) => ReactNode)
  align?: 'left' | 'right' | 'center'
  subrow?: 'top' | 'bottom'
  mobileLabel?: string  // Label to show on mobile view
  units?: string       // Units to show after the value
}

type TableProps<T> = {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
}

export function Table<T>({ data, columns, onRowClick }: TableProps<T>) {
  const topColumns = columns.filter(col => !col.subrow || col.subrow === 'top')
  const bottomColumns = columns.filter(col => col.subrow === 'bottom')

  const renderValue = (item: T, column: Column<T>) => {
    const value = typeof column.accessor === 'function'
      ? column.accessor(item)
      : (item[column.accessor] as ReactNode)

    // Check if the value is a Date object
    if (value instanceof Date) {
      // Format the date as desired
      const formattedDate = value.toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      return (
        <>
          {formattedDate}
          {column.units && <span className="ml-1 text-baby-soft/70">{column.units}</span>}
        </>
      )
    }

    return (
      <>
        {value}
        {column.units && <span className="ml-1 text-baby-soft/70">{column.units}</span>}
      </>
    )
  }

  return (
    <div className="overflow-x-auto">
      {/* Desktop view - hidden on mobile */}
      <table className="w-full hidden md:table">
        <thead>
          <tr className="border-b border-baby-pink/30">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`py-2 px-4 text-sm font-medium text-baby-soft ${
                  column.align ? `text-${column.align}` : 'text-left'
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-baby-pink/30 ${
                onRowClick ? 'cursor-pointer hover:bg-baby-rose/10' : ''
              }`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`py-2 px-4 text-baby-soft ${
                    column.align ? `text-${column.align}` : 'text-left'
                  }`}
                >
                  {renderValue(item, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile view - shown only on mobile */}
      <div className="md:hidden">
        {data.map((item, rowIndex) => (
          <div
            key={rowIndex}
            className={`border-b border-baby-pink/30 py-2 ${
              onRowClick ? 'cursor-pointer hover:bg-baby-rose/10' : ''
            }`}
            onClick={() => onRowClick?.(item)}
          >
            {/* Top subrow */}
            <div className="flex justify-between items-center mb-1">
              {topColumns.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className={`px-4 ${
                    column.align ? `text-${column.align}` : 'text-left'
                  }`}
                >
                  {column.mobileLabel && (
                    <span className="text-xs text-baby-soft/70 block">
                      {column.mobileLabel}
                    </span>
                  )}
                  <span className="text-black/60">
                    {renderValue(item, column)}
                  </span>
                </div>
              ))}
            </div>
            {/* Bottom subrow */}
            <div className="flex justify-between items-center">
              {bottomColumns.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className={`px-4 ${
                    column.align ? `text-${column.align}` : 'text-left'
                  }`}
                >
                  {column.mobileLabel && (
                    <span className="text-xs text-baby-soft/70 block">
                      {column.mobileLabel}
                    </span>
                  )}
                  <span className="text-black/60 text-sm">
                    {renderValue(item, column)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
