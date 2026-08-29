import { db, getPrismaClient } from '@/lib/db';

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
  maxLockTemplates: number;
  features: string[];
  popular?: boolean;
}

export const WHATSAPP_NUMBER = '6285143975550';
export const WHATSAPP_DISPLAY = '085143975550';

export function formatRupiah(amount: number): string {
  if (amount === 0) return 'Rp 0';
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  FREE: {
    id: 'FREE',
    name: 'Gratis',
    price: 0,
    formattedPrice: 'Rp 0',
    tagline: 'Cocok untuk coba-coba website native sederhana',
    badgeColor: 'text-zinc-600 bg-slate-100 border-slate-200',
    maxProjects: 2,
    retentionDays: 0,
    maxNative: 2,
    maxFramework: 0,
    frameworkAllowed: false,
    maxLockTemplates: 0,
    features: [
      'Maksimal 2 project domain',
      'Proteksi Native Web (HTML, PHP, Vanilla JS)',
      'Tanpa log riwayat audit',
      'Killswitch manual aktif',
      'Layar kunci standar sistem',
      'Komunitas support',
    ],
  },
  PLUS: {
    id: 'PLUS',
    name: 'Plus',
    price: 20000,
    formattedPrice: 'Rp 20.000',
    tagline: 'Untuk freelancer dengan project framework awal',
    badgeColor: 'text-sky-700 bg-sky-50 border-sky-200',
    maxProjects: 5,
    retentionDays: 7,
    maxNative: 3,
    maxFramework: 2,
    frameworkAllowed: true,
    maxLockTemplates: 0,
    features: [
      'Maksimal 5 project domain',
      'Proteksi Framework & Native (Next.js/React/Vue/HTML/PHP)',
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
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    maxProjects: 10,
    retentionDays: 15,
    maxNative: 3,
    maxFramework: 7,
    frameworkAllowed: true,
    maxLockTemplates: 3,
    popular: true,
    features: [
      'Maksimal 10 project domain',
      'Proteksi Framework & Native (Next.js/React/Vue/HTML/PHP)',
      '3 Template Layar Kunci Kustom (.html)',
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
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    maxProjects: 999999,
    retentionDays: 999999,
    maxNative: 999999,
    maxFramework: 999999,
    frameworkAllowed: true,
    maxLockTemplates: 10,
    features: [
      'Unlimited Project Domain (Tanpa batas)',
      'Unlimited Framework & Native apa saja',
      '10 Template Layar Kunci Kustom (.html)',
      'Unlimited Retensi Log aktivitas selamanya',
      'Direct API bypass & instant pairing',
      'Dedicated support & konsultasi teknis',
    ],
  },
};

type DbSettingItem = {
  id: string;
  name?: string;
  price?: number;
  maxProjects?: number;
  retentionDays?: number;
  tagline?: string;
  features?: string[];
};

/**
 * Fetch all dynamic plan configs from DB (with guaranteed direct SQL fallback)
 */
export async function getDynamicPlanConfigs(): Promise<Record<PlanTier, PlanConfig>> {
  const result = { ...PLAN_CONFIGS };

  try {
    let dbSettings: DbSettingItem[] = [];

    // Try via ORM first
    try {
      const client = getPrismaClient();
      if ((client as unknown as { planSetting?: { findMany: () => Promise<DbSettingItem[]> } }).planSetting) {
        dbSettings = await (client as unknown as { planSetting: { findMany: () => Promise<DbSettingItem[]> } }).planSetting.findMany();
      }
    } catch {}

    // If ORM didn't return rows, try direct SQL query
    if (!dbSettings || dbSettings.length === 0) {
      try {
        dbSettings = await db.$queryRawUnsafe<DbSettingItem[]>(
          'SELECT "id", "name", "price", "maxProjects", "retentionDays", "tagline", "features" FROM "plan_settings"'
        );
      } catch {}
    }

    if (!dbSettings || dbSettings.length === 0) {
      // Auto-seed default plans to database in background
      (async () => {
        for (const [tier, cfg] of Object.entries(PLAN_CONFIGS)) {
          try {
            await db.$executeRawUnsafe(
              `INSERT INTO "plan_settings" ("id", "name", "price", "maxProjects", "retentionDays", "tagline", "features", "updatedAt")
               VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
               ON CONFLICT ("id") DO NOTHING`,
              tier,
              cfg.name,
              cfg.price,
              cfg.maxProjects,
              cfg.retentionDays,
              cfg.tagline,
              cfg.features
            );
          } catch {}
        }
      })().catch(() => {});
      return result;
    }

    for (const item of dbSettings) {
      const tier = item.id as PlanTier;
      if (result[tier]) {
        const itemPrice = typeof item.price === 'number' ? item.price : Number(item.price) || 0;
        const itemMaxProjects = typeof item.maxProjects === 'number' ? item.maxProjects : Number(item.maxProjects) || 1;
        const itemRetentionDays = typeof item.retentionDays === 'number' ? item.retentionDays : Number(item.retentionDays) || 0;

        result[tier] = {
          ...result[tier],
          name: item.name || result[tier].name,
          price: itemPrice,
          formattedPrice: formatRupiah(itemPrice),
          maxProjects: itemMaxProjects,
          retentionDays: itemRetentionDays,
          tagline: item.tagline || result[tier].tagline,
          features: item.features && item.features.length > 0 ? item.features : [
            `Maksimal ${itemMaxProjects > 1000 ? 'Unlimited' : itemMaxProjects} project domain`,
            itemRetentionDays === 0
              ? 'Tanpa log riwayat audit'
              : itemRetentionDays > 1000
              ? 'Unlimited retensi log selamanya'
              : `${itemRetentionDays} Hari retensi log aktivitas`,
            'Proteksi Native & Framework',
            'Remote Killswitch Aktif',
          ],
        };
      }
    }

    return result;
  } catch (err) {
    console.error('[getDynamicPlanConfigs] Error:', err);
    return PLAN_CONFIGS;
  }
}

/**
 * Get plan config for a specific plan tier
 */
export async function getPlanConfigById(planId: PlanTier): Promise<PlanConfig> {
  const all = await getDynamicPlanConfigs();
  return all[planId] || PLAN_CONFIGS[planId] || PLAN_CONFIGS.FREE;
}

/**
 * Generate formatted WhatsApp upgrade link with pre-filled order text
 */
export function getWhatsAppUpgradeUrl(
  planId: PlanTier,
  user?: { username?: string | null; email?: string | null; phone?: string | null },
  customPlan?: PlanConfig
): string {
  const plan = customPlan || PLAN_CONFIGS[planId];
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
  isNewProjectFramework: boolean,
  customConfig?: PlanConfig
): { allowed: boolean; reason?: string } {
  const plan = customConfig || PLAN_CONFIGS[planId] || PLAN_CONFIGS.FREE;

  if (currentTotalProjects >= plan.maxProjects) {
    return {
      allowed: false,
      reason: `Batas domain tercapai (${currentTotalProjects}/${plan.maxProjects}). Paket ${plan.name} hanya mengizinkan maksimal ${plan.maxProjects} domain. Silakan upgrade paket Anda.`,
    };
  }

  return { allowed: true };
}
