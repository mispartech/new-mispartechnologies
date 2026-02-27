import { useMemo } from 'react';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';

type EmbeddingStatus = 'NOT_STARTED' | 'PROCESSING' | 'READY' | 'FAILED';

interface UseEnrollmentGuardResult {
  isEnrolled: boolean | null;
  isLoading: boolean;
  enrollmentStatus: EmbeddingStatus | null;
  refetch: () => Promise<void>;
}

/**
 * Guard hook that derives face enrollment status from the profile
 * stored in AuthContext. No separate API call needed.
 */
export const useFaceEnrollmentGuard = (_userId?: string): UseEnrollmentGuardResult => {
  const { user, isLoading, refreshUser } = useDjangoAuth();

  const result = useMemo((): Omit<UseEnrollmentGuardResult, 'refetch'> => {
    if (isLoading || !user) {
      return { isEnrolled: null, isLoading: true, enrollmentStatus: null };
    }

    const status = (user.face_embedding_status as EmbeddingStatus) || 'NOT_STARTED';
    const enrolled = user.face_image_uploaded === true && status === 'READY';

    return { isEnrolled: enrolled, isLoading: false, enrollmentStatus: status };
  }, [user, isLoading]);

  return { ...result, refetch: refreshUser };
};
