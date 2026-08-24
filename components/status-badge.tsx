import { Badge } from '@/components/ui/badge';

type ProjectStatus = 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';

const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: 'success' | 'destructive' | 'warning' }
> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  SUSPENDED: { label: 'Suspended', variant: 'destructive' },
  TAMPERED: { label: 'Tampered', variant: 'warning' },
};

export default function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus | string;
  className?: string;
}) {
  const config = statusConfig[status as ProjectStatus] ?? {
    label: status,
    variant: 'warning',
  };

  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}
