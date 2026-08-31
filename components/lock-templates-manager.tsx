'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Eye,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Layers,
  FileCode,
  FolderPlus,
  ArrowRight,
  X,
  Maximize2,
  FolderKanban,
  Globe,
  Code2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

export interface LockTemplateItem {
  id: string;
  name: string;
  htmlContent: string;
  isDefault: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  projects?: Array<{ id: string; name: string; domain: string }>;
}

interface LockTemplatesManagerProps {
  initialTemplates: LockTemplateItem[];
  projects: Array<{ id: string; name: string; domain: string; templateId: string | null }>;
  maxTemplates: number;
}

const PRESET_TEMPLATES = [
  {
    name: '1. Pemeliharaan Sistem (Dark Mode)',
    tag: 'Maintenance',
    desc: 'Tampilan modern bertema gelap dengan status sistem dalam pemeliharaan berkala.',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Situs Sedang Dalam Pemeliharaan</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 24px; padding: 48px 36px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
    .icon-box { width: 64px; height: 64px; background: #27272a; border: 1px solid #3f3f46; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; letter-spacing: -0.02em; }
    p { font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 28px; }
    .badge { display: inline-block; background: #27272a; color: #38bdf8; border: 1px solid #0284c7; font-size: 11px; font-weight: 600; padding: 6px 16px; border-radius: 9999px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">⚙️</div>
    <h1>Pemeliharaan Sistem</h1>
    <p>Layanan kami saat ini sedang dalam proses peningkatan sistem berkala demi performa terbaik. Akses akan segera kembali normal.</p>
    <div class="badge">Status: Maintenance Mode</div>
  </div>
</body>
</html>`,
  },
  {
    name: '2. Tagihan & Administrasi (Payment Notice)',
    tag: 'Billing',
    desc: 'Pemberitahuan jatuh tempo administrasi lisensi dengan tombol kontak pengembang.',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Administrasi Diperlukan</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #fafaf9; color: #1c1917; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #ffffff; border: 1px solid #e7e5e4; border-radius: 24px; padding: 48px 36px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
    .icon-box { width: 64px; height: 64px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; color: #78350f; margin-bottom: 12px; }
    p { font-size: 13px; color: #78716c; line-height: 1.6; margin-bottom: 28px; }
    .btn { display: inline-block; background: #0c0a09; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 12px; transition: 0.2s; }
    .btn:hover { background: #292524; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">⚠️</div>
    <h1>Menunggu Verifikasi Administrasi</h1>
    <p>Akses ke layanan website ini untuk sementara dibatasi. Silakan hubungi pengelola proyek atau tim pengembang untuk penyelesaian administrasi lisensi.</p>
    <a href="https://wa.me/6285143975550" target="_blank" class="btn">Hubungi Pengembang</a>
  </div>
</body>
</html>`,
  },
  {
    name: '3. Layanan Ditangguhkan (Suspended Neon)',
    tag: 'Suspended',
    desc: 'Tampilan premium bertema indigo-slate dengan aksen glassmorphism dan border glow.',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Akses Layanan Ditangguhkan</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: radial-gradient(circle at top right, #1e1b4b, #090d16); color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 48px 36px; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .icon-box { width: 64px; height: 64px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; letter-spacing: -0.02em; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
    .footer-note { font-size: 11px; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">🔒</div>
    <h1>Akses Layanan Ditangguhkan</h1>
    <p>Lisensi untuk domain ini saat ini tidak aktif atau telah ditangguhkan oleh administrator sistem. Hubungi penyedia layanan untuk memulihkan akses.</p>
    <div class="footer-note">Error Code: LICENSE_SUSPENDED_403</div>
  </div>
</body>
</html>`,
  },
];

export default function LockTemplatesManager({
  initialTemplates,
  projects: initialProjects,
  maxTemplates,
}: LockTemplatesManagerProps) {
  const [templates, setTemplates] = useState<LockTemplateItem[]>(initialTemplates);
  const [projects, setProjects] = useState(initialProjects);
  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [htmlContent, setHtmlContent] = useState(PRESET_TEMPLATES[0].html);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDragging, setIsDragging] = useState(false);

  // Fullscreen Preview Modal
  const [fullscreenModal, setFullscreenModal] = useState<{ name: string; html: string } | null>(null);
  const [modalViewport, setModalViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Assign Modal
  const [assignModalTemplate, setAssignModalTemplate] = useState<LockTemplateItem | null>(null);
  const [assignSearch, setAssignSearch] = useState('');
  const [assigningProjectId, setAssigningProjectId] = useState<string | null>(null);

  // Feedback Message
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreenModal(null);
        setAssignModalTemplate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Handle File Upload ──
  const processUploadedFile = (file: File) => {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setMessage({ text: 'Harap unggah file berekstensi .html atau .htm', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setHtmlContent(content);
      if (!templateName) {
        const cleanName = file.name.replace(/\.(html|htm)$/i, '').replace(/[-_]/g, ' ');
        setTemplateName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
      setMessage({ text: `File "${file.name}" berhasil dimuat ke editor!`, type: 'success' });
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  // ── Start Create & Edit ──
  const startCreate = () => {
    setEditingId(null);
    setTemplateName('');
    setHtmlContent(PRESET_TEMPLATES[0].html);
    setActiveTab('editor');
    setMessage(null);
  };

  const startEdit = (template: LockTemplateItem) => {
    setEditingId(template.id);
    setTemplateName(template.name);
    setHtmlContent(template.htmlContent);
    setActiveTab('editor');
    setMessage(null);
  };

  // ── Apply Preset ──
  const handleApplyPreset = (preset: (typeof PRESET_TEMPLATES)[0]) => {
    setTemplateName(preset.name.replace(/^\d+\.\s*/, ''));
    setHtmlContent(preset.html);
    setMessage({ text: `Preset "${preset.name}" berhasil diterapkan ke editor!`, type: 'success' });
  };

  // ── Save / Update Template ──
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setMessage({ text: 'Nama template wajib diisi!', type: 'error' });
      return;
    }
    if (!htmlContent.trim()) {
      setMessage({ text: 'Konten HTML template tidak boleh kosong!', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (editingId) {
        // PUT /api/templates/[id]
        const res = await fetch(`/api/templates/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: templateName, htmlContent }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memperbarui template.');

        setTemplates((prev) =>
          prev.map((t) => (t.id === editingId ? { ...t, name: templateName, htmlContent } : t))
        );
        setMessage({ text: `Template "${templateName}" berhasil diperbarui!`, type: 'success' });
        setActiveTab('list');
      } else {
        // POST /api/templates
        const res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: templateName, htmlContent }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyimpan template.');

        setTemplates((prev) => [data.template, ...prev]);
        setMessage({ text: `Template "${templateName}" berhasil ditambahkan!`, type: 'success' });
        setActiveTab('list');
      }
    } catch (err: unknown) {
      setMessage({ text: (err as Error).message || 'Terjadi kesalahan sistem.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete Template ──
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus template "${name}" secara permanen? Project yang terhubung akan kembali menggunakan tampilan standar.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus template.');
      }

      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setProjects((prev) =>
        prev.map((p) => (p.templateId === id ? { ...p, templateId: null } : p))
      );
      setMessage({ text: `Template "${name}" berhasil dihapus.`, type: 'success' });
    } catch (err: unknown) {
      setMessage({ text: (err as Error).message || 'Gagal menghapus template.', type: 'error' });
    }
  };

  // ── Toggle Project Assignment ──
  const handleToggleProject = async (projectId: string, currentTemplateId: string | null, targetTemplateId: string) => {
    const nextTemplateId = currentTemplateId === targetTemplateId ? null : targetTemplateId;
    setAssigningProjectId(projectId);

    try {
      const res = await fetch('/api/templates/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, templateId: nextTemplateId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah penugasan template.');

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, templateId: nextTemplateId } : p))
      );
    } catch (err: unknown) {
      alert((err as Error).message || 'Gagal mengubah penugasan project.');
    } finally {
      setAssigningProjectId(null);
    }
  };

  const filteredAssignProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(assignSearch.toLowerCase()) ||
      p.domain.toLowerCase().includes(assignSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── Feedback Message Banner ── */}
      {message && (
        <div
          className={`flex items-center gap-2.5 p-3.5 rounded-xl text-xs border shadow-2xs animate-in fade-in duration-200 ${
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

      {/* ── Navigation Tabs & Quick Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('list');
              setMessage(null);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Koleksi Template ({templates.length})</span>
          </button>

          <button
            type="button"
            onClick={startCreate}
            disabled={templates.length >= maxTemplates && !editingId}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'editor'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-50'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>{editingId ? 'Edit Template' : '+ Unggah / Desain Template'}</span>
          </button>
        </div>

        {activeTab === 'list' && (
          <Button
            type="button"
            size="sm"
            onClick={startCreate}
            disabled={templates.length >= maxTemplates}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8.5 font-semibold cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            <span>Upload Berkas .html</span>
          </Button>
        )}
      </div>

      {/* ── TAB 1: Template Cards Grid ── */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {templates.length === 0 ? (
            <Card className="p-12 border-slate-200 bg-white text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center mx-auto shadow-2xs">
                <FileCode className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Belum Ada Template Layar Kunci</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Unggah file HTML kustom atau gunakan preset bawaan kami untuk menampilkan halaman penangguhan lisensi yang memukau bagi klien Anda.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={startCreate}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 px-4 cursor-pointer shadow-xs"
              >
                <span>Mulai Buat Template Baru</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl) => {
                const assignedProjects = projects.filter((p) => p.templateId === tpl.id);

                return (
                  <Card
                    key={tpl.id}
                    className="border-slate-200 bg-white shadow-2xs flex flex-col justify-between overflow-hidden hover:border-slate-300 hover:shadow-xs transition-all group"
                  >
                    {/* Header */}
                    <CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/60 flex flex-row items-center justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-xs font-bold text-slate-900 truncate" title={tpl.name}>
                          {tpl.name}
                        </CardTitle>
                        <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                          {assignedProjects.length} Project Terpasang
                        </span>
                      </div>

                      <Badge variant="outline" className="text-[10px] bg-white border-slate-200 text-slate-700 shrink-0 font-mono">
                        HTML5
                      </Badge>
                    </CardHeader>

                    {/* Clean Pure HTML Page Thumbnail */}
                    <div className="relative h-48 bg-slate-100 border-b border-slate-200 overflow-hidden">
                      <iframe
                        srcDoc={tpl.htmlContent}
                        title={tpl.name}
                        sandbox="allow-scripts"
                        className="w-full h-full border-0 pointer-events-none select-none bg-white"
                      />

                      {/* Hover Overlay with Action Buttons */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setFullscreenModal({ name: tpl.name, html: tpl.htmlContent })}
                          className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold h-8 cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>Pratinjau Penuh</span>
                        </Button>
                      </div>
                    </div>

                    {/* Content & Project Badges */}
                    <CardContent className="p-4 space-y-3.5">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          Project yang Terhubung:
                        </span>
                        {assignedProjects.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Belum dipasang ke project manapun</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {assignedProjects.map((p) => (
                              <span
                                key={p.id}
                                className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md truncate max-w-44 flex items-center gap-1"
                              >
                                <Globe className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{p.domain}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setAssignModalTemplate(tpl)}
                          className="h-8 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                        >
                          <FolderKanban className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                          <span>Pasang ke Project</span>
                        </Button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit Template"
                            onClick={() => startEdit(tpl)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Hapus Template"
                            onClick={() => handleDelete(tpl.id, tpl.name)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: HTML Creator & High-Definition Live Preview ── */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & Presets (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-slate-200 bg-white shadow-2xs">
              <CardHeader className="py-3.5 px-4 border-b border-slate-100 bg-slate-50/60 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-slate-700" />
                  <CardTitle className="text-xs font-bold text-slate-900">
                    {editingId ? 'Edit Template HTML' : 'Unggah & Desain Template'}
                  </CardTitle>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 text-xs border-slate-300 font-semibold cursor-pointer"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  <span>Pilih File .html</span>
                </Button>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    isDragging
                      ? 'border-slate-900 bg-slate-100/80 scale-[1.01]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-5 h-5 text-slate-500" />
                  <p className="text-xs font-bold text-slate-800">
                    Drag &amp; Drop file <span className="font-mono text-emerald-700">.html</span> ke sini
                  </p>
                  <p className="text-[10px] text-slate-400">atau klik untuk menelusuri dari perangkat Anda</p>
                </div>

                {/* Template Name Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Nama Template *</label>
                  <Input
                    type="text"
                    required
                    placeholder="Contoh: Layar Maintenance Gelap"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="h-8.5 text-xs font-medium"
                  />
                </div>

                {/* Preset Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Preset Template Siap Pakai:</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {PRESET_TEMPLATES.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleApplyPreset(preset)}
                        className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 transition-all cursor-pointer block"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {preset.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{preset.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* HTML Source Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Kode Sumber HTML:</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {htmlContent.length} Karakter
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono text-emerald-400 select-all focus:outline-none focus:ring-2 focus:ring-slate-700 leading-relaxed resize-y shadow-inner"
                    placeholder="<!DOCTYPE html><html>...</html>"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveTab('list');
                      setMessage(null);
                    }}
                    className="h-8 text-xs font-semibold"
                  >
                    Batal
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    disabled={isSubmitting || !templateName || !htmlContent}
                    onClick={handleSaveTemplate}
                    className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Spinner className="mr-1.5" />
                    ) : (
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    )}
                    <span>{editingId ? 'Simpan Perubahan' : 'Simpan Template'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: High-Definition Live Device Preview (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-900">
                  Pratinjau Langsung (Live Preview)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Viewport Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewSize('desktop')}
                    title="Desktop View (100%)"
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      previewSize === 'desktop'
                        ? 'bg-white shadow-2xs text-slate-900 font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewSize('tablet')}
                    title="Tablet View (768px)"
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      previewSize === 'tablet'
                        ? 'bg-white shadow-2xs text-slate-900 font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewSize('mobile')}
                    title="Mobile View (375px)"
                    className={`p-1.5 rounded-md transition-all cursor-pointer ${
                      previewSize === 'mobile'
                        ? 'bg-white shadow-2xs text-slate-900 font-bold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Fullscreen Trigger */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFullscreenModal({ name: templateName || 'Live Preview', html: htmlContent })}
                  className="h-8 text-xs font-semibold cursor-pointer shadow-2xs"
                  title="Lihat Pratinjau Layar Penuh"
                >
                  <Maximize2 className="w-3.5 h-3.5 mr-1" />
                  <span>Penuh</span>
                </Button>
              </div>
            </div>

            {/* Clean HTML Preview Container */}
            <div className="bg-slate-100/80 rounded-2xl p-3 sm:p-5 border border-slate-200 flex justify-center min-h-130 overflow-hidden">
              <div
                className={`transition-all duration-300 bg-white rounded-xl shadow-md overflow-hidden border border-slate-300 h-130 ${
                  previewSize === 'desktop'
                    ? 'w-full'
                    : previewSize === 'tablet'
                    ? 'w-3xl max-w-full'
                    : 'w-93.75 max-w-full'
                }`}
              >
                <iframe
                  srcDoc={htmlContent}
                  title="Live Preview"
                  sandbox="allow-scripts"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Fullscreen Preview with Viewport Switcher ── */}
      {fullscreenModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xs flex flex-col p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono">Pratinjau Layar Kunci:</span>
              <span className="text-xs font-bold text-emerald-400">{fullscreenModal.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Modal Viewport Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalViewport('desktop')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    modalViewport === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setModalViewport('tablet')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    modalViewport === 'tablet' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setModalViewport('mobile')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    modalViewport === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setFullscreenModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer border border-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <div
              className={`transition-all duration-300 bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700 h-full ${
                modalViewport === 'desktop'
                  ? 'w-full'
                  : modalViewport === 'tablet'
                  ? 'w-3xl max-w-full'
                  : 'w-93.75 max-w-full'
              }`}
            >
              <iframe
                srcDoc={fullscreenModal.html}
                title="Full Preview"
                sandbox="allow-scripts"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Assign Template to Project ── */}
      {assignModalTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="py-4 px-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pasang Template ke Project</h3>
                <p className="text-xs text-slate-500">
                  Template: <span className="font-semibold text-slate-800">{assignModalTemplate.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalTemplate(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <Input
                type="text"
                placeholder="Cari nama project atau domain..."
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                className="h-8.5 text-xs bg-slate-50"
              />

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredAssignProjects.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    Tidak ada project yang cocok.
                  </p>
                ) : (
                  filteredAssignProjects.map((p) => {
                    const isAssigned = p.templateId === assignModalTemplate.id;
                    const isLoadingThis = assigningProjectId === p.id;

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProject(p.id, p.templateId, assignModalTemplate.id)}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isAssigned
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold truncate">{p.name}</div>
                          <div className="text-[11px] font-mono text-slate-500 truncate">{p.domain}</div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {isLoadingThis ? (
                            <Spinner />
                          ) : isAssigned ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Terpasang</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                              Pilih
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="py-3 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setAssignModalTemplate(null)}
                className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
