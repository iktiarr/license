'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  Trash2,
  Search,
  Check,
  AlertCircle,
  FileJson,
  FileSpreadsheet,
  FileCode2,
  X,
  MoreHorizontal,
  Copy,
  ShieldAlert,
  ShieldCheck,
  Code,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';

export type LogItem = {
  id: string;
  projectId: string;
  event: string;
  ipAddress: string | null;
  metadata: unknown;
  createdAt: string | Date;
  project?: {
    name: string;
    domain: string;
    status?: string;
    frameworkType?: string;
    user?: {
      username: string;
      email: string;
    } | null;
  } | null;
};

const eventBadgeConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  REGISTER: {
    label: 'Terdaftar',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    desc: 'Project pertama kali didaftarkan ke sistem',
  },
  ACTIVE: {
    label: 'Aktif',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    desc: 'Lisensi domain diaktifkan dan berjalan normal',
  },
  ACTIVATED: {
    label: 'Diaktifkan',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    desc: 'Lisensi domain kembali diaktifkan oleh admin',
  },
  SUSPENDED: {
    label: 'Ditangguhkan',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    desc: 'Akses domain dikunci dari jarak jauh (Killswitch aktif)',
  },
  DELETED: {
    label: 'Dihapus',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    desc: 'Project atau token lisensi telah dihapus',
  },
  TAMPERED: {
    label: 'Upaya Hack',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    desc: 'Terdeteksi upaya manipulasi kode atau ketidaksesuaian domain',
  },
  TAMPER_ATTEMPT: {
    label: 'Upaya Hack',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
    desc: 'Domain tidak sesuai atau file lisensi dirusak',
  },
  PAIRING: {
    label: 'Pairing CLI',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    desc: 'Proses penghubungan CLI package dengan dashboard',
  },
  BYPASS_KEY: {
    label: 'Bypass Darurat',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    desc: 'Mode bypass darurat diaktifkan menggunakan master key',
  },
};

function formatFullDateTime(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}

