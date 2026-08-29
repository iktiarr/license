'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  Eye,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  Loader2,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Layers,
  FileCode,
  FolderPlus,
  ArrowRight,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
    name: '1. Pemeliharaan Sistem (Maintenance Dark)',
    desc: 'Tampilan mode maintenance modern bernuansa dark mode dengan status operasional.',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Situs Sedang Dalam Pemeliharaan</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #09090b; color: #f4f4f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 20px; padding: 40px 32px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .icon { width: 56px; height: 56px; background: #27272a; border: 1px solid #3f3f46; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 24px; }
    h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    p { font-size: 13px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }
    .badge { display: inline-block; background: #3f3f46; color: #e4e4e7; font-size: 11px; font-weight: 600; padding: 6px 14px; border-radius: 9999px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚙️</div>
    <h1>Pemeliharaan Sistem Berkala</h1>
    <p>Layanan kami saat ini sedang dalam proses peningkatan infrastruktur server demi kenyamanan Anda. Website akan segera kembali aktif.</p>
    <div class="badge">Status: Maintenance Mode</div>
  </div>
</body>
</html>`,
  },
  {
    name: '2. Tagihan & Administrasi (Payment Notice)',
    desc: 'Peringatan jatuh tempo atau pending invoice dengan tombol hubungi tim pengembang.',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Administrasi Diperlukan</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #fafaf9; color: #1c1917; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #ffffff; border: 1px solid #e7e5e4; border-radius: 20px; padding: 40px 32px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }
    .icon { width: 56px; height: 56px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 24px; }
    h1 { font-size: 20px; font-weight: 700; color: #78350f; margin-bottom: 12px; }
    p { font-size: 13px; color: #78716c; line-height: 1.6; margin-bottom: 28px; }
    .btn { display: inline-block; background: #0c0a09; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 12px; transition: 0.2s; }
    .btn:hover { background: #292524; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h1>Menunggu Verifikasi Administrasi</h1>
    <p>Akses ke portal website ini untuk sementara dibatasi. Silakan hubungi pengelola proyek atau tim pengembang untuk penyelesaian administrasi lisensi.</p>
    <a href="https://wa.me/6285143975550" target="_blank" class="btn">Hubungi Administrator</a>
  </div>
</body>
</html>`,
  },
  {
    name: '3. Layanan Ditangguhkan (Suspended Glassmorphism)',
    desc: 'Tampilan premium bertema indigo-slate dengan aksen glassmorphism.',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Akses Layanan Ditangguhkan</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: radial-gradient(circle at top right, #1e1b4b, #0f172a); color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 48px 36px; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .icon { width: 64px; height: 64px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; letter-spacing: -0.02em; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 28px; }
    .footer-note { font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🛡️</div>
    <h1>Akses Layanan Dinonaktifkan</h1>
    <p>Otorisasi lisensi untuk domain ini ditangguhkan oleh Administrator sistem. Semua fitur aplikasi untuk sementara waktu dinonaktifkan.</p>
    <div class="footer-note">Centralized License Guard • Proteksi Remote Real-time</div>
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

  // Form State for Creator/Editor
  const [editingId, setEditingId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [htmlContent, setHtmlContent] = useState(PRESET_TEMPLATES[0].html);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State for Previewing
  const [previewModalHtml, setPreviewModalHtml] = useState<string | null>(null);

  // Modal State for Assigning to Project
  const [assignModalTemplate, setAssignModalTemplate] = useState<LockTemplateItem | null>(null);
  const [assigningProjectId, setAssigningProjectId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setMessage({ text: 'Hanya berkas format .html atau .htm yang didukung.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setHtmlContent(content);
        if (!templateName) {
          setTemplateName(file.name.replace(/\.[^/.]+$/, ''));
        }
        setMessage({ text: `Berkas "${file.name}" berhasil dimuat ke editor!`, type: 'success' });
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setHtmlContent(preset.html);
    setTemplateName(preset.name.replace(/^\d+\.\s*/, ''));
    setMessage({ text: `Preset "${preset.name}" diterapkan ke editor.`, type: 'success' });
  };

  const startCreate = () => {
    setEditingId(null);
    setTemplateName('');
    setHtmlContent(PRESET_TEMPLATES[0].html);
    setActiveTab('editor');
    setMessage(null);
  };

  const startEdit = (tpl: LockTemplateItem) => {
    setEditingId(tpl.id);
    setTemplateName(tpl.name);
    setHtmlContent(tpl.htmlContent);
    setActiveTab('editor');
    setMessage(null);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setMessage({ text: 'Nama template wajib diisi.', type: 'error' });
      return;
    }
    if (!htmlContent.trim()) {
      setMessage({ text: 'Kode HTML tidak boleh kosong.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/templates/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: templateName, htmlContent }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setMessage({ text: data.error || 'Gagal memperbarui template.', type: 'error' });
        } else {
          setTemplates((prev) =>
            prev.map((t) => (t.id === editingId ? { ...t, name: templateName, htmlContent } : t))
          );
          setMessage({ text: `Template "${templateName}" berhasil diperbarui!`, type: 'success' });
          setActiveTab('list');
        }
      } else {
        // Create
        const res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: templateName, htmlContent }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setMessage({ text: data.error || 'Gagal menyimpan template baru.', type: 'error' });
        } else {
          setTemplates((prev) => [data.template, ...prev]);
          setMessage({ text: `Template "${templateName}" berhasil dibuat!`, type: 'success' });
          setActiveTab('list');
        }
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan saat menghubungi server.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus template "${name}"? Project yang menggunakan template ini akan kembali ke layar standar.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ text: data.error || 'Gagal menghapus template.', type: 'error' });
      } else {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        setProjects((prev) =>
          prev.map((p) => (p.templateId === id ? { ...p, templateId: null } : p))
        );
        setMessage({ text: `Template "${name}" telah dihapus.`, type: 'success' });
      }
    } catch {
      setMessage({ text: 'Gagal menghapus template.', type: 'error' });
    }
  };

  const handleAssignToProject = async (projectId: string, templateId: string | null) => {
    setAssigningProjectId(projectId);
    try {
      const res = await fetch('/api/templates/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, templateId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ text: data.error || 'Gagal memasang template.', type: 'error' });
      } else {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, templateId } : p))
        );
        setMessage({ text: data.message || 'Template berhasil dipasang ke project!', type: 'success' });
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan saat memasang template.', type: 'error' });
    } finally {
      setAssigningProjectId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Feedback Message ── */}
      {message && (
        <div
          className={`flex items-center gap-2.5 p-3 rounded-lg text-xs border animate-in fade-in duration-200 ${
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
          <span className="font-medium flex-1">{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Tab Switcher & Action ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('list');
              setMessage(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Template Tersimpan ({templates.length})</span>
          </button>

          <button
            type="button"
            onClick={startCreate}
            disabled={templates.length >= maxTemplates && !editingId}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'editor'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-50'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>{editingId ? 'Edit Template' : '+ Buat / Upload Template'}</span>
          </button>
        </div>

        {activeTab === 'list' && (
          <Button
            type="button"
            size="sm"
            onClick={startCreate}
            disabled={templates.length >= maxTemplates}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 font-semibold cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5 mr-1" />
            <span>Upload Berkas .html</span>
          </Button>
        )}
      </div>

      {/* ── TAB 1: Template List ── */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {templates.length === 0 ? (
            <Card className="p-10 border-slate-200 bg-white text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <FileCode className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Belum Ada Template Kustom</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Unggah berkas .html atau gunakan preset bawaan untuk menampilkan pesan kustom saat status website klien ditangguhkan.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={startCreate}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-8 cursor-pointer shadow-xs"
              >
                <span>Mulai Buat Template Baru</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map((tpl) => {
                const assignedProjects = projects.filter((p) => p.templateId === tpl.id);

                return (
                  <Card
                    key={tpl.id}
                    className="border-slate-200 bg-white shadow-xs flex flex-col justify-between overflow-hidden hover:border-slate-300 transition-all"
                  >
                    <CardHeader className="p-4 pb-2 border-b border-slate-100 bg-slate-50/50 flex flex-row items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-xs font-bold text-slate-900 truncate">
                          {tpl.name}
                        </CardTitle>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          {assignedProjects.length} Project Terhubung
                        </span>
                      </div>

                      <Badge variant="outline" className="text-[10px] bg-white border-slate-200 text-slate-700 shrink-0">
                        HTML5
                      </Badge>
                    </CardHeader>

                    {/* Miniature Preview Window */}
                    <div className="p-3 bg-slate-950 relative group flex items-center justify-center overflow-hidden h-40">
                      <iframe
                        srcDoc={tpl.htmlContent}
                        title={tpl.name}
                        className="w-[200%] h-[200%] transform scale-50 origin-top-left pointer-events-none select-none border-0"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/60 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setPreviewModalHtml(tpl.htmlContent)}
                          className="h-7 text-xs bg-white text-slate-900 font-semibold cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>Pratinjau Penuh</span>
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      {/* Connected Projects Badges */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase tracking-wider">
                          Dipasang Pada:
                        </span>
                        {assignedProjects.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">Belum dipasang ke project</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {assignedProjects.map((p) => (
                              <span
                                key={p.id}
                                className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded truncate max-w-40"
                              >
                                {p.domain}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setAssignModalTemplate(tpl)}
                          className="h-7 text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          <span>Pasang ke Project</span>
                        </Button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit Template"
                            onClick={() => startEdit(tpl)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Hapus Template"
                            onClick={() => handleDelete(tpl.id, tpl.name)}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ── TAB 2: HTML Creator & Responsive Live Preview ── */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & Presets (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="py-3.5 px-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-slate-700" />
                  <CardTitle className="text-xs font-bold text-slate-900">
                    {editingId ? 'Edit Template HTML' : 'Unggah & Atur Template'}
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
                {/* Template Name Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Nama Template *
                  </label>
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
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Gunakan Preset Bawaan:</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </label>
                  <div className="space-y-1.5">
                    {PRESET_TEMPLATES.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleApplyPreset(preset)}
                        className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer block"
                      >
                        <div className="text-xs font-bold text-slate-900">{preset.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* HTML Source Editor */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Kode HTML Sumber:
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {htmlContent.length} Karakter
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-800 bg-slate-950 text-xs font-mono text-emerald-400 select-all focus:outline-none focus:ring-2 focus:ring-slate-700 leading-relaxed resize-y"
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
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    )}
                    <span>{editingId ? 'Simpan Perubahan' : 'Simpan Template'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Interactive Live Iframe Preview (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-900">
                  Pratinjau Layar Langsung (Live Preview)
                </span>
              </div>

              {/* Viewport Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewSize('desktop')}
                  title="Desktop View"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    previewSize === 'desktop' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSize('tablet')}
                  title="Tablet View"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    previewSize === 'tablet' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSize('mobile')}
                  title="Mobile View"
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    previewSize === 'mobile' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sandboxed Live Frame */}
            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex justify-center min-h-120">
              <div
                className={`transition-all duration-300 bg-white rounded-lg shadow-lg overflow-hidden border border-slate-300 ${
                  previewSize === 'desktop'
                    ? 'w-full h-130'
                    : previewSize === 'tablet'
                    ? 'w-3xl max-w-full h-130'
                    : 'w-93.75 h-130'
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

      {/* ── Modal: Fullscreen Preview ── */}
      {previewModalHtml && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col p-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 text-white">
            <span className="text-xs font-bold font-mono">Pratinjau Layar Penuh (Fullscreen Lock Screen)</span>
            <button
              type="button"
              onClick={() => setPreviewModalHtml(null)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-700">
            <iframe
              srcDoc={previewModalHtml}
              title="Full Preview"
              sandbox="allow-scripts"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* ── Modal: Assign Template to Project ── */}
      {assignModalTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="py-3.5 px-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
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

            <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
              <p className="text-xs text-slate-600">
                Pilih project mana saja yang akan menampilkan template ini saat aksesnya ditangguhkan:
              </p>

              {projects.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                  Belum ada project yang terdaftar.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {projects.map((p) => {
                    const isAssigned = p.templateId === assignModalTemplate.id;
                    const isAssignedToOther = p.templateId && p.templateId !== assignModalTemplate.id;
                    const isBusy = assigningProjectId === p.id;

                    return (
                      <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono truncate">{p.domain}</div>
                        </div>

                        <div>
                          {isAssigned ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isBusy}
                              onClick={() => handleAssignToProject(p.id, null)}
                              className="h-7 text-xs border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 cursor-pointer"
                            >
                              {isBusy ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                              <span>Terpasang</span>
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isBusy}
                              onClick={() => handleAssignToProject(p.id, assignModalTemplate.id)}
                              className="h-7 text-xs font-semibold cursor-pointer"
                            >
                              {isBusy ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <span>{isAssignedToOther ? 'Ganti Template' : 'Pasang'}</span>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="py-3 px-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setAssignModalTemplate(null)}
                className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold"
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
