import { useState, useCallback, useRef } from 'react';
import { djangoApi } from '@/lib/api/client';

/**
 * Backend face types from /api/recognize-frame/
 */
type FaceType = 'KNOWN' | 'TEMP' | 'UNSTABLE';

/**
 * Backend attendance_status values:
 * - marked: first recognition today
 * - already_marked: seen again same day
 * - new_visitor: first-time unknown face
 * - returning_visitor: previously seen unknown face
 * - detecting: UNSTABLE only
 */
export type AttendanceStatus =
  | 'marked'
  | 'already_marked'
  | 'new_visitor'
  | 'returning_visitor'
  | 'detecting';

export interface TrackedFace {
  id: string;
  name: string;
  type: 'member' | 'visitor' | 'unstable';
  confidence: number | null;
  bbox: number[];
  attendanceStatus: AttendanceStatus;
  attendanceMarked: boolean;
  requiresClaim: boolean;
  attendanceRecord?: {
    id: string;
    date: string;
    time: string;
    face_detections: number;
  };
  lastSeen: number;
}

/** Single face entry from the backend faces[] array */
interface ApiFace {
  type: FaceType;
  bbox?: number[];
  user_id?: string;
  temp_user_id?: string;
  name?: string;
  confidence?: number;
  attendance_status?: string;
  attendance_record?: {
    id: string;
    date: string;
    time: string;
    face_detections: number;
  };
  requires_claim?: boolean;
}

/** New multi-face response from /api/recognize-frame/ */
interface DjangoResponse {
  success: boolean;
  code?: string;
  timestamp?: string;
  faces_count?: number;
  faces?: ApiFace[];
  // Legacy single-face fields (ignored but kept for safety)
  error?: string;
  message?: string;
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
 * Parse the new multi-face response into TrackedFace array
 */
const parseDjangoResponse = (response: DjangoResponse): TrackedFace[] => {
  const now = Date.now();
  const faces: TrackedFace[] = [];

  if (!response.faces || !Array.isArray(response.faces)) return faces;

  for (const apiFace of response.faces) {
    if (apiFace.type === 'KNOWN' && apiFace.user_id) {
      faces.push({
        id: apiFace.user_id,
        name: apiFace.name || 'Member',
        type: 'member',
        confidence: apiFace.confidence ?? null,
        bbox: apiFace.bbox || [],
        attendanceStatus: (apiFace.attendance_status as AttendanceStatus) || 'marked',
        attendanceMarked: apiFace.attendance_status === 'marked' || apiFace.attendance_status === 'already_marked',
        requiresClaim: false,
        attendanceRecord: apiFace.attendance_record,
        lastSeen: now,
      });
    } else if (apiFace.type === 'TEMP' && apiFace.temp_user_id) {
      faces.push({
        id: apiFace.temp_user_id,
        name: 'Visitor',
        type: 'visitor',
        confidence: apiFace.confidence ?? null,
        bbox: apiFace.bbox || [],
        attendanceStatus: (apiFace.attendance_status as AttendanceStatus) || 'new_visitor',
        attendanceMarked: apiFace.attendance_status === 'new_visitor' || apiFace.attendance_status === 'returning_visitor',
        requiresClaim: apiFace.requires_claim ?? true,
        attendanceRecord: apiFace.attendance_record,
        lastSeen: now,
      });
    } else if (apiFace.type === 'UNSTABLE') {
      faces.push({
        id: `unstable-${now}-${Math.random().toString(36).slice(2, 6)}`,
        name: '',
        type: 'unstable',
        confidence: null,
        bbox: apiFace.bbox || [],
        attendanceStatus: 'detecting',
        attendanceMarked: false,
        requiresClaim: false,
        lastSeen: now,
      });
    }
  }

  return faces;
};

export const useFaceRecognition = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedFaces, setTrackedFaces] = useState<TrackedFace[]>([]);
  const lastUpdateRef = useRef<number>(Date.now());

  const shouldPauseCapture = useCallback((): boolean => {
    return trackedFaces.some(
      face => face.attendanceStatus === 'marked' || face.attendanceStatus === 'already_marked'
    );
  }, [trackedFaces]);

  const clearFaces = useCallback(() => {
    setTrackedFaces([]);
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
        return { success: false, faces: trackedFaces, shouldPause: false, error: result.error, httpStatus: result.status };
      }

      const response = result.data as DjangoResponse;

      if (!response.success) {
        const msg = response.error || response.message || 'Recognition failed';
        setError(msg);
        return { success: false, faces: trackedFaces, shouldPause: false, error: msg, httpStatus: result.status };
      }

      // NO_FACE — clear everything
      if (response.code === 'NO_FACE' || (response.faces_count === 0)) {
        setTrackedFaces([]);
        return { success: true, faces: [], shouldPause: false };
      }

      const newFaces = parseDjangoResponse(response);

      setTrackedFaces(newFaces);
      lastUpdateRef.current = Date.now();

      const shouldPause = newFaces.some(f => f.attendanceStatus === 'marked');
      return { success: true, faces: newFaces, shouldPause };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Recognition failed';
      setError(errorMessage);
      return { success: false, faces: trackedFaces, shouldPause: false, error: errorMessage, httpStatus: 0 };
    } finally {
      setIsProcessing(false);
    }
  }, [trackedFaces]);

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
    error,
    clearError,
    clearFaces,
    pruneStalefaces,
    shouldPauseCapture,
  };
};
