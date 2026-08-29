import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border border-slate-200 bg-slate-900 text-white',
        secondary:
          'border border-slate-200 bg-slate-100 text-slate-700',
        outline:
          'border border-slate-300 text-slate-700 bg-white',
        success:
          'border border-emerald-200 bg-emerald-50 text-emerald-700 font-medium',
        destructive:
          'border border-rose-200 bg-rose-50 text-rose-700 font-medium',
        warning:
          'border border-amber-200 bg-amber-50 text-amber-700 font-medium',
        info:
          'border border-sky-200 bg-sky-50 text-sky-700 font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-emerald-500',
            variant === 'destructive' && 'bg-rose-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'info' && 'bg-sky-500',
            (!variant || variant === 'default' || variant === 'secondary' || variant === 'outline') && 'bg-slate-400'
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };

