import { useState, useEffect, useCallback } from 'react';
import { djangoApi } from '@/lib/api/client';

interface UseEnrollmentGuardResult {
  isEnrolled: boolean | null;
  isLoading: boolean;
  enrollmentStatus: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED' | null;
  refetch: () => Promise<void>;
}

/**
 * Guard hook that checks if user has completed face enrollment.
 * Uses Django API as the single source of truth for enrollment status.
 * No fallbacks — if the endpoint fails, assume not enrolled.
 */
export const useFaceEnrollmentGuard = (userId: string | undefined): UseEnrollmentGuardResult => {
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'PENDING' | 'PROCESSING' | 'READY' | 'FAILED' | null>(null);

  const checkEnrollment = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setIsEnrolled(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await djangoApi.checkFaceEnrollmentStatus(userId);

      if (result.data && !result.error && result.data.face_embedding_status) {
        const enrolled = result.data.face_image_uploaded === true && result.data.face_embedding_status === 'READY';
        setIsEnrolled(enrolled);
        setEnrollmentStatus(result.data.face_embedding_status);
        if (import.meta.env.DEV) {
          console.log('[FaceEnrollmentGuard] Status:', {
            face_image_uploaded: result.data.face_image_uploaded,
            face_embedding_status: result.data.face_embedding_status,
            enrolled
          });
        }
        return;
      }

      // Endpoint failed or returned unexpected data — assume not enrolled
      console.warn('[FaceEnrollmentGuard] Enrollment status check failed, assuming not enrolled');
      setIsEnrolled(false);
      setEnrollmentStatus(null);
    } catch (err) {
      console.error('[FaceEnrollmentGuard] Check failed:', err);
      setIsEnrolled(false);
      setEnrollmentStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    checkEnrollment();
  }, [checkEnrollment]);

  return {
    isEnrolled,
    isLoading,
    enrollmentStatus,
    refetch: checkEnrollment,
  };
};
