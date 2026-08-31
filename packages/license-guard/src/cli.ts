#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import pc from 'picocolors';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { encodeLicensePayload, decodeLicensePayload, validateEmergencyBypassToken } from './index';

const DEFAULT_ENDPOINT = 'https://license-tau-nine.vercel.app';
const VERSION_STRING = '3.0.0';
const CURRENT_VERSION = '^3.0.0';

type Framework =
  | 'nextjs'
  | 'vite-react'
  | 'vite-vue'
  | 'vite-svelte'
  | 'nuxt'
  | 'astro'
  | 'flutter'
  | 'express'
  | 'php'
  | 'html'
  | 'unknown';

function detectFramework(cwd: string): { framework: Framework; label: string } {
  if (fs.existsSync(path.join(cwd, 'pubspec.yaml'))) {
    return { framework: 'flutter', label: 'Flutter / Dart App' };
  }

  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['next']) return { framework: 'nextjs', label: 'Next.js (App/Pages Router)' };
      if (deps['nuxt']) return { framework: 'nuxt', label: 'Nuxt.js (Vue 3 SSR)' };
      if (deps['astro']) return { framework: 'astro', label: 'Astro Web Framework' };
      if (deps['@sveltejs/kit'] || deps['svelte']) return { framework: 'vite-svelte', label: 'Svelte / SvelteKit' };
      if (deps['vue'] || deps['@vitejs/plugin-vue']) return { framework: 'vite-vue', label: 'Vite + Vue.js' };
      if (deps['react'] && (deps['vite'] || deps['@vitejs/plugin-react'])) return { framework: 'vite-react', label: 'Vite + React.js' };
      if (deps['react']) return { framework: 'vite-react', label: 'React.js Web App' };
      if (deps['express'] || deps['fastify'] || deps['koa']) return { framework: 'express', label: 'Node.js / Express Backend' };
    } catch { /* ignore */ }
  }

  if (fs.existsSync(path.join(cwd, 'composer.json')) || fs.existsSync(path.join(cwd, 'index.php'))) {
    return { framework: 'php', label: 'PHP Native / Laravel' };
  }

  if (fs.existsSync(path.join(cwd, 'index.html'))) {
    return { framework: 'html', label: 'HTML / Vanilla JavaScript' };
  }

  return { framework: 'unknown', label: 'Universal JavaScript' };
}

function detectPackageManager(cwd: string): 'pnpm' | 'yarn' | 'bun' | 'npm' {
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(cwd, 'bun.lockb')) || fs.existsSync(path.join(cwd, 'bun.lock'))) return 'bun';
  return 'npm';
}

function ensurePackageDependency(cwd: string): boolean {
  const pkgPath = path.join(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (!pkg.dependencies) pkg.dependencies = {};
    pkg.dependencies['@masdannn/license-guard'] = CURRENT_VERSION;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

function generateApiKey(): string {
  return 'LG-' + crypto.randomBytes(24).toString('hex');
}

function createPromptHelper() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, (answer) => {
        resolve(answer.trim());
      });
    });
  };

  const close = () => {
    try {
      rl.close();
      if (process.stdin && typeof process.stdin.pause === 'function') {
        process.stdin.pause();
      }
      if (process.stdin && typeof process.stdin.unref === 'function') {
        process.stdin.unref();
      }
    } catch { /* ignore */ }
  };

  return { ask, close };
}

function printHeader() {
  console.log(pc.bold(pc.cyan('\n╔══════════════════════════════════════════════════════════╗')));
  console.log(pc.bold(pc.cyan('║')) + '  ' + pc.bold(pc.white('🛡️  CENTRALIZED LICENSE GUARD CLI')) + ' ' + pc.yellow(`(v${VERSION_STRING})`) + '            ' + pc.bold(pc.cyan('║')));
  console.log(pc.bold(pc.cyan('║')) + '  ' + pc.dim('Proteksi Lisensi, Anti-Tamper & Remote Killswitch') + '      ' + pc.bold(pc.cyan('║')));
  console.log(pc.bold(pc.cyan('╚══════════════════════════════════════════════════════════╝\n')));
}

function setupFrameworkFiles(
  cwd: string,
  framework: Framework,
  encryptedKey: string,
  projectName: string,
  projectDomain: string,
  endpoint: string
): string[] {
  const lines: string[] = [];

  // Backup configuration in .licenseguard.json
  const configJson = {
    version: VERSION_STRING,
    project: projectName,
    domain: projectDomain,
    endpoint: endpoint,
    key: encryptedKey,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(cwd, '.licenseguard.json'), JSON.stringify(configJson, null, 2), 'utf-8');
  lines.push(`  ${pc.green('✓')} Konfigurasi Backup: ${pc.bold('.licenseguard.json')}`);

  // 1. Next.js
  if (framework === 'nextjs') {
    ensurePackageDependency(cwd);
    lines.push(`  ${pc.green('✓')} Dependency: ${pc.bold('@masdannn/license-guard ' + CURRENT_VERSION)}`);

    const libDir = path.join(cwd, 'lib');
    if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });

    const libContent = `'use client';

// ⚡ Auto-generated by @masdannn/license-guard (v2) — JANGAN DIHAPUS
import { initGuard } from '@masdannn/license-guard';
import { useEffect } from 'react';

const LICENSE_KEY = '${encryptedKey}';

if (typeof window !== 'undefined') {
  initGuard({ key: LICENSE_KEY });
}

export function LicenseGuard() {
  useEffect(() => {
    initGuard({ key: LICENSE_KEY });
  }, []);
  return null;
}
`;
    fs.writeFileSync(path.join(libDir, 'license-guard.ts'), libContent, 'utf-8');
    lines.push(`  ${pc.green('✓')} Dibuat: ${pc.bold('lib/license-guard.ts')}`);

    const candidates = [
      { file: path.join(cwd, 'app', 'layout.tsx'), isAppRouter: true },
      { file: path.join(cwd, 'app', 'layout.jsx'), isAppRouter: true },
      { file: path.join(cwd, 'pages', '_app.tsx'), isAppRouter: false },
      { file: path.join(cwd, 'pages', '_app.jsx'), isAppRouter: false },
    ];
    let injected = false;
    for (const { file, isAppRouter } of candidates) {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf-8');
        if (isAppRouter) {
          if (!content.includes('LicenseGuard')) {
            content = "import { LicenseGuard } from '@/lib/license-guard';\n" + content;
            if (content.includes('<body')) {
              content = content.replace(/(<body[^>]*>)/i, '$1\n        <LicenseGuard />');
            }
            fs.writeFileSync(file, content, 'utf-8');
            lines.push(`  ${pc.green('✓')} Komponen diinjeksi ke: ${pc.bold(path.relative(cwd, file).replace(/\\/g, '/'))}`);
          }
        } else {
          if (!content.includes('license-guard')) {
            fs.writeFileSync(file, "import '@/lib/license-guard';\n" + content, 'utf-8');
            lines.push(`  ${pc.green('✓')} Import diinjeksi ke: ${pc.bold(path.relative(cwd, file).replace(/\\/g, '/'))}`);
          }
        }
        injected = true;
        break;
      }
    }
    if (!injected) {
      lines.push(`  ${pc.yellow('!')} Tambahkan <LicenseGuard /> di root layout: ${pc.cyan("import { LicenseGuard } from '@/lib/license-guard';")}`);
    }

  // 2. Vite React / Vue / Svelte
  } else if (framework === 'vite-react' || framework === 'vite-vue' || framework === 'vite-svelte') {
    ensurePackageDependency(cwd);
    lines.push(`  ${pc.green('✓')} Dependency: ${pc.bold('@masdannn/license-guard ' + CURRENT_VERSION)}`);

    const libDir = path.join(cwd, 'src', 'lib');
    if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });

    const libContent = `// ⚡ Auto-generated by @masdannn/license-guard (v2) — JANGAN DIHAPUS
import { initGuard } from '@masdannn/license-guard';

const LICENSE_KEY = '${encryptedKey}';

if (typeof window !== 'undefined') {
  initGuard({ key: LICENSE_KEY });
}

export { initGuard };
`;
    fs.writeFileSync(path.join(libDir, 'license-guard.ts'), libContent, 'utf-8');
    lines.push(`  ${pc.green('✓')} Dibuat: ${pc.bold('src/lib/license-guard.ts')}`);

    const candidates = [
      path.join(cwd, 'src', 'main.tsx'),
      path.join(cwd, 'src', 'main.jsx'),
      path.join(cwd, 'src', 'main.ts'),
      path.join(cwd, 'src', 'main.js'),
      path.join(cwd, 'src', 'index.tsx'),
      path.join(cwd, 'src', 'App.tsx'),
      path.join(cwd, 'src', 'App.vue'),
    ];
    let injected = false;
    for (const file of candidates) {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf-8');
        if (!content.includes('license-guard')) {
          content = "import './lib/license-guard';\n" + content;
          fs.writeFileSync(file, content, 'utf-8');
          lines.push(`  ${pc.green('✓')} Import diinjeksi ke: ${pc.bold(path.relative(cwd, file).replace(/\\/g, '/'))}`);
        }
        injected = true;
        break;
      }
    }
    if (!injected) {
      lines.push(`  ${pc.yellow('!')} Tambahkan di main entry file: ${pc.cyan("import './lib/license-guard';")}`);
    }

  // 3. Nuxt.js
  } else if (framework === 'nuxt') {
    ensurePackageDependency(cwd);
    const pluginsDir = path.join(cwd, 'plugins');
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });

    const pluginContent = `import { initGuard } from '@masdannn/license-guard';

export default defineNuxtPlugin(() => {
  if (process.client) {
    initGuard({ key: '${encryptedKey}' });
  }
});
`;
    fs.writeFileSync(path.join(pluginsDir, 'license-guard.client.ts'), pluginContent, 'utf-8');
    lines.push(`  ${pc.green('✓')} Dibuat Nuxt Plugin: ${pc.bold('plugins/license-guard.client.ts')}`);

  // 4. Flutter / Dart App
  } else if (framework === 'flutter') {
    const libDir = path.join(cwd, 'lib');
    if (!fs.existsSync(libDir)) fs.mkdirSync(libDir, { recursive: true });

    const dartContent = `// ⚡ Auto-generated by @masdannn/license-guard (v2) for Flutter — JANGAN DIHAPUS
import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class LicenseGuard {
  static const String licenseKey = '${encryptedKey}';
  static const String endpoint = '${endpoint}';
  static Timer? _timer;

  static void init(BuildContext context) {
    _performCheck(context);
    _timer = Timer.periodic(const Duration(minutes: 5), (_) => _performCheck(context));
  }

  static Future<void> _performCheck(BuildContext context) async {
    try {
      final response = await http.post(
        Uri.parse('$endpoint/api/license/heartbeat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'apiKey': '${decodeLicensePayload(encryptedKey).apiKey}',
          'domain': '${projectDomain}',
        }),
      );

      if (response.statusCode == 403 || response.statusCode == 401) {
        _showLockScreen(context);
      }
    } catch (_) {}
  }

  static void _showLockScreen(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => WillPopScope(
        onWillPop: () async => false,
        child: AlertDialog(
          title: const Text('🛡️ Lisensi Ditangguhkan', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
          content: const Text('Akses aplikasi ini dinonaktifkan oleh administrator sistem.'),
        ),
      ),
    );
  }
}
`;
    fs.writeFileSync(path.join(libDir, 'license_guard.dart'), dartContent, 'utf-8');
    lines.push(`  ${pc.green('✓')} Dibuat Dart Guard: ${pc.bold('lib/license_guard.dart')}`);
    lines.push(`  ${pc.cyan('ℹ')} Panggil di main.dart: ${pc.bold('LicenseGuard.init(context);')}`);

  // 5. HTML / PHP / Vanilla JS
  } else {
    const jsContent = `/**
 * ⚡ Auto-generated by @masdannn/license-guard (v2) — JANGAN DIHAPUS
 */
(function() {
  var key = "${encryptedKey}";
  var endpoint = "${endpoint}";
  var domain = "${projectDomain}";

  function check() {
    fetch(endpoint + "/api/license/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: "${decodeLicensePayload(encryptedKey).apiKey}",
        domain: window.location.hostname || domain
      })
    }).then(function(r) {
      if (r.status === 403 || r.status === 401) lock();
    }).catch(function(){});
  }

  function lock() {
    if (document.getElementById("__license_guard_lock_overlay__")) return;
    var div = document.createElement("div");
    div.id = "__license_guard_lock_overlay__";
    div.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;background:#fff;display:flex;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;padding:20px;";
    div.innerHTML = "<div><h1 style='color:#ef4444;'>🛡️ Akses Ditangguhkan</h1><p style='color:#555;'>Akses ke website ini dinonaktifkan oleh administrator.</p></div>";
    document.body.appendChild(div);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", check);
  } else {
    check();
  }
  setInterval(check, 300000);
})();
`;
    fs.writeFileSync(path.join(cwd, 'license-guard.js'), jsContent, 'utf-8');
    lines.push(`  ${pc.green('✓')} Dibuat: ${pc.bold('license-guard.js')}`);

    const indexHtml = path.join(cwd, 'index.html');
    if (fs.existsSync(indexHtml)) {
      let content = fs.readFileSync(indexHtml, 'utf-8');
      if (!content.includes('license-guard.js')) {
        content = content.replace('</head>', '  <script src="license-guard.js"></script>\n</head>');
        fs.writeFileSync(indexHtml, content, 'utf-8');
        lines.push(`  ${pc.green('✓')} Tag script diinjeksi ke: ${pc.bold('index.html')}`);
      }
    }
  }

  return lines;
}

