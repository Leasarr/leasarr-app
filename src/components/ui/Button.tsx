import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'chip' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'primary-gradient text-on-primary font-bold rounded-xl shadow-primary active:scale-95 transition-all duration-150 inline-flex items-center gap-2 justify-center min-h-[44px]',
  secondary: 'bg-surface-container-high text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest transition-colors duration-150 inline-flex items-center gap-2 justify-center min-h-[44px]',
  ghost: 'bg-transparent text-on-surface font-semibold rounded-xl hover:bg-surface-container transition-colors duration-150 inline-flex items-center gap-2 justify-center min-h-[44px]',
  chip: 'rounded-full font-bold uppercase tracking-wide transition-colors inline-flex items-center gap-2 bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest',
  destructive: 'bg-error text-on-error font-bold rounded-xl active:scale-95 transition-all duration-150 inline-flex items-center gap-2 justify-center min-h-[44px] hover:opacity-90',
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

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  const sizing = variant === 'chip' ? chipSizeStyles[size] : sizeStyles[size]

  return (
    <button
      className={cn(variantStyles[variant], sizing, className)}
      {...props}
    />
  )
}
