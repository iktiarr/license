#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import pc from 'picocolors';

const DEFAULT_ENDPOINT = 'https://license-tau-nine.vercel.app';

async function main() {
  console.clear();
  console.log(pc.bold(pc.cyan('\n  🛡️  CENTRALIZED LICENSE GUARD CLI')));
  console.log(pc.dim('  ─────────────────────────────────────────────────────────'));
  console.log(pc.dim('  Alat penghubung otomatis instance klien dengan Control Hub\n'));

  const endpoint = process.env.LICENSE_GUARD_SERVER || DEFAULT_ENDPOINT;

  console.log(pc.yellow('  ⏳ Menghubungi Control Hub untuk meminta Pairing Code...'));

  try {
    const res = await fetch(`${endpoint}/api/pairing/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error(pc.red(`\n  ❌ Gagal meminta pairing code: ${data.error || 'Server error'}`));
      process.exit(1);
    }

    const pairingCode = data.code;

    console.clear();
    console.log(pc.bold(pc.cyan('\n  🛡️  CENTRALIZED LICENSE GUARD CLI')));
    console.log(pc.dim('  ─────────────────────────────────────────────────────────\n'));
    console.log(pc.green('  ┌─────────────────────────────────────────────────────┐'));
    console.log(pc.green('  │                                                     │'));
    console.log(
      `  │   🔑  Pairing Code:  ${pc.bold(pc.yellow(pc.underline(pairingCode)))}                │`
    );
    console.log('  │                                                     │');
    console.log(pc.green('  └─────────────────────────────────────────────────────┘\n'));
    console.log(pc.bold('  👉 Langkah Selanjutnya:'));
    console.log(
      `  1. Buka Dashboard Admin: ${pc.cyan(`${endpoint}/projects/new`)}`
    );
    console.log(`  2. Masukkan nama project, domain website, dan kode ${pc.yellow(pairingCode)}`);
    console.log(`  3. Klik tombol ${pc.bold(pc.green('"⚡ Tes Koneksi & Pasangkan"'))}\n`);
    console.log(pc.dim('  ─────────────────────────────────────────────────────────'));
    console.log(pc.yellow('  ⏳ Menunggu konfirmasi dari Dashboard Admin... (Ctrl+C untuk batal)'));

    // Polling status
    const pollInterval = 2500;
    const maxAttempts = 240; // 10 menit
    let attempts = 0;

    const timer = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(timer);
        console.log(pc.red('\n  ⌛ Sesi pairing kedaluwarsa. Silakan jalankan ulang CLI.'));
        process.exit(1);
      }

      try {
        const checkRes = await fetch(`${endpoint}/api/pairing/status?code=${pairingCode}`);
        const checkData = await checkRes.json();

        if (checkData.status === 'CLAIMED') {
          clearInterval(timer);
          console.clear();
          console.log(pc.bold(pc.green('\n  🎉 PROYEK BERHASIL DIPASANGKAN!')));
          console.log(pc.dim('  ─────────────────────────────────────────────────────────\n'));
          console.log(`  📌 Project ID : ${pc.bold(checkData.projectId)}`);
          console.log(`  🌐 Domain     : ${pc.bold(checkData.domain)}`);
          console.log(`  🔑 API Key    : ${pc.dim(checkData.apiKey)}\n`);

          // Simpan konfigurasi lokal .licenseguard.json
          const configData = {
            projectId: checkData.projectId,
            apiKey: checkData.apiKey,
            domain: checkData.domain,
            endpoint: endpoint,
            pairedAt: new Date().toISOString(),
          };

          const configPath = path.join(process.cwd(), '.licenseguard.json');
          fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');

          console.log(pc.green(`  ✅ File konfigurasi tersimpan di: ${pc.bold('.licenseguard.json')}\n`));
          console.log(pc.bold('  🚀 Cara Mengaktifkan di Website/Aplikasi:'));
          console.log(pc.cyan('  ---------------------------------------------------------'));
          console.log(pc.white('  // Di index.html / <head>:'));
          console.log(
            pc.yellow(
              `  <script src="${endpoint}/guard.js" data-api-key="${checkData.apiKey}"></script>`
            )
          );
          console.log(pc.white('\n  // Atau di React / Next.js / Node.js:'));
          console.log(pc.yellow('  import { initGuard } from "@masdannn/license-guard";'));
          console.log(
            pc.yellow(`  initGuard({ apiKey: "${checkData.apiKey}" });\n`)
          );
          console.log(pc.dim('  ─────────────────────────────────────────────────────────'));
          console.log(pc.bold(pc.green('  🛡️  Website Anda kini terlindungi oleh Central License Guard!\n')));
          process.exit(0);
        } else if (checkData.status === 'EXPIRED') {
          clearInterval(timer);
          console.log(pc.red('\n  ❌ Kode pairing kedaluwarsa.'));
          process.exit(1);
        }
      } catch {
        // Abaikan transient error selama polling
      }
    }, pollInterval);
  } catch (err) {
    console.error(pc.red(`\n  ❌ Gagal terhubung ke server: ${err instanceof Error ? err.message : err}`));
    process.exit(1);
  }
}

main();
