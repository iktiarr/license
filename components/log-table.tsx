import {
  LogIn,
  Activity,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Radio,
  FileText,
} from 'lucide-react';

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
  { label: string; icon: typeof Activity; color: string }
> = {
  REGISTER: { label: 'Registration', icon: LogIn, color: 'text-indigo-500 bg-indigo-50' },
  HEARTBEAT: { label: 'Heartbeat', icon: Radio, color: 'text-emerald-500 bg-emerald-50' },
  SUSPENDED: { label: 'Suspended', icon: PauseCircle, color: 'text-red-500 bg-red-50' },
  ACTIVATED: { label: 'Activated', icon: PlayCircle, color: 'text-emerald-500 bg-emerald-50' },
  TAMPER_ATTEMPT: { label: 'Tamper Attempt', icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
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
        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">No activity logs yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Event</th>
            {showProject && <th>Project</th>}
            <th>IP Address</th>
            <th>Metadata</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const event = eventConfig[log.event] ?? {
              label: log.event,
              icon: Activity,
              color: 'text-slate-500 bg-slate-50',
            };
            const Icon = event.icon;

            return (
              <tr key={log.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${event.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-slate-700">{event.label}</span>
                  </div>
                </td>
                {showProject && (
                  <td>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {log.project?.name ?? '—'}
                      </p>
                      <p className="text-xs text-slate-400">{log.project?.domain ?? ''}</p>
                    </div>
                  </td>
                )}
                <td>
                  <span className="text-xs font-mono text-slate-500">
                    {log.ipAddress ?? '—'}
                  </span>
                </td>
                <td>
                  {log.metadata ? (
                    <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 max-w-xs truncate block">
                      {JSON.stringify(log.metadata)}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td>
                  <span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
