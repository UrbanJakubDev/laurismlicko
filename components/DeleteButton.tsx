// app/components/DeleteButton.tsx
'use client'
import { useState } from 'react'

export function DeleteButton({ 
  onDelete,
  id,
  babyId 
}: { 
  onDelete: (formData: FormData) => void,
  id: number,
  babyId: number
}) {
  const [showConfirm, setShowConfirm] = useState(false)

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => {
            const formData = new FormData()
            formData.append('id', id.toString())
            formData.append('babyId', babyId.toString())
            onDelete(formData)
          }}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600"
        >
          Yes, delete
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-xs bg-baby-soft text-white px-2 py-1 rounded-lg hover:opacity-90"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-xs text-red-500 hover:text-red-600"
    >
      Delete
    </button>
  )
}