function formatRelativeTime(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'Baru saja';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)} hari lalu`;
  return formatFullDateTime(date);
}

function parseMetadataSummary(metadata: unknown): string {
  if (!metadata) return '—';
  if (typeof metadata === 'string') return metadata;
  if (typeof metadata === 'object') {
    const obj = metadata as Record<string, unknown>;
    if (obj.reason) {
      if (obj.reason === 'domain_mismatch') {
        return `Domain tidak cocok (Dikirim: ${obj.provided || '?'}, Terdaftar: ${obj.expected || '?'})`;
      }
      return String(obj.reason);
    }
    if (obj.details) return String(obj.details);
    if (obj.message) return String(obj.message);
    if (obj.action) return `Aksi: ${String(obj.action)}`;
    return JSON.stringify(metadata);
  }
  return String(metadata);
}

interface LogManagerProps {
  initialLogs: LogItem[];
  showProject?: boolean;
}

export default function LogManager({ initialLogs, showProject = true }: LogManagerProps) {
  const [logs, setLogs] = useState<LogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('ALL');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [detailLog, setDetailLog] = useState<LogItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ── Filtered Logs ──
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const search = searchQuery.toLowerCase().trim();
      const matchSearch =
        !search ||
        (log.project?.name && log.project.name.toLowerCase().includes(search)) ||
        (log.project?.domain && log.project.domain.toLowerCase().includes(search)) ||
        (log.project?.user?.username && log.project.user.username.toLowerCase().includes(search)) ||
        (log.project?.user?.email && log.project.user.email.toLowerCase().includes(search)) ||
        (log.ipAddress && log.ipAddress.includes(search)) ||
        log.event.toLowerCase().includes(search) ||
        parseMetadataSummary(log.metadata).toLowerCase().includes(search);

      const matchEvent = selectedEvent === 'ALL' || log.event === selectedEvent;
      return matchSearch && matchEvent;
    });
  }, [logs, searchQuery, selectedEvent]);

  // ── Helper: Download File in Browser ──
  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── 1. Ekspor ke JSON (Lengkap & Terstruktur) ──
  const handleExportJSON = () => {
    if (filteredLogs.length === 0) return;

    const exportPayload = {
      exportMetadata: {
        application: 'Central License Guard',
        exportDate: new Date().toISOString(),
        exportDateLocale: new Date().toLocaleString('id-ID'),
        totalRecords: filteredLogs.length,
      },
      summary: {
        registered: filteredLogs.filter((l) => l.event === 'REGISTER').length,
        activated: filteredLogs.filter((l) => l.event === 'ACTIVE' || l.event === 'ACTIVATED').length,
        suspended: filteredLogs.filter((l) => l.event === 'SUSPENDED').length,
        tamperAttempts: filteredLogs.filter((l) => l.event === 'TAMPER_ATTEMPT' || l.event === 'TAMPERED').length,
      },
      logs: filteredLogs.map((l, idx) => {
        const cfg = eventBadgeConfig[l.event] || { label: l.event, desc: 'Aktivitas sistem' };
        return {
          index: idx + 1,
          logId: l.id,
          timestamp: l.createdAt,
          timestampFormatted: formatFullDateTime(l.createdAt),
          event: l.event,
          eventLabel: cfg.label,
          eventDescription: cfg.desc,
          project: {
            id: l.projectId,
            name: l.project?.name || '—',
            domain: l.project?.domain || '—',
            status: l.project?.status || 'UNKNOWN',
            framework: l.project?.frameworkType || 'NATIVE',
            ownerUsername: l.project?.user?.username || '—',
            ownerEmail: l.project?.user?.email || '—',
          },
          client: {
            ipAddress: l.ipAddress || '—',
          },
          summary: parseMetadataSummary(l.metadata),
          rawMetadata: l.metadata || null,
        };
      }),
    };

    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const filename = `license-guard-logs-${new Date().toISOString().split('T')[0]}.json`;
    triggerDownload(blob, filename);
    setMessage({ text: `Berhasil mengekspor ${filteredLogs.length} data log lengkap ke JSON.`, type: 'success' });
  };

  // ── 2. Ekspor ke TXT (Laporan Rapi & Terformat) ──
  const handleExportTXT = () => {
    if (filteredLogs.length === 0) return;
    const lines: string[] = [];
    lines.push('================================================================================');
    lines.push('                   CENTRAL LICENSE GUARD — AUDIT & EVENT LOGS                   ');
    lines.push(`                   Diekspor: ${new Date().toLocaleString('id-ID')}                   `);
    lines.push(`                   Total Log: ${filteredLogs.length} Catatan Aktivitas                   `);
    lines.push('================================================================================\n');

    filteredLogs.forEach((l, idx) => {
      const cfg = eventBadgeConfig[l.event] || { label: l.event, desc: '' };
      lines.push(`[#${idx + 1}] ID LOG     : ${l.id}`);
      lines.push(`     WAKTU      : ${formatFullDateTime(l.createdAt)} (${formatRelativeTime(l.createdAt)})`);
      lines.push(`     EVENT      : ${l.event} [${cfg.label}]`);
      lines.push(`     PROJECT    : ${l.project?.name || '—'} (Domain: ${l.project?.domain || '—'})`);
      lines.push(`     STATUS     : ${l.project?.status || 'ACTIVE'} | Framework: ${l.project?.frameworkType || 'NATIVE'}`);
      lines.push(`     PEMILIK    : ${l.project?.user?.username || '—'} (${l.project?.user?.email || '—'})`);
      lines.push(`     IP ADDRESS : ${l.ipAddress || '—'}`);
      lines.push(`     KETERANGAN : ${parseMetadataSummary(l.metadata)}`);
      if (l.metadata) {
        lines.push(`     METADATA   : ${JSON.stringify(l.metadata)}`);
      }
      lines.push('--------------------------------------------------------------------------------');
    });

    const txtContent = lines.join('\n');
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const filename = `license-guard-logs-${new Date().toISOString().split('T')[0]}.txt`;
    triggerDownload(blob, filename);
    setMessage({ text: `Berhasil mengekspor ${filteredLogs.length} data log ke file TXT.`, type: 'success' });
  };

  // ── 3. Ekspor ke Excel (.csv UTF-8 dengan BOM & 13 Kolom Lengkap) ──
  const handleExportExcel = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      'No',
      'ID Log',
      'Waktu (WIB)',
      'Waktu Relatif',
      'Event Log',
      'Kategori Event',
      'Nama Project',
      'Domain Website',
      'Status Lisensi',
      'Framework',
      'Pemilik Akun',
      'Email Pemilik',
      'IP Address',
      'Keterangan / Alasan',
      'Metadata Raw (JSON)',
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredLogs.map((l, idx) => {
      const cfg = eventBadgeConfig[l.event] || { label: l.event };
      return [
        idx + 1,
        l.id,
        formatFullDateTime(l.createdAt),
        formatRelativeTime(l.createdAt),
        l.event,
        cfg.label,
        l.project?.name || '—',
        l.project?.domain || '—',
        l.project?.status || 'ACTIVE',
        l.project?.frameworkType || 'NATIVE',
        l.project?.user?.username || '—',
        l.project?.user?.email || '—',
        l.ipAddress || '—',
        parseMetadataSummary(l.metadata),
        l.metadata ? JSON.stringify(l.metadata) : '—',
      ];
    });

    const csvContent =
      '\uFEFF' + // UTF-8 BOM so Excel opens with all characters properly
      [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `license-guard-logs-${new Date().toISOString().split('T')[0]}.csv`;
    triggerDownload(blob, filename);
    setMessage({ text: `Berhasil mengekspor ${filteredLogs.length} data log lengkap ke file Excel (.csv).`, type: 'success' });
  };

  // ── 4. Hapus Permanen Semua Log ──
  const handlePermanentDelete = async () => {
    setIsDeleting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/logs', { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ text: data.error || 'Gagal menghapus log permanen.', type: 'error' });
      } else {
        setLogs([]);
        setMessage({ text: data.message || 'Semua log aktivitas berhasil dihapus permanen.', type: 'success' });
        setIsConfirmOpen(false);
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan saat menghapus log.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* ── Feedback Message ── */}
      {message && (
        <div
          className={`flex items-center gap-2.5 p-3 rounded-xl text-xs border animate-in fade-in duration-150 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-semibold flex-1">{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Toolbar: Search, Filter, Export & Delete ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        {/* Search & Event Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Cari nama project, domain, pemilik, event, atau IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8.5 text-xs bg-slate-50 border-slate-200"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'REGISTER', 'ACTIVATED', 'SUSPENDED', 'TAMPER_ATTEMPT', 'PAIRING', 'BYPASS_KEY'].map((ev) => {
              const cfg = eventBadgeConfig[ev];
              return (
                <button
                  key={ev}
                  type="button"
                  onClick={() => setSelectedEvent(ev)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedEvent === ev
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {ev === 'ALL' ? 'Semua Event' : cfg ? cfg.label : ev}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Ekspor & Hapus Permanen */}
        <div className="flex items-center gap-2 self-end lg:self-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 w-full lg:w-auto justify-end">
          {/* Ekspor JSON */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            disabled={filteredLogs.length === 0}
            className="h-8 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
            title="Ekspor log lengkap dengan metadata ke file .json"
          >
            <FileJson className="w-3.5 h-3.5 mr-1 text-sky-600" />
            <span>JSON</span>
          </Button>

          {/* Ekspor TXT */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportTXT}
            disabled={filteredLogs.length === 0}
            className="h-8 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
            title="Ekspor laporan log terformat ke file .txt"
          >
            <FileCode2 className="w-3.5 h-3.5 mr-1 text-slate-600" />
            <span>TXT</span>
          </Button>

          {/* Ekspor Excel */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={filteredLogs.length === 0}
            className="h-8 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
            title="Ekspor tabel log lengkap ke spreadsheet Excel (.csv)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>Excel</span>
          </Button>

          {/* Hapus Permanen */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            disabled={logs.length === 0}
            className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-2xs"
            title="Hapus semua riwayat log aktivitas secara permanen"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1 text-white" />
            <span>Hapus Permanen</span>
          </Button>
        </div>
      </div>

      {/* ── Table Container dengan Tampilan Simpel & Bersih ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Event</th>
                {showProject && <th className="px-4 py-3">Project &amp; Domain</th>}
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={showProject ? 6 : 5} className="text-center py-12 px-4">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Belum ada riwayat aktivitas yang cocok</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const cfg = eventBadgeConfig[log.event] || {
                    label: log.event,
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                    desc: 'Aktivitas sistem',
                  };
                  const summaryText = parseMetadataSummary(log.metadata);
                  const isTamper = log.event === 'TAMPER_ATTEMPT' || log.event === 'TAMPERED';
                  const isSuspended = log.event === 'SUSPENDED';

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isTamper ? 'bg-amber-50/30' : isSuspended ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* 1. Event */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          title={cfg.desc}
                        >
                          {isTamper && <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />}
                          {log.event === 'ACTIVE' || log.event === 'ACTIVATED' ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          ) : null}
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      {/* 2. Project & Domain */}
                      {showProject && (
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="font-bold text-slate-900 truncate max-w-48 text-xs leading-tight">
                            {log.project?.name ?? '—'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono truncate max-w-48 leading-tight mt-0.5">
                            {log.project?.domain ?? '—'}
                          </p>
                        </td>
                      )}

                      {/* 3. IP Address */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {log.ipAddress ? (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80">
                            {log.ipAddress}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* 4. Keterangan */}
                      <td className="px-4 py-3.5 max-w-72">
                        <p
                          className={`text-[11px] truncate leading-relaxed ${
                            isTamper ? 'text-amber-900 font-medium' : 'text-slate-600'
                          }`}
                          title={summaryText}
                        >
                          {summaryText}
                        </p>
                      </td>

                      {/* 5. Waktu */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono text-slate-800 text-[11px] leading-tight">
                          {formatFullDateTime(log.createdAt)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatRelativeTime(log.createdAt)}
                        </div>
                      </td>

                      {/* 6. Aksi (Titik Tiga Ringkas) */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDetailLog(log)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                          title="Lihat Rincian Lengkap & Metadata"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── POP-UP MODAL DETAIL LOG LENGKAP ── */}
      {detailLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="py-4 px-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <Info className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Rincian Log Aktivitas</h3>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {detailLog.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailLog(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Event Badge & Summary Alert */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Jenis Event
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-xs font-bold ${
                      eventBadgeConfig[detailLog.event]?.bg || 'bg-slate-100'
                    } ${eventBadgeConfig[detailLog.event]?.text || 'text-slate-800'}`}
                  >
                    {eventBadgeConfig[detailLog.event]?.label || detailLog.event}
                  </Badge>
                </div>
                <p className="text-xs text-slate-700 font-medium">
                  {parseMetadataSummary(detailLog.metadata)}
                </p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Waktu Presisi</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {formatFullDateTime(detailLog.createdAt)}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Alamat IP</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {detailLog.ipAddress || '—'}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nama Project</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {detailLog.project?.name || '—'}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Domain Terdaftar</span>
                  <span className="font-mono text-slate-800 mt-0.5 block truncate">
                    {detailLog.project?.domain || '—'}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Framework / Tipe</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {detailLog.project?.frameworkType || 'NATIVE'}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-white">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pemilik Lisensi</span>
                  <span className="font-bold text-slate-900 mt-0.5 block truncate">
                    {detailLog.project?.user?.username || 'Root Admin'}
                  </span>
                </div>
              </div>

              {/* Raw JSON Viewer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-slate-500" />
                    <span>Raw Metadata JSON Payload</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(detailLog.metadata || {}, null, 2),
                        detailLog.id
                      )
                    }
                    className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === detailLog.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
                  {detailLog.metadata
                    ? JSON.stringify(detailLog.metadata, null, 2)
                    : '{\n  "info": "Tidak ada metadata tambahan."\n}'}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="py-3 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
              <Button
                type="button"
                size="sm"
                onClick={() => setDetailLog(null)}
                className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── POP-UP MODAL KONFIRMASI HAPUS PERMANEN ── */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Hapus Log Permanen?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus seluruh riwayat log aktivitas ini? Catatan yang sudah dihapus tidak dapat dipulihkan kembali.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isDeleting}
                className="h-8 text-xs font-semibold cursor-pointer"
              >
                Batal
              </Button>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handlePermanentDelete}
                disabled={isDeleting}
                className="h-8 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {isDeleting ? <Spinner className="mr-1.5" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                <span>Ya, Hapus Permanen</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
