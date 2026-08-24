import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { ScrollText } from 'lucide-react';
import LogTable from '@/components/log-table';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Activity Logs — License Guard' };

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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-zinc-800/80 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-zinc-400" />
          <span>System Activity Logs</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Audit trail of all license heartbeats, authentications, and tamper events
        </p>
      </div>

      {/* Event Summary Badges */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).map(([event, count]) => (
          <Badge key={event} variant="secondary" className="px-3 py-1 text-xs gap-2">
            <span className="font-mono text-zinc-300">{event}</span>
            <span className="bg-zinc-800 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
              {count}
            </span>
          </Badge>
        ))}
      </div>

      {/* Logs Table Card */}
      <Card className="border-zinc-800 bg-zinc-900/60 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">Audit Stream</CardTitle>
            <CardDescription className="text-xs">
              Chronological log of events across all client instances
            </CardDescription>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800">
            {logs.length} Records Loaded
          </span>
        </CardHeader>
        <LogTable logs={logs} showProject />
      </Card>
    </div>
  );
}
