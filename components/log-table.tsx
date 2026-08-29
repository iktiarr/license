import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type LogWithProject = {
  id: string;
  projectId: string;
  event: string;
  ipAddress: string | null;
  metadata: unknown;
  createdAt: Date;
  project?: { name: string; domain: string };
};

const eventBadgeMap: Record<string, { label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' }> = {
  REGISTER: { label: 'Terdaftar', variant: 'success' },
  ACTIVE: { label: 'Diaktifkan', variant: 'success' },
  ACTIVATED: { label: 'Diaktifkan', variant: 'success' },
  SUSPENDED: { label: 'Ditangguhkan', variant: 'destructive' },
  DELETED: { label: 'Dihapus', variant: 'secondary' },
  TAMPERED: { label: 'Upaya Hack', variant: 'warning' },
  TAMPER_ATTEMPT: { label: 'Upaya Hack', variant: 'warning' },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date));
}

export default function LogTable({
  logs,
  showProject = false,
}: {
  logs: LogWithProject[];
  showProject?: boolean;
}) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-500">Belum ada riwayat aktivitas yang tercatat</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3.5">Event</th>
            {showProject && <th className="px-5 py-3.5">Project</th>}
            <th className="px-5 py-3.5">IP Address</th>
            <th className="px-5 py-3.5">Detail Metadata</th>
            <th className="px-5 py-3.5 text-right">Waktu</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {logs.map((log) => {
            const badge = eventBadgeMap[log.event] || { label: log.event, variant: 'secondary' as const };

            return (
              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Event */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <Badge variant={badge.variant} className="text-xs px-2.5 py-0.5">
                    {badge.label}
                  </Badge>
                </td>

                {/* Project */}
                {showProject && (
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-slate-900 truncate max-w-40 text-xs">
                      {log.project?.name ?? '—'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-40">
                      {log.project?.domain ?? ''}
                    </p>
                  </td>
                )}

                {/* IP */}
                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600 font-mono">
                  {log.ipAddress ?? '—'}
                </td>

                {/* Metadata */}
                <td className="px-5 py-3.5 max-w-50 truncate">
                  {log.metadata ? (
                    <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate block font-mono">
                      {JSON.stringify(log.metadata)}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>

                {/* Timestamp */}
                <td className="px-5 py-3.5 text-right whitespace-nowrap text-xs text-slate-500 font-medium">
                  {formatDate(log.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