// ── 1. SECRET COMMAND: version ──
async function commandVersion(cwd: string) {
  printHeader();
  console.log(pc.bold(pc.white('📦 INFORMASI VERSI LICENSE GUARD\n')));

  console.log(`  Versi CLI           : ${pc.bold(pc.green('v' + VERSION_STRING))}`);

  const configPath = path.join(cwd, '.licenseguard.json');
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log(`  Versi Konfigurasi   : ${pc.bold(pc.cyan('v' + (cfg.version || VERSION_STRING)))}`);
      console.log(`  Project Terdaftar   : ${pc.bold(cfg.project || '—')}`);
      console.log(`  Domain Terproteksi  : ${pc.bold(cfg.domain || '—')}`);
    } catch { /* ignore */ }
  }
  console.log('');
}

// ── 2. SECRET COMMAND: update ──
async function commandUpdate(cwd: string) {
  printHeader();
  console.log(pc.bold(pc.yellow('🔄 MEMPERBARUI PACKAGE LICENSE GUARD KE VERSI TERBARU...\n')));

  const pm = detectPackageManager(cwd);
  console.log(pc.dim(`Menggunakan Package Manager: `) + pc.bold(pc.cyan(pm)));

  const installCmd =
    pm === 'pnpm'
      ? 'pnpm add @masdannn/license-guard@latest'
      : pm === 'yarn'
      ? 'yarn add @masdannn/license-guard@latest'
      : pm === 'bun'
      ? 'bun add @masdannn/license-guard@latest'
      : 'npm install @masdannn/license-guard@latest';

  try {
    console.log(pc.dim(`Menjalankan: ${installCmd}...`));
    execSync(installCmd, { cwd, stdio: 'inherit' });

    // Update .licenseguard.json version if exists
    const configPath = path.join(cwd, '.licenseguard.json');
    if (fs.existsSync(configPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        cfg.version = VERSION_STRING;
        cfg.updatedAt = new Date().toISOString();
        fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf-8');
        console.log(`  ${pc.green('✓')} Konfigurasi .licenseguard.json diperbarui.`);
      } catch { /* ignore */ }
    }

    console.log(pc.bold(pc.green('\n🎉 Pembaruan Berhasil!')));
    console.log(pc.dim('@masdannn/license-guard kini telah diperbarui ke versi paling stabil.\n'));
  } catch (err: unknown) {
    console.log(pc.red(`\n❌ Gagal memperbarui package: ${err instanceof Error ? err.message : String(err)}\n`));
  }
}

