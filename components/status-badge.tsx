import { clsx } from 'clsx';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

type Status = 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';

const config: Record<
  Status,
  { label: string; icon: typeof CheckCircle; className: string }
> = {
  ACTIVE: {
    label: 'Active',
    icon: CheckCircle,
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  SUSPENDED: {
    label: 'Suspended',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
  TAMPERED: {
    label: 'Tampered',
    icon: AlertTriangle,
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, icon: Icon, className } = config[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
