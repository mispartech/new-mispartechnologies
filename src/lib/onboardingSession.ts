import { djangoApi } from '@/lib/api/client';

export type OnboardingSessionPayload = {
  step: number;
  data: Record<string, unknown>;
};

export const getOnboardingStorageKeys = (userId: string) => ({
  data: `mispar_onboarding_data:${userId}`,
  step: `mispar_onboarding_step:${userId}`,
});

// ─── Cookie helpers ───────────────────────────────────────────

const COOKIE_NAME = 'mispar_onboarding_active';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const setOnboardingCookie = (userId: string) => {
  document.cookie = `${COOKIE_NAME}=${userId}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

export const getOnboardingCookie = (): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const clearOnboardingCookie = () => {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
};

// ─── Snake-to-camel transformer ───────────────────────────────

const SNAKE_TO_CAMEL_MAP: Record<string, string> = {
  organization_type: 'organizationType',
  organization_name: 'organizationName',
  admin_first_name: 'adminFirstName',
  admin_last_name: 'adminLastName',
  admin_role: 'adminRole',
  size_range: 'sizeRange',
  service_schedules: 'serviceSchedules',
};

/**
 * Detect if data contains snake_case keys and transform to camelCase.
 * This handles the case where a failed final submit wrote snake_case data
 * and the restore logic now receives it.
 */
export const normalizeToCamelCase = (raw: Record<string, unknown>): Record<string, unknown> => {
  const hasSnakeKeys = Object.keys(raw).some((k) => k in SNAKE_TO_CAMEL_MAP);
  if (!hasSnakeKeys) return raw;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    const camelKey = SNAKE_TO_CAMEL_MAP[key] ?? key;
    // Skip meta flags
    if (camelKey === 'is_completed' || camelKey === 'is_draft') continue;
    result[camelKey] = value;
  }

  // Transform nested service_schedules back to camelCase
  if (Array.isArray(result.serviceSchedules)) {
    result.serviceSchedules = (result.serviceSchedules as Record<string, unknown>[]).map((s) => ({
      id: s.id ?? crypto.randomUUID(),
      name: s.name ?? '',
      description: s.description ?? '',
      dayOfWeek: s.day_of_week ?? s.dayOfWeek ?? 0,
      startTime: s.start_time ?? s.startTime ?? '09:00',
      endTime: s.end_time ?? s.endTime ?? '17:00',
      isActive: s.is_active ?? s.isActive ?? true,
    }));
  }

  return result;
};

// ─── API helpers ──────────────────────────────────────────────

/**
 * Load onboarding session from Django backend.
 * Uses JWT auth — no user ID needed.
 */
export const loadOnboardingSession = async () => {
  const resp = await djangoApi.getOnboardingSession();
  // Treat 404 as "no session yet"
  if (resp.status === 404) return null;
  if (resp.error) throw new Error(resp.error);
  return resp.data as { step: number; data: Record<string, unknown>; is_completed?: boolean } | null;
};

/**
 * Save onboarding session to Django backend.
 * Uses JWT auth — no user ID needed.
 */
export const saveOnboardingSession = async (payload: OnboardingSessionPayload) => {
  const resp = await djangoApi.saveOnboardingSession(payload);
  if (resp.status === 404) return;
  if (resp.error) throw new Error(resp.error);
};
