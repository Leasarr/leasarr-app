interface FormFieldProps {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  className?: string
  children: React.ReactNode
}

export function FormField({ label, hint, error, optional, className, children }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-on-surface mb-1.5">
        {label}
        {optional && <span className="font-normal text-on-surface-variant"> (optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-on-surface-variant mt-1">{hint}</p>}
      {error && <p className="text-sm text-error mt-1">{error}</p>}
    </div>
  )
}
