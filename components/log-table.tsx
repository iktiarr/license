import {
  LogIn,
  Activity,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Radio,
  FileText,
} from 'lucide-react';
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

const eventConfig: Record<
  string,
  { label: string; icon: typeof Activity; variant: 'success' | 'destructive' | 'warning' | 'default' }
> = {
  REGISTER: { label: 'Register', icon: LogIn, variant: 'default' },
  HEARTBEAT: { label: 'Heartbeat', icon: Radio, variant: 'success' },
  SUSPENDED: { label: 'Suspended', icon: PauseCircle, variant: 'destructive' },
  ACTIVATED: { label: 'Activated', icon: PlayCircle, variant: 'success' },
  TAMPER_ATTEMPT: { label: 'Tamper Alert', icon: AlertTriangle, variant: 'warning' },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
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
      <div className="text-center py-12">
        <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
        <p className="text-zinc-500 text-xs">No activity logs recorded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-zinc-300">
        <thead className="bg-zinc-950/60 border-b border-zinc-800/80 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Event</th>
            {showProject && <th className="px-4 py-3">Project</th>}
            <th className="px-4 py-3">IP Address</th>
            <th className="px-4 py-3">Details</th>
            <th className="px-4 py-3 text-right">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {logs.map((log) => {
            const event = eventConfig[log.event] ?? {
              label: log.event,
              icon: Activity,
              variant: 'default',
            };
            const Icon = event.icon;

            return (
              <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <Badge variant={event.variant} dot>
                    <Icon className="w-3 h-3 mr-1" />
                    <span>{event.label}</span>
                  </Badge>
                </td>
                {showProject && (
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-zinc-200 truncate max-w-[160px]">
                      {log.project?.name ?? '—'}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[160px]">
                      {log.project?.domain ?? ''}
                    </p>
                  </td>
                )}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="font-mono text-xs text-zinc-400">
                    {log.ipAddress ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3.5 max-w-[200px] truncate">
                  {log.metadata ? (
                    <span className="font-mono text-[11px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80 truncate block">
                      {JSON.stringify(log.metadata)}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono text-[11px] text-zinc-400">
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
