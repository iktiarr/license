import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-white text-zinc-950 font-semibold shadow-sm hover:bg-zinc-200 active:bg-zinc-300',
        destructive:
          'bg-rose-600 text-white font-semibold shadow-sm hover:bg-rose-500 active:bg-rose-700',
        success:
          'bg-emerald-600 text-white font-semibold shadow-sm hover:bg-emerald-500 active:bg-emerald-700',
        outline:
          'border border-zinc-700 bg-zinc-900/50 text-zinc-100 shadow-sm hover:bg-zinc-800 hover:text-white hover:border-zinc-600',
        secondary:
          'bg-zinc-800 text-zinc-100 font-medium hover:bg-zinc-700 active:bg-zinc-600',
        ghost:
          'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100',
        link: 'text-zinc-100 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-lg px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export function ButtonGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg border border-zinc-800 bg-zinc-900/50 p-0.5 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

export { Button, buttonVariants };
