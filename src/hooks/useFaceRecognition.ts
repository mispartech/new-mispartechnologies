import { useState, useCallback, useRef } from 'react';
import { djangoApi } from '@/lib/api/client';

/**
 * Backend response types - matches Django API contract (single-face only)
 */
type ResponseType = 'KNOWN' | 'TEMP' | null;

export type AttendanceStatus = 'detecting' | 'confirmed';

export interface TrackedFace {
  id: string;
  name: string;
  type: 'member' | 'visitor';
  confidence: number | null;
  bbox: number[];
  attendanceStatus: AttendanceStatus;
  attendanceMarked?: boolean;
  requiresClaim?: boolean;
  lastSeen: number;
}

/**
 * Django API response format — single-face only (no legacy faces array)
 */
interface DjangoResponse {
  success: boolean;
  code?: string;
  type?: ResponseType;
  user_id?: string;
  temp_user_id?: string;
  confidence?: number;
  attendance_marked?: boolean;
  requires_claim?: boolean;
  name?: string;
  bbox?: number[];
  message?: string;
  error?: string;
  timestamp?: string;
}

interface RegistrationResult {
  success: boolean;
  user_id?: string;
  message?: string;
  embedding_saved?: boolean;
  error?: string;
  code?: string;
}

interface HealthCheckResult {
  success: boolean;
  django_api: 'connected' | 'unreachable' | 'error';
  error?: string;
  timestamp: string;
}

const FACE_TIMEOUT_MS = 3000;

/**
 * Parse Django response into TrackedFace array — single-face format only
 */
const parseDjangoResponse = (response: DjangoResponse): {
  faces: TrackedFace[];
  scanningBboxes: number[][];
} => {
  const faces: TrackedFace[] = [];
  const scanningBboxes: number[][] = [];
  const now = Date.now();

  if (response.type === 'KNOWN' && response.user_id) {
    faces.push({
      id: response.user_id,
      name: response.name || 'Member',
      type: 'member',
      confidence: response.confidence || null,
      bbox: response.bbox || [],
      attendanceStatus: response.attendance_marked ? 'confirmed' : 'detecting',
      attendanceMarked: response.attendance_marked,
      lastSeen: now,
    });
  } else if (response.type === 'TEMP' && response.temp_user_id) {
    if (response.bbox && response.bbox.length >= 4) {
      scanningBboxes.push(response.bbox);
    }
  }

  return { faces, scanningBboxes };
};

export const useFaceRecognition = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedFaces, setTrackedFaces] = useState<TrackedFace[]>([]);
  const [scanningBboxes, setScanningBboxes] = useState<number[][]>([]);
  const lastUpdateRef = useRef<number>(Date.now());

  const shouldPauseCapture = useCallback((): boolean => {
    return trackedFaces.some(face => face.attendanceStatus === 'confirmed');
  }, [trackedFaces]);

  const clearFaces = useCallback(() => {
    setTrackedFaces([]);
    setScanningBboxes([]);
    lastUpdateRef.current = Date.now();
  }, []);

  const pruneStalefaces = useCallback(() => {
    const now = Date.now();
    setTrackedFaces(prev =>
      prev.filter(face => now - face.lastSeen < FACE_TIMEOUT_MS)
    );
  }, []);

  const recognizeFace = useCallback(async (
    imageDataUrl: string,
    organizationId?: string,
    options?: { silent?: boolean; timeout?: number }
  ): Promise<{
    success: boolean;
    faces: TrackedFace[];
    scanningBboxes: number[][];
    shouldPause: boolean;
    error?: string;
    httpStatus?: number;
  }> => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await djangoApi.recognizeFace(imageDataUrl, organizationId, options);

      if (result.error) {
        setError(result.error);
        return { success: false, faces: trackedFaces, scanningBboxes, shouldPause: false, error: result.error, httpStatus: result.status };
      }

      const response = result.data as DjangoResponse;

      if (!response.success) {
        const msg = response.error || response.message || 'Recognition failed';
        setError(msg);
        return {
          success: false,
          faces: trackedFaces,
          scanningBboxes,
          shouldPause: false,
          error: msg,
          httpStatus: result.status,
        };
      }

      const { faces: newFaces, scanningBboxes: newScanningBboxes } = parseDjangoResponse(response);

      if (response.code === 'NO_FACE') {
        setTrackedFaces([]);
        setScanningBboxes([]);
        return { success: true, faces: [], scanningBboxes: [], shouldPause: false };
      }

      setScanningBboxes(newScanningBboxes);

      if (newFaces.length > 0) {
        setTrackedFaces(newFaces);
        lastUpdateRef.current = Date.now();
        const shouldPause = newFaces.some(f => f.attendanceMarked);
        return { success: true, faces: newFaces, scanningBboxes: newScanningBboxes, shouldPause };
      }

      if (newScanningBboxes.length > 0) {
        return { success: true, faces: [], scanningBboxes: newScanningBboxes, shouldPause: false };
      }

      setTrackedFaces([]);
      setScanningBboxes([]);
      return { success: true, faces: [], scanningBboxes: [], shouldPause: false };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Recognition failed';
      setError(errorMessage);
      return { success: false, faces: trackedFaces, scanningBboxes, shouldPause: false, error: errorMessage, httpStatus: 0 };
    } finally {
      setIsProcessing(false);
    }
  }, [trackedFaces, scanningBboxes]);

  const registerFace = useCallback(async (
    imageBase64: string,
    userData: { user_id: string; name: string }
  ): Promise<RegistrationResult | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const byteString = atob(imageBase64);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: 'image/jpeg' });

      const result = await djangoApi.enrollFace(blob);

      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      const data = result.data;
      if (data && data.status !== 'success' && data.status !== 'SUCCESS') {
        const msg = data.message || 'Enrollment failed';
        setError(msg);
        if (data.status === 'DUPLICATE_FACE' || data.status === 'duplicate') {
          return { success: false, error: 'duplicate_face', code: 'DUPLICATE_FACE', message: msg };
        }
      }

      return data ? { success: true, ...data } : null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      console.error('[useFaceRecognition] Registration error:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const checkHealth = useCallback(async (): Promise<HealthCheckResult | null> => {
    try {
      const result = await djangoApi.healthCheck();
      if (result.error) {
        return {
          success: false,
          django_api: 'unreachable',
          error: result.error,
          timestamp: new Date().toISOString(),
        };
      }
      return {
        success: true,
        django_api: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      return {
        success: false,
        django_api: 'unreachable',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    recognizeFace,
    registerFace,
    checkHealth,
    isProcessing,
    trackedFaces,
    scanningBboxes,
    error,
    clearError,
    clearFaces,
    pruneStalefaces,
    shouldPauseCapture,
  };
};