// ── 3. SECRET COMMAND: finish / clean / detach ──
function commandFinish(cwd: string) {
  printHeader();
  console.log(pc.bold(pc.yellow('🧹 PROSES FINALISASI & PEMBERSIHAN (FINISH / DETACH)')));
  console.log(pc.dim('Menghapus seluruh file konfigurasi lisensi dan dependensi dari proyek ini...\n'));

  const filesToDelete = [
    path.join(cwd, '.licenseguard.json'),
    path.join(cwd, 'lib', 'license-guard.ts'),
    path.join(cwd, 'src', 'lib', 'license-guard.ts'),
    path.join(cwd, 'plugins', 'license-guard.client.ts'),
    path.join(cwd, 'lib', 'license_guard.dart'),
    path.join(cwd, 'license-guard.js'),
  ];

  for (const f of filesToDelete) {
    if (fs.existsSync(f)) {
      try {
        fs.unlinkSync(f);
        console.log(`  ${pc.green('✓')} Berkas Dihapus: ${pc.bold(path.relative(cwd, f).replace(/\\/g, '/'))}`);
      } catch { /* ignore */ }
    }
  }

  // Clean injected layout / entry files
  const entryFiles = [
    path.join(cwd, 'app', 'layout.tsx'),
    path.join(cwd, 'app', 'layout.jsx'),
    path.join(cwd, 'pages', '_app.tsx'),
    path.join(cwd, 'pages', '_app.jsx'),
    path.join(cwd, 'src', 'main.tsx'),
    path.join(cwd, 'src', 'main.jsx'),
    path.join(cwd, 'src', 'main.ts'),
    path.join(cwd, 'src', 'main.js'),
    path.join(cwd, 'src', 'App.tsx'),
    path.join(cwd, 'src', 'App.vue'),
    path.join(cwd, 'index.html'),
  ];

  for (const ef of entryFiles) {
    if (fs.existsSync(ef)) {
      try {
        let content = fs.readFileSync(ef, 'utf-8');
        let modified = false;

        if (content.includes("import { LicenseGuard } from '@/lib/license-guard';\n")) {
          content = content.replace("import { LicenseGuard } from '@/lib/license-guard';\n", '');
          modified = true;
        }
        if (content.includes('\n        <LicenseGuard />')) {
          content = content.replace('\n        <LicenseGuard />', '');
          modified = true;
        }
        if (content.includes("import '@/lib/license-guard';\n")) {
          content = content.replace("import '@/lib/license-guard';\n", '');
          modified = true;
        }
        if (content.includes("import './lib/license-guard';\n")) {
          content = content.replace("import './lib/license-guard';\n", '');
          modified = true;
        }
        if (content.includes('  <script src="license-guard.js"></script>\n')) {
          content = content.replace('  <script src="license-guard.js"></script>\n', '');
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(ef, content, 'utf-8');
          console.log(`  ${pc.green('✓')} Injeksi Dibersihkan dari: ${pc.bold(path.relative(cwd, ef).replace(/\\/g, '/'))}`);
        }
      } catch { /* ignore */ }
    }
  }

  // Remove from package.json dependencies
  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      let modified = false;
      if (pkg.dependencies && pkg.dependencies['@masdannn/license-guard']) {
        delete pkg.dependencies['@masdannn/license-guard'];
        modified = true;
      }
      if (pkg.devDependencies && pkg.devDependencies['@masdannn/license-guard']) {
        delete pkg.devDependencies['@masdannn/license-guard'];
        modified = true;
      }
      if (modified) {
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');
        console.log(`  ${pc.green('✓')} Dependensi Dicabut dari: ${pc.bold('package.json')}`);
      }
    } catch { /* ignore */ }
  }

  console.log(pc.bold(pc.green('\n🎉 Finalisasi Selesai!')));
  console.log(pc.dim('Proyek Anda kini telah bersih secara total dan tidak lagi terikat proteksi License Guard.\n'));
}

