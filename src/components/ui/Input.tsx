import * as React from 'react';
import { cn } from '@/lib/utils/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 flex items-center justify-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            type={type}
            ref={ref}
            className={cn(
              'w-full h-11 bg-slate-900/50 border border-slate-800 rounded-md px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
