import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'chip' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  iconLeft?: string
  iconRight?: string
}

const baseStyles =
  'inline-flex items-center gap-2 justify-center transition-all duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ' +
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none disabled:active:scale-100'

const variantStyles: Record<ButtonVariant, string> = {
  primary:     'primary-gradient text-on-primary font-bold rounded-xl shadow-primary hover:brightness-110 active:scale-95 min-h-[44px]',
  secondary:   'bg-surface-container-high text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest active:scale-95 min-h-[44px]',
  ghost:       'bg-transparent text-on-surface font-semibold rounded-xl hover:bg-surface-container active:scale-95 min-h-[44px]',
  chip:        'rounded-full font-bold uppercase tracking-wide bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest',
  destructive: 'bg-error text-on-error font-bold rounded-xl hover:opacity-90 active:scale-95 min-h-[44px]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const chipSizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-[10px]',
  md: 'px-4 py-2 text-xs',
  lg: 'px-5 py-2.5 text-sm',
}

const iconSizeStyles: Record<ButtonSize, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, iconLeft, iconRight, disabled, className, children, ...props },
  ref,
) {
  const sizing = variant === 'chip' ? chipSizeStyles[size] : sizeStyles[size]
  const iconSize = iconSizeStyles[size]
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(baseStyles, variantStyles[variant], sizing, className)}
      {...props}
    >
      {loading ? (
        <span className={cn('material-symbols-outlined animate-spin', iconSize)}>progress_activity</span>
      ) : iconLeft ? (
        <span className={cn('material-symbols-outlined', iconSize)}>{iconLeft}</span>
      ) : null}
      <span className={cn(loading && 'opacity-70')}>{children}</span>
      {!loading && iconRight && (
        <span className={cn('material-symbols-outlined', iconSize)}>{iconRight}</span>
      )}
    </button>
  )
})
