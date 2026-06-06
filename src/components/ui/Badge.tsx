import * as React from 'react';
import { cn } from '@/lib/utils/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none';

  const variants = {
    primary: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    secondary: 'bg-slate-800 text-slate-200 border border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    outline: 'text-slate-300 border border-slate-700 bg-transparent',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}

export default Badge;
