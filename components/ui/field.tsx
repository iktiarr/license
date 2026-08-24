import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

export function Field({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

export function FieldLabel({
  className,
  children,
  htmlFor,
  required,
}: {
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <Label htmlFor={htmlFor} className={cn('flex items-center gap-1 text-zinc-300', className)}>
      {children}
      {required && <span className="text-rose-500">*</span>}
    </Label>
  );
}

export function FieldDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <p className={cn('text-xs text-zinc-500 leading-relaxed', className)}>{children}</p>;
}

export function FieldError({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  if (!children) return null;
  return <p className={cn('text-xs font-medium text-rose-400', className)}>{children}</p>;
}
