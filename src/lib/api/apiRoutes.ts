/**
 * Centralized API Route Map
 *
 * ALL Django API endpoints used by the frontend are defined here.
 * No hardcoded URL paths should exist anywhere else in the codebase.
 *
 * This file serves as the contract between frontend and backend.
 */

// ── Profile ──
export const API_ROUTES = {
  PROFILE: '/api/profile/',
  PROFILE_UPDATE: (userId: string) => `/api/profile/${userId}/`,

  // ── Members ──
  MEMBERS: '/api/members/',
  MEMBERS_CREATE: '/api/members/create/',
  MEMBER: (id: string) => `/api/members/${id}/`,
  MEMBER_INVITE: '/api/members/invite/',
  MEMBER_BULK_INVITE: '/api/members/bulk-invite/',
  MEMBER_SEND_INVITE_EMAIL: '/api/members/send-invite-email/',

  // ── Departments ──
  DEPARTMENTS: '/api/departments/',
  DEPARTMENT: (id: string) => `/api/departments/${id}/`,

  // ── Attendance ──
  ATTENDANCE: '/api/attendance/',
  ATTENDANCE_MARK: '/api/attendance/mark/',

  // ── Temp Attendance (Visitors) ──
  TEMP_ATTENDANCE: '/api/temp-attendance/',
  TEMP_ATTENDANCE_CLAIM: '/api/temp-attendance/claim/',

  // ── Organizations ──
  ORGANIZATION: (id: string) => `/api/organizations/${id}/`,

  // ── Notifications ──
  NOTIFICATIONS: '/api/notifications/',
  NOTIFICATION_READ: (id: string) => `/api/notifications/${id}/read/`,
  NOTIFICATIONS_READ_ALL: '/api/notifications/read-all/',
  NOTIFICATION_DELETE: (id: string) => `/api/notifications/${id}/`,

  // ── Activity Logs ──
  ACTIVITY_LOGS: '/api/activity-logs/',

  // ── Admin Users ──
  ADMIN_USERS: '/api/user-roles/admins/',

  // ── Admin Invites ──
  ADMIN_INVITES: '/api/admin-invites/',
  ADMIN_INVITE_SEND_EMAIL: '/api/admin-invites/send-email/',

  // ── Member Invites ──
  INVITE: (token: string) => `/api/invites/${token}/`,
  INVITE_ACCEPT: (id: string) => `/api/invites/${id}/accept/`,

  // ── Face Recognition ──
  FACE_ENROLL: '/api/face/enroll/',
  FACE_ENROLLMENT_STATUS: '/api/face-enrollment-status/',
  FACE_RECOGNIZE: '/api/recognize-frame/',

  // ── Dashboard Stats ──
  DASHBOARD_STATS: '/api/dashboard/stats/',
  MEMBER_DASHBOARD_STATS: '/api/dashboard/member-stats/',

  // ── Reports ──
  REPORTS_ATTENDANCE: '/api/reports/attendance/',

  // ── Onboarding ──
  ONBOARDING: '/api/onboarding/',

  // ── Schedules ──
  SCHEDULES: '/api/schedules/',
  SCHEDULE: (id: string) => `/api/schedules/${id}/`,
  SCHEDULES_BULK_UPDATE: '/api/schedules/bulk-update/',

  // ── Auth ──
  PASSWORD_CHANGE: '/api/auth/password/change/',

  // ── Health ──
  HEALTH: '/api/health/',
} as const;
