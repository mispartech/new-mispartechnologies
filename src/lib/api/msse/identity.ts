/**
 * MSSE — Biometric Identity API client
 * Backend spec: docs/msse/step2-identity-backend-prompt.md
 *
 * All endpoints are tenant-scoped by JWT (campus_id, faculty_id resolved
 * server-side). The frontend NEVER sends organization/user IDs in URLs.
 *
 * Endpoints expected:
 *   GET    /api/msse/identities/                  list + filters
 *   GET    /api/msse/identities/:id/              detail
 *   POST   /api/msse/identities/                  create profile (no biometric yet)
 *   POST   /api/msse/identities/:id/enroll/       upload biometric (base64 image)
 *   POST   /api/msse/identities/:id/re-enroll/    invalidate + re-enroll
 *   GET    /api/msse/identities/duplicates/       duplicate suspects feed
 *   POST   /api/msse/identities/duplicates/:id/resolve/  merge | dismiss
 *   POST   /api/msse/identities/:id/credentials/  issue RFID/NFC/QR backup
 */
// Backend pending — these stubs always reject so the UI falls back to mock data.
const notImplemented = <T>(_endpoint: string): Promise<T> =>
  Promise.reject(new Error('MSSE identity endpoints not yet implemented on backend'));

export type IdentityRole = 'student' | 'teacher' | 'staff' | 'admin' | 'visitor';
export type EnrollmentStatus = 'pending' | 'enrolled' | 'expired' | 'rejected';
export type CredentialType = 'face' | 'rfid' | 'nfc' | 'qr';

export interface IdentityProfile {
  id: string;
  full_name: string;
  role: IdentityRole;
  reference_no: string;            // matric / staff ID
  campus: string | null;
  faculty: string | null;
  department: string | null;
  class_or_level: string | null;
  enrollment_status: EnrollmentStatus;
  face_quality_score: number | null;  // 0..1
  credentials: CredentialType[];
  photo_url: string | null;
  last_seen_at: string | null;
  created_at: string;
}

export interface DuplicateSuspect {
  id: string;
  similarity: number;             // 0..1
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

const BASE = '/api/msse/identities';

export const msseIdentityApi = {
  list: (_params?: { q?: string; role?: IdentityRole; status?: EnrollmentStatus; page?: number }) =>
    notImplemented<IdentityListResponse>(`GET ${BASE}/`),

  detail: (id: string) =>
    notImplemented<IdentityProfile>(`GET ${BASE}/${id}/`),

  create: (_payload: Partial<IdentityProfile>) =>
    notImplemented<IdentityProfile>(`POST ${BASE}/`),

  enroll: (id: string, _image_base64: string) =>
    notImplemented<{ success: boolean; quality_score: number; message?: string }>(`POST ${BASE}/${id}/enroll/`),

  reEnroll: (id: string, _image_base64: string) =>
    notImplemented<{ success: boolean; quality_score: number }>(`POST ${BASE}/${id}/re-enroll/`),

  duplicates: () =>
    notImplemented<{ results: DuplicateSuspect[] }>(`GET ${BASE}/duplicates/`),

  resolveDuplicate: (id: string, _action: 'merge' | 'dismiss') =>
    notImplemented<unknown>(`POST ${BASE}/duplicates/${id}/resolve/`),

  issueCredential: (id: string, _type: CredentialType, _value?: string) =>
    notImplemented<unknown>(`POST ${BASE}/${id}/credentials/`),
};

/* -------------------------------------------------------------------------- */
/* Mock data — used until backend ships. Components fall back to this on 404. */
/* -------------------------------------------------------------------------- */

export const MOCK_IDENTITIES: IdentityProfile[] = [
  {
    id: 'i-001', full_name: 'Adaeze Okeke', role: 'student', reference_no: 'CSC/2022/001',
    campus: 'Main Campus', faculty: 'Science', department: 'Computer Science',
    class_or_level: '300L', enrollment_status: 'enrolled', face_quality_score: 0.96,
    credentials: ['face', 'rfid'], photo_url: null,
    last_seen_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    created_at: '2025-01-12T08:00:00Z',
  },
  {
    id: 'i-002', full_name: 'Ibrahim Musa', role: 'student', reference_no: 'EEE/2023/044',
    campus: 'Main Campus', faculty: 'Engineering', department: 'Electrical Eng.',
    class_or_level: '200L', enrollment_status: 'pending', face_quality_score: null,
    credentials: [], photo_url: null, last_seen_at: null,
    created_at: '2025-03-02T10:14:00Z',
  },
  {
    id: 'i-003', full_name: 'Dr. Chinwe Aluko', role: 'teacher', reference_no: 'STF/0231',
    campus: 'Main Campus', faculty: 'Science', department: 'Mathematics',
    class_or_level: null, enrollment_status: 'enrolled', face_quality_score: 0.91,
    credentials: ['face', 'nfc'], photo_url: null,
    last_seen_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    created_at: '2024-09-01T07:30:00Z',
  },
  {
    id: 'i-004', full_name: 'Tomiwa Adebayo', role: 'student', reference_no: 'MTH/2021/112',
    campus: 'Annex Campus', faculty: 'Science', department: 'Mathematics',
    class_or_level: '400L', enrollment_status: 'expired', face_quality_score: 0.62,
    credentials: ['face'], photo_url: null,
    last_seen_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    created_at: '2024-02-10T09:00:00Z',
  },
  {
    id: 'i-005', full_name: 'Fatima Bello', role: 'staff', reference_no: 'STF/0588',
    campus: 'Main Campus', faculty: null, department: 'Bursary',
    class_or_level: null, enrollment_status: 'enrolled', face_quality_score: 0.88,
    credentials: ['face', 'rfid', 'qr'], photo_url: null,
    last_seen_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    created_at: '2024-11-21T08:00:00Z',
  },
];

export const MOCK_DUPLICATES: DuplicateSuspect[] = [
  {
    id: 'dup-1', similarity: 0.94, detected_at: new Date().toISOString(),
    primary: MOCK_IDENTITIES[0],
    candidate: { ...MOCK_IDENTITIES[3], full_name: 'Ada Okeke', reference_no: 'CSC/2022/091' },
  },
];
