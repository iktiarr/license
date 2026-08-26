import { Activity, FileText } from 'lucide-react';

export type LogWithProject = {
  id: string;
  projectId: string;
  event: string;
  ipAddress: string | null;
  metadata: unknown;
  createdAt: Date;
  project?: { name: string; domain: string };
};

const eventCfg: Record<string, { symbol: string; color: string; bg: string }> = {
  REGISTER:       { symbol: '+', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ACTIVE:         { symbol: '▶', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ACTIVATED:      { symbol: '▶', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  SUSPENDED:      { symbol: '■', color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' },
  DELETED:        { symbol: '×', color: 'text-zinc-500',    bg: 'bg-zinc-800/40 border-zinc-700/30' },
  TAMPERED:       { symbol: '!', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  TAMPER_ATTEMPT: { symbol: '!', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date(date)).replace(',', '');
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
      <div className="text-center py-12 font-mono">
        <FileText className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
        <p className="text-[11px] text-zinc-600">// no activity logs yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left font-mono">
        <thead className="border-b border-zinc-800/60 text-[9px] text-zinc-600 uppercase tracking-widest">
          <tr>
            <th className="px-4 py-3">Event</th>
            {showProject && <th className="px-4 py-3">Project</th>}
            <th className="px-4 py-3">IP</th>
            <th className="px-4 py-3">Details</th>
            <th className="px-4 py-3 text-right">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40">
          {logs.map((log) => {
            const cfg = eventCfg[log.event] ?? { symbol: '·', color: 'text-zinc-500', bg: 'bg-zinc-900 border-zinc-800' };

            return (
              <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                {/* Event */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                    <span>{cfg.symbol}</span>
                    <span>{log.event}</span>
                  </div>
                </td>

                {/* Project */}
                {showProject && (
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-zinc-300 truncate max-w-40">
                      {log.project?.name ?? '—'}
                    </p>
                    <p className="text-[9px] text-zinc-600 font-mono truncate max-w-40">
                      {log.project?.domain ?? ''}
                    </p>
                  </td>
                )}

                {/* IP */}
                <td className="px-4 py-3 whitespace-nowrap text-[10px] text-zinc-600">
                  {log.ipAddress ?? '—'}
                </td>

                {/* Metadata */}
                <td className="px-4 py-3 max-w-48 truncate">
                  {log.metadata ? (
                    <span className="text-[10px] text-zinc-600 bg-black px-1.5 py-0.5 rounded border border-zinc-800 truncate block">
                      {JSON.stringify(log.metadata)}
                    </span>
                  ) : (
                    <span className="text-zinc-700 text-[10px]">—</span>
                  )}
                </td>

                {/* Timestamp */}
                <td className="px-4 py-3 text-right whitespace-nowrap text-[10px] text-zinc-600">
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
