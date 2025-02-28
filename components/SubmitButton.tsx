// app/components/SubmitButton.tsx
'use client'
import { Spinner } from './Spinner'

type SubmitButtonProps = {
  children: React.ReactNode;
  isSubmitting?: boolean;
};

export function SubmitButton({ children, isSubmitting }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full bg-baby-accent text-white py-3 rounded-xl hover:bg-baby-accent/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <div className="flex items-center justify-center gap-2">
          <Spinner />
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
}