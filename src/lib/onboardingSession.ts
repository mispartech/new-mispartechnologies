import { djangoApi } from '@/lib/api/client';

export type OnboardingSessionPayload = {
  step: number;
  data: Record<string, unknown>;
};

export const getOnboardingStorageKeys = (userId: string) => ({
  data: `mispar_onboarding_data:${userId}`,
  step: `mispar_onboarding_step:${userId}`,
});

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

/**
 * Delete/reset onboarding session on Django backend.
 * Uses JWT auth — no user ID needed.
 */
export const deleteOnboardingSession = async () => {
  const resp = await djangoApi.deleteOnboardingSession();
  if (resp.status === 404) return;
  if (resp.error) throw new Error(resp.error);
};
