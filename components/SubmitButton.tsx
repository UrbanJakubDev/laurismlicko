// app/components/SubmitButton.tsx
'use client'
import { useFormStatus } from 'react-dom'
import { Spinner } from './Spinner'

export function SubmitButton({ 
  children,
  className = "w-full bg-baby-accent text-white py-3 rounded-xl hover:bg-baby-soft transition-colors duration-200"
}: { 
  children: React.ReactNode
  className?: string 
}) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} ${pending ? 'opacity-70' : ''} flex items-center justify-center gap-2`}
    >
      {pending && <Spinner />}
      {children}
    </button>
  )
}