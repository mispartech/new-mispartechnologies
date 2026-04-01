/**
 * Centralized API Route Map
 *
 * ALL Django API endpoints used by the frontend are defined here.
 * No hardcoded URL paths should exist anywhere else in the codebase.
 *
 * This file serves as the contract between frontend and backend.
 *
 * ⚠️  Only endpoints that exist on the backend are listed here.
 *     See FUTURE_ROUTES for planned but not-yet-implemented endpoints.
 */

export const API_ROUTES = {
  // ── Profile ──
  PROFILE: '/api/profile/',
  PROFILE_UPDATE: '/api/profile/',

  // ── Members ──
  MEMBERS: '/api/members/',
  MEMBER: (id: string) => `/api/members/${id}/`,

  // ── Departments ──
  DEPARTMENTS: '/api/departments/',

  // ── Attendance ──
  ATTENDANCE: '/api/attendance/',
  ATTENDANCE_MARK: '/api/attendance/mark/',

  // ── Temp Attendance ──
  TEMP_ATTENDANCE: '/api/temp-attendance/',
  TEMP_ATTENDANCE_CLAIM: '/api/temp-attendance/claim/',
  TEMP_ATTENDANCE_CLUSTERS: '/api/temp-attendance/clusters/',
  TEMP_ATTENDANCE_CLUSTERS_MERGE: '/api/temp-attendance/clusters/merge/',

  // ── Face Recognition ──
  FACE_ENROLL: '/api/face/enroll/',
  FACE_ENROLLMENT_STATUS: '/api/face-enrollment-status/',
  FACE_RECOGNIZE: '/api/recognize-frame/',

  // ── Organization Settings ──
  ORG_SETTINGS: '/api/organization-settings/',

  // ── Onboarding ──
  ONBOARDING: '/api/onboarding/',

  // ── Health ──
  HEALTH: '/api/health/',

  // ── Version ──
  VERSION: '/api/version/',

  // ── Accept Invite ──
  ACCEPT_INVITE: (token: string) => `/api/accept-invite/${token}/`,

  // ── Public Organization / Self-Registration ──
  ORG_PUBLIC_INFO: (slug: string) => `/api/organizations/${slug}/public/`,
  SELF_REGISTER: '/api/self-register/',
} as const;

/**
 * Endpoints planned but NOT yet implemented on the backend.
 * Kept here for reference so the frontend knows what's coming.
 */
export const FUTURE_ROUTES = {
  MEMBER_INVITE: '/api/members/invite/',
  MEMBER_BULK_INVITE: '/api/members/bulk-invite/',
  DEPARTMENT: (id: string) => `/api/departments/${id}/`,
  NOTIFICATIONS: '/api/notifications/',
  NOTIFICATION_READ: (id: string) => `/api/notifications/${id}/read/`,
  NOTIFICATIONS_READ_ALL: '/api/notifications/read-all/',
  NOTIFICATION_DELETE: (id: string) => `/api/notifications/${id}/`,
  ADMIN_USERS: '/api/user-roles/admins/',
  ADMIN_INVITES: '/api/admin-invites/',
  SCHEDULES: '/api/schedules/',
  SCHEDULE: (id: string) => `/api/schedules/${id}/`,
  SCHEDULES_BULK_UPDATE: '/api/schedules/bulk-update/',
  REPORTS_ATTENDANCE: '/api/reports/attendance/',
} as const;
