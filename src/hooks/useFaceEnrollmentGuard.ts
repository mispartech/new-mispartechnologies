import { useMemo } from 'react';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';

interface UseEnrollmentGuardResult {
  isEnrolled: boolean | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Guard hook that derives face enrollment status from profile.face_enrolled.
 * No separate API call needed.
 */
export const useFaceEnrollmentGuard = (_userId?: string): UseEnrollmentGuardResult => {
  const { user, isLoading, refreshUser } = useDjangoAuth();

  const result = useMemo((): Omit<UseEnrollmentGuardResult, 'refetch'> => {
    if (isLoading || !user) {
      return { isEnrolled: null, isLoading: true };
    }
    return { isEnrolled: user.face_enrolled === true, isLoading: false };
  }, [user, isLoading]);

  return { ...result, refetch: refreshUser };
};
