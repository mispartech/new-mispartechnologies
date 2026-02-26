import { djangoApi } from '@/lib/api/client';

export type OnboardingSessionPayload = {
  step: number;
  data: Record<string, unknown>;
};

export const getOnboardingStorageKeys = (userId: string) => ({
  data: `mispar_onboarding_data:${userId}`,
  step: `mispar_onboarding_step:${userId}`,
});

export const loadOnboardingSession = async (userId: string) => {
  const resp = await djangoApi.getOnboardingSession(userId);
  // Treat 404 as "no session yet" — endpoint may not exist on backend
  if (resp.status === 404) return null;
  if (resp.error) throw new Error(resp.error);
  return resp.data as { step: number; data: Record<string, unknown> } | null;
};

export const saveOnboardingSession = async (userId: string, payload: OnboardingSessionPayload) => {
  const resp = await djangoApi.saveOnboardingSession(userId, payload);
  // Silently ignore if endpoint doesn't exist yet
  if (resp.status === 404) return;
  if (resp.error) throw new Error(resp.error);
};

export const deleteOnboardingSession = async (userId: string) => {
  const resp = await djangoApi.deleteOnboardingSession(userId);
  if (resp.status === 404) return;
  if (resp.error) throw new Error(resp.error);
};
