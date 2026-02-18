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
  const { data, error } = await djangoApi.getOnboardingSession(userId);
  if (error) throw new Error(error);
  return data as { step: number; data: Record<string, unknown> } | null;
};

export const saveOnboardingSession = async (userId: string, payload: OnboardingSessionPayload) => {
  const { error } = await djangoApi.saveOnboardingSession(userId, payload);
  if (error) throw new Error(error);
};

export const deleteOnboardingSession = async (userId: string) => {
  const { error } = await djangoApi.deleteOnboardingSession(userId);
  if (error) throw new Error(error);
};
