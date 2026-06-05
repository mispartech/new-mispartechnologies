/**
 * Schools — Biometric Identity API client.
 * Backend contract: docs/schools/frontend-integration-guide.md §4.6
 *
 * Tenant scoping is server-side (Supabase JWT). The frontend never sends
 * organization_id/user_id in URLs or bodies.
 */

import { schoolsRequest, schoolsFetch, unwrapPaginated } from './schoolsClient';
import { SCHOOLS_API_ROUTES } from './schoolsApiRoutes';

export type IdentityRole = 'student' | 'teacher' | 'staff' | 'admin' | 'visitor';
export type EnrollmentStatus = 'pending' | 'enrolled' | 'expired' | 'rejected';
export type CredentialType = 'face' | 'rfid' | 'nfc' | 'qr';

export interface IdentityProfile {
  id: string;
  full_name: string;
  role: IdentityRole;
  reference_no: string;
  campus: string | null;
  faculty: string | null;
  department: string | null;
  class_or_level: string | null;
  enrollment_status: EnrollmentStatus;
  face_quality_score: number | null;
  credentials: CredentialType[];
  photo_url: string | null;
  last_seen_at: string | null;
  created_at: string;
}

export interface DuplicateSuspect {
  id: string;
  similarity: number;
  primary: IdentityProfile;
  candidate: IdentityProfile;
  detected_at: string;
}

export interface IdentityListResponse {
  results: IdentityProfile[];
  count: number;
  next: string | null;
  previous: string | null;
}

const mapIdentity = (raw: any): IdentityProfile => ({
  id: raw.id,
  full_name: raw.full_name || `${raw.first_name ?? ''} ${raw.last_name ?? ''}`.trim(),
  role: (raw.role ?? raw.person_type ?? 'student') as IdentityRole,
  reference_no: raw.reference_no ?? raw.admission_no ?? raw.staff_no ?? '',
  campus: raw.campus_name ?? raw.campus ?? null,
  faculty: raw.faculty ?? null,
  department: raw.department_name ?? raw.department ?? null,
  class_or_level: raw.class_name ?? raw.class_or_level ?? null,
  enrollment_status: (raw.enrollment_status ?? 'pending') as EnrollmentStatus,
  face_quality_score: raw.face_quality_score ?? raw.quality ?? null,
  credentials: Array.isArray(raw.credentials) ? raw.credentials : (raw.face_enrolled ? ['face'] : []),
  photo_url: raw.photo_url ?? null,
  last_seen_at: raw.last_seen_at ?? null,
  created_at: raw.created_at ?? new Date().toISOString(),
});

const NOT_AVAILABLE = 'This identity endpoint is not part of the MVP backend yet.';

export const schoolsIdentityApi = {
  async list(params: { q?: string; role?: IdentityRole; status?: EnrollmentStatus; page?: number } = {}): Promise<IdentityListResponse> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
    const res = await schoolsRequest<any>(`${SCHOOLS_API_ROUTES.IDENTITIES}${q.toString() ? `?${q}` : ''}`);
    if (res.error) throw new Error(res.error);
    const page = unwrapPaginated<any>(res.data);
    return {
      results: page.items.map(mapIdentity),
      count: page.count,
      next: page.next,
      previous: page.previous,
    };
  },
  async detail(id: string): Promise<IdentityProfile> {
    return mapIdentity(await schoolsFetch<any>(SCHOOLS_API_ROUTES.IDENTITY(id)));
  },
  async create(payload: Partial<IdentityProfile>): Promise<IdentityProfile> {
    return mapIdentity(await schoolsFetch<any>(SCHOOLS_API_ROUTES.IDENTITIES, {
      method: 'POST', body: JSON.stringify(payload),
    }));
  },
  enroll: (id: string, image_base64: string) =>
    schoolsFetch<{ embedding_id: string; quality: number; ok: boolean; message?: string }>(
      SCHOOLS_API_ROUTES.IDENTITY_ENROLL(id),
      { method: 'POST', body: JSON.stringify({ image_base64 }), timeout: 45000 },
    ),
  reEnroll: (id: string, image_base64: string) =>
    schoolsFetch<{ embedding_id: string; quality: number; ok: boolean }>(
      SCHOOLS_API_ROUTES.IDENTITY_RE_ENROLL(id),
      { method: 'POST', body: JSON.stringify({ image_base64 }), timeout: 45000 },
    ),
  duplicates: (): Promise<{ results: DuplicateSuspect[] }> =>
    Promise.reject(new Error(NOT_AVAILABLE)),
  resolveDuplicate: (_id: string, _action: 'merge' | 'dismiss') =>
    Promise.reject(new Error(NOT_AVAILABLE)),
  issueCredential: (_id: string, _type: CredentialType, _value?: string) =>
    Promise.reject(new Error(NOT_AVAILABLE)),
};

/* Kept for backwards compatibility — empty arrays so any consumer that still
 * imports the mock data renders the empty state instead of fake records. */
export const MOCK_IDENTITIES: IdentityProfile[] = [];
export const MOCK_DUPLICATES: DuplicateSuspect[] = [];
