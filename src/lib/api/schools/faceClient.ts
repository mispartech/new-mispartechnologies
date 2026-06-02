/**
 * Schools Face Recognition Client
 *
 * Talks to the dedicated `schools-fr` microservice. Closed-set recognition:
 * only enrolled identities can match, no unknown-face clustering. This is
 * what makes it faster than the general visitor-aware engine used elsewhere.
 *
 * Base URL: import.meta.env.VITE_SCHOOLS_FR_URL
 * Default timeout is 45s for biometric calls.
 */

import { schoolsRequest, type ApiResponse } from './schoolsClient';
import { SCHOOLS_FR_ROUTES } from './schoolsApiRoutes';

const FR_BASE =
  import.meta.env.VITE_SCHOOLS_FR_URL || 'https://fr.schools.mispartechnologies.com';

export interface EnrollResponse {
  embedding_id: string;
  quality: number;     // 0..1
  ok: boolean;
  message?: string;
}

export interface RecognizeMatch {
  person_id: string;
  score: number;       // 0..1
  bbox: [number, number, number, number];
}

export interface RecognizeResponse {
  matches: RecognizeMatch[];
  latency_ms: number;
}

export interface FaceEngineHealth {
  gpu: boolean;
  queue_depth: number;
  p50_ms: number;
  p95_ms: number;
  model_version: string;
}

const fr = <T>(path: string, init: RequestInit & { timeout?: number; silent?: boolean } = {}) =>
  schoolsRequest<T>(path, { timeout: 45000, ...init }, FR_BASE);

export const schoolsFaceApi = {
  enroll(payload: { person_id: string; image_base64: string }): Promise<ApiResponse<EnrollResponse>> {
    return fr(SCHOOLS_FR_ROUTES.ENROLL, { method: 'POST', body: JSON.stringify(payload) });
  },
  reEnroll(payload: { person_id: string; image_base64: string }): Promise<ApiResponse<EnrollResponse>> {
    return fr(SCHOOLS_FR_ROUTES.RE_ENROLL, { method: 'POST', body: JSON.stringify(payload) });
  },
  recognize(payload: {
    image_base64: string;
    capture_point_id: string;
    mode: 'gate' | 'classroom' | 'event' | 'kiosk' | 'mobile';
  }): Promise<ApiResponse<RecognizeResponse>> {
    return fr(SCHOOLS_FR_ROUTES.RECOGNIZE, { method: 'POST', body: JSON.stringify(payload), silent: true });
  },
  recognizeBatch(payload: {
    frames_base64: string[];
    capture_point_id: string;
    mode: 'gate' | 'classroom' | 'event' | 'kiosk' | 'mobile';
  }): Promise<ApiResponse<RecognizeResponse[]>> {
    return fr(SCHOOLS_FR_ROUTES.RECOGNIZE_BATCH, { method: 'POST', body: JSON.stringify(payload), silent: true });
  },
  health(): Promise<ApiResponse<FaceEngineHealth>> {
    return fr(SCHOOLS_FR_ROUTES.HEALTH, { silent: true });
  },
  deletePerson(personId: string): Promise<ApiResponse<{ ok: boolean }>> {
    return fr(SCHOOLS_FR_ROUTES.DELETE_PERSON(personId), { method: 'DELETE' });
  },
};
