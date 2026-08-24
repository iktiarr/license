import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { ScrollText } from 'lucide-react';
import LogTable from '@/components/log-table';

export const metadata: Metadata = { title: 'Activity Logs' };

export default async function LogsPage() {
  const logs = await db.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      project: { select: { name: true, domain: true } },
    },
  });

  const counts = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.event] = (acc[log.event] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-slate-600" />
          Activity Logs
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Last 200 events across all projects</p>
      </div>

      {/* Event Summary Badges */}
      <div className="flex flex-wrap gap-2 animate-fade-in-up delay-100">
        {Object.entries(counts).map(([event, count]) => (
          <span
            key={event}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700"
          >
            <span className="font-mono text-slate-500">{event}</span>
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-xs">
              {count}
            </span>
          </span>
        ))}
      </div>

      {/* Logs Table */}
      <div className="card animate-fade-in-up delay-200">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-slate-700">All Events</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {logs.length} records
          </span>
        </div>
        <LogTable logs={logs} showProject />
      </div>
    </div>
  );
}
