import * as React from 'react';
import { cn } from '@/lib/utils/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/10 active:scale-[0.98]',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-[0.98]',
      outline: 'border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200 hover:text-white',
      ghost: 'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white',
      link: 'bg-transparent underline-offset-4 hover:underline text-blue-500 hover:text-blue-400 p-0',
      danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold active:scale-[0.98]',
      gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-9 px-3 py-1.5 text-xs',
      md: 'h-11 px-4 py-2',
      lg: 'h-12 px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