// ── 4. SECRET COMMAND: doctor / check / diag ──
async function commandDoctor(cwd: string) {
  printHeader();
  console.log(pc.bold(pc.white('🩺 LICENSE GUARD HEALTH CHECK & DIAGNOSTIC\n')));

  let passed = 0;
  let total = 0;

  // Check 1: Node.js & Runtime Environment
  total++;
  const nodeVersion = process.version;
  console.log(`  [1/5] Lingkungan Runtime Node.js:`);
  console.log(`        • Node Version : ${pc.bold(nodeVersion)}`);
  console.log(`        • Platform     : ${pc.bold(process.platform)} (${process.arch})`);
  console.log(`        • Working Dir  : ${pc.dim(cwd)}`);
  console.log(`        ${pc.green('✓')} Runtime environment siap.\n`);
  passed++;

  // Check 2: Framework Detection
  total++;
  const { framework, label: frameworkLabel } = detectFramework(cwd);
  console.log(`  [2/5] Deteksi Framework & Bahasa:`);
  console.log(`        • Tipe Framework: ${pc.bold(pc.cyan(frameworkLabel))}`);
  if (framework !== 'unknown') {
    console.log(`        ${pc.green('✓')} Framework didukung penuh.\n`);
    passed++;
  } else {
    console.log(`        ${pc.yellow('!')} Framework universal/generic.\n`);
    passed++;
  }

  // Check 3: Local Configuration File (.licenseguard.json)
  total++;
  console.log(`  [3/5] Integritas Berkas Konfigurasi (.licenseguard.json):`);
  const configPath = path.join(cwd, '.licenseguard.json');
  let config: { key?: string; domain?: string; project?: string; endpoint?: string } | null = null;
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config && config.key && config.domain) {
        console.log(`        • Status File : ${pc.green('Ditemukan & Valid')}`);
        console.log(`        • Project     : ${pc.bold(config.project || '—')}`);
        console.log(`        • Domain      : ${pc.bold(config.domain || '—')}`);
        console.log(`        • Endpoint    : ${pc.dim(config.endpoint || DEFAULT_ENDPOINT)}`);
        console.log(`        ${pc.green('✓')} Konfigurasi lokal lengkap.\n`);
        passed++;
      } else {
        console.log(`        ${pc.red('✗')} Berkas .licenseguard.json rusak atau tidak lengkap.\n`);
      }
    } catch {
      console.log(`        ${pc.red('✗')} Format JSON pada .licenseguard.json tidak valid.\n`);
    }
  } else {
    console.log(`        ${pc.yellow('!')} .licenseguard.json tidak ditemukan. Jalankan "npx @masdannn/license-guard init" terlebih dahulu.\n`);
  }

  // Check 4: Guard File Verification (lib/license-guard.ts / index.html)
  total++;
  console.log(`  [4/5] Pemasangan Berkas Guard di Source Code:`);
  const possibleFiles = [
    path.join(cwd, 'lib', 'license-guard.ts'),
    path.join(cwd, 'src', 'lib', 'license-guard.ts'),
    path.join(cwd, 'plugins', 'license-guard.client.ts'),
    path.join(cwd, 'lib', 'license_guard.dart'),
    path.join(cwd, 'license-guard.js'),
  ];
  const foundFile = possibleFiles.find((f) => fs.existsSync(f));
  if (foundFile) {
    console.log(`        • Berkas Guard : ${pc.bold(pc.green(path.relative(cwd, foundFile).replace(/\\/g, '/')))}`);
    console.log(`        ${pc.green('✓')} File helper proteksi terpasang di proyek.\n`);
    passed++;
  } else {
    console.log(`        ${pc.yellow('!')} File helper proteksi belum dibuat.\n`);
  }

  // Check 5: Heartbeat Ping & Latency Test to Remote Server
  total++;
  console.log(`  [5/5] Uji Konektivitas Server & Latency Ping:`);
  const endpoint = (config?.endpoint || DEFAULT_ENDPOINT).replace(/\/$/, '');
  const apiKey = config?.key ? decodeLicensePayload(config.key).apiKey : 'TEST_DIAGNOSTIC';
  const domain = config?.domain || 'localhost';

  const startTime = Date.now();
  try {
    const res = await fetch(`${endpoint}/api/license/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, domain }),
      signal: AbortSignal.timeout(6000),
    });
    const latency = Date.now() - startTime;
    const data = (await res.json()) as { valid?: boolean; status?: string; error?: string };

    console.log(`        • Endpoint Server : ${pc.dim(endpoint)}`);
    console.log(`        • Latency Respon  : ${pc.bold(latency < 300 ? pc.green(`⚡ ${latency}ms`) : pc.yellow(`⏳ ${latency}ms`))}`);
    console.log(`        • Status Lisensi  : ${res.status === 200 && data.status === 'ACTIVE' ? pc.bold(pc.green('ACTIVE (Normal ✓)')) : pc.bold(pc.yellow(data.status || 'RESPONSE ' + res.status))}`);
    console.log(`        ${pc.green('✓')} Komunikasi jaringan dengan server normal.\n`);
    passed++;
  } catch (err: unknown) {
    console.log(`        ${pc.red('✗')} Gagal menghubungi endpoint server (${err instanceof Error ? err.message : String(err)}).\n`);
  }

  // Summary Diagnostic Box
  console.log(pc.bold(pc.cyan('╔══════════════════════════════════════════════════════════╗')));
  if (passed === total) {
    console.log(pc.bold(pc.cyan('║')) + '  ' + pc.bold(pc.green(`✅ HASIL DIAGNOSTIK: 100% SEHAT (${passed}/${total} Pengecekan Lolos)`)) + '  ' + pc.bold(pc.cyan('║')));
    console.log(pc.bold(pc.cyan('║')) + '  ' + pc.dim('Semua konfigurasi, file helper, dan koneksi server aman.') + '  ' + pc.bold(pc.cyan('║')));
  } else {
    console.log(pc.bold(pc.cyan('║')) + '  ' + pc.bold(pc.yellow(`⚠️ HASIL DIAGNOSTIK: ${passed}/${total} Pengecekan Lolos`)) + '            ' + pc.bold(pc.cyan('║')));
    console.log(pc.bold(pc.cyan('║')) + '  ' + pc.dim('Beberapa konfigurasi perlu diperiksa sesuai laporan.') + '      ' + pc.bold(pc.cyan('║')));
  }
  console.log(pc.bold(pc.cyan('╚══════════════════════════════════════════════════════════╝\n')));
}

// ── 5. SECRET COMMAND: bypass / unlock / recover (Emergency Offline Fail-Safe) ──
async function commandBypass(cwd: string, tokenArg?: string, flag?: string) {
  printHeader();
  console.log(pc.bold(pc.yellow('🚨 EMERGENCY BYPASS & OFFLINE UNLOCK TOOL\n')));

  const configPath = path.join(cwd, '.licenseguard.json');
  let config: {
    key?: string;
    domain?: string;
    project?: string;
    endpoint?: string;
    bypass?: { active: boolean; token: string; activatedAt: string };
  } = {};

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch { /* ignore */ }
  }

  // Handle disable flag
  if (tokenArg === '--disable' || tokenArg === '--off' || flag === '--disable' || flag === '--off') {
    if (config.bypass) {
      delete config.bypass;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    }

    // Clean bypass marker in lib/license-guard.ts if present
    const libFiles = [
      path.join(cwd, 'lib', 'license-guard.ts'),
      path.join(cwd, 'src', 'lib', 'license-guard.ts'),
    ];
    for (const lf of libFiles) {
      if (fs.existsSync(lf)) {
        try {
          let content = fs.readFileSync(lf, 'utf-8');
          if (content.includes("localStorage.setItem('_lg_emergency_bypass', 'true');")) {
            content = content.replace("if (typeof window !== 'undefined') { try { localStorage.setItem('_lg_emergency_bypass', 'true'); } catch {} }\n", '');
            content = content.replace("if (typeof window !== 'undefined') { try { localStorage.removeItem('_lg_emergency_bypass'); } catch {} }\n", '');
            content = "if (typeof window !== 'undefined') { try { localStorage.removeItem('_lg_emergency_bypass'); } catch {} }\n" + content;
            fs.writeFileSync(lf, content, 'utf-8');
          }
        } catch { /* ignore */ }
      }
    }

    console.log(`  ${pc.green('✓')} Mode Emergency Bypass telah ${pc.bold('DINONAKTIFKAN')}.`);
    console.log(pc.dim('  Sistem kini kembali memverifikasi lisensi secara normal ke server pusat.\n'));
    return;
  }

  if (!config.key) {
    console.log(pc.red('❌ File .licenseguard.json tidak ditemukan.'));
    console.log(pc.dim('Jalankan "npx @masdannn/license-guard init" terlebih dahulu.\n'));
    return;
  }

  const decoded = decodeLicensePayload(config.key);
  const apiKey = decoded.apiKey;
  const domain = config.domain || decoded.domain || 'localhost';

  let inputToken = tokenArg?.trim();
  if (!inputToken) {
    const prompt = createPromptHelper();
    console.log(pc.dim(`Project Terdaftar : `) + pc.bold(config.project || '—'));
    console.log(pc.dim(`Domain            : `) + pc.bold(domain));
    console.log(pc.dim(`Dapatkan token ini di dashboard project detail Anda.\n`));

    inputToken = await prompt.ask(pc.bold('Masukkan Emergency Bypass Token (format: EBP-xxxxxxxx): '));
    prompt.close();
  }

  if (!inputToken) {
    console.log(pc.red('\n❌ Token darurat tidak boleh kosong.\n'));
    return;
  }

  const isValid = validateEmergencyBypassToken(inputToken, apiKey, domain);

  if (!isValid) {
    console.log(pc.bold(pc.red('\n❌ Token Darurat Tidak Valid!')));
    console.log(pc.dim(`Token yang dimasukkan tidak cocok dengan kredensial project "${config.project || domain}".`));
    console.log(pc.dim('Periksa kembali Emergency Bypass Key di Dashboard Project Anda.\n'));
    return;
  }

  // Activate bypass in .licenseguard.json
  config.bypass = {
    active: true,
    token: inputToken,
    activatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

  // Inject emergency unlock into lib/license-guard.ts
  const libFiles = [
    path.join(cwd, 'lib', 'license-guard.ts'),
    path.join(cwd, 'src', 'lib', 'license-guard.ts'),
  ];
  for (const lf of libFiles) {
    if (fs.existsSync(lf)) {
      try {
        let content = fs.readFileSync(lf, 'utf-8');
        if (!content.includes("localStorage.setItem('_lg_emergency_bypass', 'true');")) {
          content = "if (typeof window !== 'undefined') { try { localStorage.setItem('_lg_emergency_bypass', 'true'); } catch {} }\n" + content;
          fs.writeFileSync(lf, content, 'utf-8');
        }
      } catch { /* ignore */ }
    }
  }

  console.log(pc.bold(pc.green('\n╔══════════════════════════════════════════════════════════╗')));
  console.log(pc.bold(pc.green('║')) + '  ' + pc.bold(pc.white('🎉 EMERGENCY BYPASS BERHASIL DIAKTIFKAN!')) + '            ' + pc.bold(pc.green('║')));
  console.log(pc.bold(pc.green('╠══════════════════════════════════════════════════════════╣')));
  console.log(pc.bold(pc.green('║')) + `  Project Name : ${pc.bold((config.project || '—').padEnd(41).slice(0, 41))}` + pc.bold(pc.green('║')));
  console.log(pc.bold(pc.green('║')) + `  Domain       : ${pc.bold(domain.padEnd(41).slice(0, 41))}` + pc.bold(pc.green('║')));
  console.log(pc.bold(pc.green('║')) + `  Bypass Token : ${pc.yellow(inputToken.padEnd(41).slice(0, 41))}` + pc.bold(pc.green('║')));
  console.log(pc.bold(pc.green('║')) + `  Status Akses : ${pc.green(pc.bold('UNLOCKED (Offline Fail-Safe)'.padEnd(41)))}` + pc.bold(pc.green('║')));
  console.log(pc.bold(pc.green('╚══════════════════════════════════════════════════════════╝\n')));
  console.log(pc.dim('Untuk mengembalikan ke mode proteksi online normal sewaktu-waktu:'));
  console.log(pc.cyan('👉 npx @masdannn/license-guard bypass --disable\n'));
}

// ── Check Remote License Status ──
async function checkStatus(cwd: string) {
  printHeader();
  console.log(pc.bold('🔍 MEMERIKSA STATUS LISENSI REMOTE...\n'));

  let config: { key?: string; endpoint?: string; domain?: string; project?: string } = {};

  const configPath = path.join(cwd, '.licenseguard.json');
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch { /* ignore */ }
  }

  if (!config.key) {
    console.log(pc.red('❌ File .licenseguard.json tidak ditemukan atau belum diinisialisasi.'));
    console.log(pc.dim('Jalankan "npx @masdannn/license-guard init" terlebih dahulu.\n'));
    return;
  }

  const decoded = decodeLicensePayload(config.key);
  const endpoint = config.endpoint || decoded.endpoint || DEFAULT_ENDPOINT;
  const apiKey = decoded.apiKey;
  const domain = config.domain || decoded.domain || 'localhost';

  try {
    const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/license/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, domain }),
    });

    const data = (await res.json()) as { valid?: boolean; status?: string; error?: string };

    console.log(pc.bold(pc.white('Detail Project:')));
    console.log(`  Project Name : ${pc.bold(pc.cyan(config.project || '—'))}`);
    console.log(`  Domain       : ${pc.bold(domain)}`);
    console.log(`  Endpoint     : ${pc.dim(endpoint)}`);
    console.log(`  API Key      : ${pc.dim(apiKey ? apiKey.slice(0, 8) + '...' : '—')}\n`);

    if (res.status === 200 && data.valid && data.status === 'ACTIVE') {
      console.log(pc.bold(pc.green('  STATUS: ACTIVE (LISENSI AKTIF & VALID ✓)')));
      console.log(pc.dim('  Website klien berjalan normal tanpa pembatasan.\n'));
    } else if (data.status === 'SUSPENDED' || res.status === 403) {
      console.log(pc.bold(pc.red('  STATUS: SUSPENDED (DITANGGUHKAN ⏸️)')));
      console.log(pc.dim('  Akses website ditangguhkan oleh Administrator di Dashboard.\n'));
    } else if (data.status === 'TAMPERED') {
      console.log(pc.bold(pc.red('  STATUS: TAMPERED (MODIFIKASI TIDAK SAH ⚠️)')));
      console.log(pc.dim('  Domain tidak cocok atau file lisensi dimodifikasi.\n'));
    } else {
      console.log(pc.bold(pc.yellow(`  STATUS: ${data.status || 'UNKNOWN'}`)));
      if (data.error) console.log(`  Pesan: ${data.error}\n`);
    }
  } catch (err: unknown) {
    console.log(pc.red(`❌ Gagal menghubungi server: ${err instanceof Error ? err.message : String(err)}\n`));
  }
}

// ── Main CLI Runner ──
async function main() {
  const args = process.argv.slice(2);
  const cwd = process.cwd();
  const firstArg = args[0]?.toLowerCase();

  // 1. Secret Command: version
  if (firstArg === 'version' || args.includes('--version') || args.includes('-v')) {
    await commandVersion(cwd);
    return;
  }

  // 2. Secret Command: update
  if (firstArg === 'update') {
    await commandUpdate(cwd);
    return;
  }

  // 3. Secret Command: finish (aliases: clean, detach, uninstall)
  if (firstArg === 'finish' || firstArg === 'clean' || firstArg === 'detach' || firstArg === 'uninstall') {
    commandFinish(cwd);
    return;
  }

  // 4. Secret Command: doctor / check / diag (Health Check & Diagnostic)
  if (firstArg === 'doctor' || firstArg === 'diag' || firstArg === 'check') {
    await commandDoctor(cwd);
    return;
  }

  // 5. Secret Command: bypass / unlock / recover (Emergency Offline Unlock)
  if (firstArg === 'bypass' || firstArg === 'unlock' || firstArg === 'recover') {
    await commandBypass(cwd, args[1], args[2]);
    return;
  }

  // 6. Remote Status Check
  if (firstArg === 'status' || firstArg === 'view' || firstArg === 'info' || firstArg === 'test') {
    await checkStatus(cwd);
    return;
  }

  // 6. Public Minimal Help (Does NOT expose secret developer commands)
  if (args.includes('--help') || args.includes('-h')) {
    printHeader();
    console.log(pc.bold('Penggunaan:'));
    console.log('  npx @masdannn/license-guard             Inisialisasi & pairing lisensi');
    console.log('  npx @masdannn/license-guard init        Inisialisasi project baru');
    console.log('  npx @masdannn/license-guard status      Cek status lisensi aktif dari server\n');
    return;
  }

  // 7. Interactive Init Flow (default)
  printHeader();

  const { framework, label: frameworkLabel } = detectFramework(cwd);
  console.log(pc.dim(`Terdeteksi Environment: `) + pc.bold(pc.cyan(frameworkLabel)) + '\n');

  const folderName = path.basename(cwd);
  const prompt = createPromptHelper();

  try {
    // 1. Nama Project
    const inputName = await prompt.ask(
      pc.bold('1. Nama Project') + pc.dim(` (default: ${folderName}): `)
    );
    const projectName = inputName || folderName;

    // 2. Domain Project
    const inputDomain = await prompt.ask(
      pc.bold('2. Domain Website Target') + pc.dim(' (contoh: tokoklien.com / localhost:3000): ')
    );
    const projectDomain = inputDomain || 'localhost:3000';

    // 3. Email Developer / Admin
    const inputEmail = await prompt.ask(
      pc.bold('3. Email Akun Developer') + pc.dim(' (terdaftar di License Guard Hub): ')
    );
    const developerEmail = inputEmail.trim();

    prompt.close();

    if (!developerEmail || !/^\S+@\S+\.\S+$/.test(developerEmail)) {
      console.log(pc.red('\n❌ Email tidak valid. Pastikan memasukkan alamat email yang benar.\n'));
      return;
    }

    console.log(pc.dim('\nMenghubungkan ke Central License Guard Server...'));

    const endpoint = DEFAULT_ENDPOINT;
    const generatedKey = generateApiKey();

    // Register & Pair with Backend
    const res = await fetch(`${endpoint.replace(/\/$/, '')}/api/pairing/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: projectName,
        domain: projectDomain,
        email: developerEmail,
        apiKey: generatedKey,
        framework: framework,
      }),
    });

    const data = (await res.json()) as {
      success?: boolean;
      error?: string;
      project?: { id: string; name: string; domain: string; apiKey: string };
    };

    if (!res.ok || !data.success) {
      console.log(pc.bold(pc.red('\n❌ Inisialisasi Lisensi Gagal:')));
      console.log(pc.red(`   ${data.error || 'Server menolak pendaftaran lisensi.'}`));
      console.log(pc.dim('\nTips:'));
      console.log(pc.dim(`  • Pastikan email "${developerEmail}" telah terdaftar di dashboard License Guard.`));
      console.log(pc.dim(`  • Periksa apakah kuota project domain akun Anda masih mencukupi.`));
      console.log(pc.dim(`  • Buka dashboard di: ${endpoint}/billing\n`));
      return;
    }

    const actualApiKey = data.project?.apiKey || generatedKey;
    const encryptedKey = encodeLicensePayload({
      apiKey: actualApiKey,
      endpoint: endpoint,
      domain: projectDomain,
    });

    // Write framework integration files
    console.log(pc.bold(pc.white('\nMenyiapkan berkas proteksi lisensi:')));
    const logLines = setupFrameworkFiles(
      cwd,
      framework,
      encryptedKey,
      projectName,
      projectDomain,
      endpoint
    );
    for (const line of logLines) {
      console.log(line);
    }

    // Success Summary Box
    console.log(pc.bold(pc.green('\n╔══════════════════════════════════════════════════════════╗')));
    console.log(pc.bold(pc.green('║')) + '  ' + pc.bold(pc.white('✅ LISENSI BERHASIL DIINISIALISASI & TERHUBUNG!')) + '         ' + pc.bold(pc.green('║')));
    console.log(pc.bold(pc.green('╠══════════════════════════════════════════════════════════╣')));
    console.log(pc.bold(pc.green('║')) + `  Project Name : ${pc.bold(projectName.padEnd(41).slice(0, 41))}` + pc.bold(pc.green('║')));
    console.log(pc.bold(pc.green('║')) + `  Domain Target: ${pc.bold(projectDomain.padEnd(41).slice(0, 41))}` + pc.bold(pc.green('║')));
    console.log(pc.bold(pc.green('║')) + `  Akun Pemilik : ${pc.cyan(developerEmail.padEnd(41).slice(0, 41))}` + pc.bold(pc.green('║')));
    console.log(pc.bold(pc.green('║')) + `  Framework    : ${pc.yellow(frameworkLabel.padEnd(41).slice(0, 41))}` + pc.bold(pc.green('║')));
    console.log(pc.bold(pc.green('║')) + `  Status       : ${pc.green(pc.bold('ACTIVE (Terproteksi Real-time)'.padEnd(41)))}` + pc.bold(pc.green('║')));
    console.log(pc.bold(pc.green('╚══════════════════════════════════════════════════════════╝\n')));

    console.log(pc.dim('Buka dashboard untuk memantau status atau mengaktifkan killswitch:'));
    console.log(pc.cyan(`👉 ${endpoint}/projects/${data.project?.id || ''}\n`));
  } catch (err: unknown) {
    prompt.close();
    console.log(pc.red(`\n❌ Terjadi kesalahan: ${err instanceof Error ? err.message : String(err)}\n`));
  }
}

main();
