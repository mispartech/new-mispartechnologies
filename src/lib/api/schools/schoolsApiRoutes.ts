/**
 * Central route map for the Schools vertical backend.
 * Served by the `schools-api` service (separate from the main mispartechnologies API).
 * Base URL: import.meta.env.VITE_SCHOOLS_API_URL
 */

export const SCHOOLS_API_ROUTES = {
  // ── Onboarding ──
  ONBOARDING: '/api/schools/onboarding/',

  // ── Overview / activity ──
  OVERVIEW: '/api/schools/overview/',
  ACTIVITY: '/api/schools/activity/',

  // ── Students ──
  STUDENTS: '/api/schools/students/',
  STUDENT: (id: string) => `/api/schools/students/${id}/`,
  STUDENT_ATTENDANCE: (id: string) => `/api/schools/students/${id}/attendance/`,
  STUDENT_NOTIFY_GUARDIAN: (id: string) => `/api/schools/students/${id}/notify-guardian/`,
  STUDENTS_IMPORT: '/api/schools/students/import/',

  // ── Staff ──
  STAFF: '/api/schools/staff/',
  STAFF_DETAIL: (id: string) => `/api/schools/staff/${id}/`,
  STAFF_ATTENDANCE: (id: string) => `/api/schools/staff/${id}/attendance/`,
  STAFF_NOTIFY_MANAGER: (id: string) => `/api/schools/staff/${id}/notify-manager/`,
  STAFF_IMPORT: '/api/schools/staff/import/',

  // ── Attendance ──
  ATTENDANCE: '/api/schools/attendance/',
  ATTENDANCE_MARK: '/api/schools/attendance/mark/',
  ATTENDANCE_EXCUSE: (id: string) => `/api/schools/attendance/${id}/excuse/`,
  ATTENDANCE_KPIS: '/api/schools/attendance/kpis/',
  ATTENDANCE_HEATMAP: '/api/schools/attendance/heatmap/',
  ATTENDANCE_AT_RISK: '/api/schools/attendance/at-risk/',
  ATTENDANCE_SESSIONS: '/api/schools/attendance/sessions/',
  ATTENDANCE_EXPORT: '/api/schools/attendance/export/',

  // ── Capture points ──
  CAPTURE_POINTS: '/api/schools/capture-points/',
  CAPTURE_POINT: (id: string) => `/api/schools/capture-points/${id}/`,
  CAPTURE_POINT_HEARTBEAT: (id: string) => `/api/schools/capture-points/${id}/heartbeat/`,

  // ── Identity (biometric) ──
  IDENTITIES: '/api/schools/identities/',
  IDENTITY: (id: string) => `/api/schools/identities/${id}/`,
  IDENTITY_ENROLL: (id: string) => `/api/schools/identities/${id}/enroll/`,
  IDENTITY_RE_ENROLL: (id: string) => `/api/schools/identities/${id}/re-enroll/`,

  // ── Settings ──
  SETTINGS: '/api/schools/settings/',

  // ── Platform admin (Ednitio) ──
  PLATFORM_TENANTS: '/api/schools/platform/tenants/',
  PLATFORM_TENANT: (orgId: string) => `/api/schools/platform/tenants/${orgId}/`,
  PLATFORM_FACE_ENGINE_HEALTH: '/api/schools/platform/face-engine/health/',
  PLATFORM_DUPLICATES: '/api/schools/platform/duplicates/',
  PLATFORM_AUDIT_LOG: '/api/schools/platform/audit-log/',
} as const;

/**
 * Dedicated Face Recognition microservice.
 * Closed-set: only enrolled identities can match — no unknown-face clustering.
 * Base URL: import.meta.env.VITE_SCHOOLS_FR_URL
 */
export const SCHOOLS_FR_ROUTES = {
  ENROLL: '/v1/face/enroll',
  RE_ENROLL: '/v1/face/re-enroll',
  RECOGNIZE: '/v1/face/recognize',
  RECOGNIZE_BATCH: '/v1/face/recognize-batch',
  HEALTH: '/v1/face/health',
  DELETE_PERSON: (personId: string) => `/v1/face/person/${personId}`,
} as const;
