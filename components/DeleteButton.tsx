// app/components/DeleteButton.tsx
'use client'
import { useState, useTransition } from 'react'
import { Spinner } from './Spinner'

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
  const [isPending, startTransition] = useTransition()

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => {
            startTransition(async () => {
              const formData = new FormData()
              formData.append('id', id.toString())
              formData.append('babyId', babyId.toString())
              await onDelete(formData)
              setShowConfirm(false)
            })
          }}
          disabled={isPending}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 disabled:opacity-70 flex items-center gap-1"
        >
          {isPending && <Spinner className="h-3 w-3" />}
          Yes, delete
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="text-xs bg-baby-soft text-white px-2 py-1 rounded-lg hover:opacity-90 disabled:opacity-70"
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