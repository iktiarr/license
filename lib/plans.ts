export type PlanTier = 'FREE' | 'PLUS' | 'PRO' | 'MAX';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  price: number;
  formattedPrice: string;
  tagline: string;
  badgeColor: string;
  maxProjects: number;
  retentionDays: number;
  maxNative: number;
  maxFramework: number;
  frameworkAllowed: boolean;
  features: string[];
  popular?: boolean;
}

export const WHATSAPP_NUMBER = '6285143975550';
export const WHATSAPP_DISPLAY = '085143975550';

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Gratis',
    price: 0,
    formattedPrice: 'Rp 0',
    tagline: 'Cocok untuk coba-coba website native sederhana',
    badgeColor: 'text-zinc-400 bg-zinc-800/80 border-zinc-700',
    maxProjects: 2,
    retentionDays: 0,
    maxNative: 2,
    maxFramework: 0,
    frameworkAllowed: false,
    features: [
      'Maksimal 2 project domain',
      'Proteksi Native Web (HTML, PHP, Vanilla JS)',
      'Tanpa log riwayat audit',
      'Killswitch manual aktif',
      'Komunitas support',
    ],
  },
  PLUS: {
    id: 'PLUS',
    name: 'Plus',
    price: 20000,
    formattedPrice: 'Rp 20.000',
    tagline: 'Untuk freelancer dengan project framework awal',
    badgeColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-700/50',
    maxProjects: 5,
    retentionDays: 7,
    maxNative: 3,
    maxFramework: 2,
    frameworkAllowed: true,
    features: [
      'Maksimal 5 project domain',
      '3 Project Native + 2 Project Framework (Next.js/React/Vue)',
      '7 Hari retensi log aktivitas',
      'Enkripsi kunci client SDK',
      'Prioritas pemulihan lisensi',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro Developer',
    price: 50000,
    formattedPrice: 'Rp 50.000',
    tagline: 'Paling diminati untuk software house & agency',
    badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/50',
    maxProjects: 10,
    retentionDays: 15,
    maxNative: 3,
    maxFramework: 7,
    frameworkAllowed: true,
    popular: true,
    features: [
      'Maksimal 10 project domain',
      '3 Project Native + 7 Project Framework (Next.js/React/Vue)',
      '15 Hari retensi log aktivitas lengkap',
      'Audit log tamper-attempt realtime',
      'Support WhatsApp prioritas',
    ],
  },
  MAX: {
    id: 'MAX',
    name: 'Max Unlimited',
    price: 300000,
    formattedPrice: 'Rp 300.000',
    tagline: 'Akses tanpa batas untuk tim & enterprise developer',
    badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-500/50',
    maxProjects: 999999,
    retentionDays: 999999,
    maxNative: 999999,
    maxFramework: 999999,
    frameworkAllowed: true,
    features: [
      'Unlimited Project Domain (Tanpa batas)',
      'Unlimited Framework & Native apa saja',
      'Unlimited Retensi Log aktivitas selamanya',
      'Direct API bypass & instant pairing',
      'Dedicated support & konsultasi teknis',
    ],
  },
};

/**
 * Generate formatted WhatsApp upgrade link with pre-filled order text
 */
export function getWhatsAppUpgradeUrl(planId: PlanTier, user?: { username?: string | null; email?: string | null; phone?: string | null }): string {
  const plan = PLAN_CONFIGS[planId];
  const username = user?.username || 'Developer';
  const email = user?.email || '—';
  const phone = user?.phone || '—';

  const text = `Halo Admin License Guard,

Saya ingin upgrade akun ke paket *${plan.name} (${plan.formattedPrice})*.

*Detail Akun:*
- Username: ${username}
- Email   : ${email}
- No. HP  : ${phone}
- Target  : ${plan.name} (${plan.formattedPrice})

Mohon informasi nomor rekening / metode pembayaran untuk aktivasi paket ini. Terima kasih!`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Helper to check project creation allowance for a given plan and current project counts
 */
export function checkPlanAllowance(
  planId: PlanTier,
  currentTotalProjects: number,
  currentFrameworkProjects: number,
  isNewProjectFramework: boolean
): { allowed: boolean; reason?: string } {
  const plan = PLAN_CONFIGS[planId] || PLAN_CONFIGS.FREE;

  if (currentTotalProjects >= plan.maxProjects) {
    return {
      allowed: false,
      reason: `Batas project tercapai. Paket ${plan.name} hanya mengizinkan maksimal ${plan.maxProjects} project. Silakan upgrade paket Anda.`,
    };
  }

  if (isNewProjectFramework) {
    if (!plan.frameworkAllowed) {
      return {
        allowed: false,
        reason: `Paket ${plan.name} hanya mendukung project Native Web (HTML/PHP). Silakan upgrade ke PLUS/PRO/MAX untuk menggunakan framework (Next.js/React/Vue).`,
      };
    }

    if (currentFrameworkProjects >= plan.maxFramework) {
      return {
        allowed: false,
        reason: `Batas project framework tercapai (${currentFrameworkProjects}/${plan.maxFramework}). Silakan upgrade ke paket lebih tinggi.`,
      };
    }
  }

  return { allowed: true };
}
