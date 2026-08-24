import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border border-zinc-700 bg-zinc-800 text-zinc-100',
        secondary:
          'border border-zinc-800 bg-zinc-900 text-zinc-400',
        outline:
          'border border-zinc-700 text-zinc-300',
        success:
          'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        destructive:
          'border border-rose-500/30 bg-rose-500/10 text-rose-400',
        warning:
          'border border-amber-500/30 bg-amber-500/10 text-amber-400',
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
            variant === 'success' && 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse',
            variant === 'destructive' && 'bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]',
            variant === 'warning' && 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
            (!variant || variant === 'default' || variant === 'secondary' || variant === 'outline') && 'bg-zinc-400'
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
