/**
 * Django API Client
 *
 * Central API service layer. ALL business-data CRUD goes through here.
 * Supabase is used ONLY for auth, storage, and realtime.
 *
 * Django verifies Supabase JWTs — no Django-issued tokens.
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { API_ROUTES } from './apiRoutes';

const DJANGO_BASE_URL =
  import.meta.env.VITE_DJANGO_API_URL || 'https://api.mispartechnologies.com';

const IS_DEV = import.meta.env.DEV;

// Log the API URL on startup for debugging
if (IS_DEV) console.log('[DjangoApi] Base URL:', DJANGO_BASE_URL);

// ────────────────────────── types ──────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/** Options for individual requests */
interface RequestOptions extends RequestInit {
  /** If true, skip automatic toast notifications on error */
  silent?: boolean;
}

// ────────────────────────── error notifications ──────────────────────────

function getErrorNotification(status: number, serverMessage?: string): { title: string; description: string } | null {
  if (status === 400) {
    return { title: 'Validation Error', description: serverMessage || 'Please check your input and try again.' };
  }
  if (status === 401) {
    return { title: 'Session Expired', description: 'Please login again.' };
  }
  if (status === 403) {
    return { title: 'Access Denied', description: 'You do not have permission to perform this action.' };
  }
  if (status === 404) {
    return { title: 'Not Found', description: 'Requested resource not found.' };
  }
  if (status >= 500) {
    return { title: 'Server Error', description: 'Server error. Please try again later.' };
  }
  if (status === 0) {
    return null; // handled separately
  }
  return { title: 'Request Failed', description: serverMessage || 'An unexpected error occurred.' };
}

async function handleAutoLogout() {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    Object.keys(localStorage)
      .filter(k => k.startsWith('sb-'))
      .forEach(k => localStorage.removeItem(k));
  }
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
    window.location.href = '/auth';
  }
}

// ────────────────────────── client ──────────────────────────

class DjangoApiClient {
  private async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const { silent, ...fetchOptions } = options;
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${DJANGO_BASE_URL}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...headers,
          ...((fetchOptions.headers as Record<string, string>) || {}),
        },
      });
      clearTimeout(timeoutId);

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        if (!response.ok) {
          const error = text || 'Request failed';
          this.notifyError(response.status, error, endpoint, silent);
          return { status: response.status, error };
        }
        return { data: text as unknown as T, status: response.status };
      }

      if (!response.ok) {
        const error = data?.detail || data?.error || data?.message || 'Request failed';
        this.notifyError(response.status, error, endpoint, silent, data);
        return { status: response.status, error };
      }

      return { data: data as T, status: response.status };
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError';
      const message = isTimeout
        ? 'Request timed out. Please check your connection and try again.'
        : err instanceof Error ? err.message : 'Network error';

      if (IS_DEV) {
        console.error(`[DjangoApi] ${endpoint}:`, { error: err, timeout: isTimeout });
      }

      if (!silent) {
        toast({
          variant: 'destructive',
          title: isTimeout ? 'Request Timeout' : 'Connection Error',
          description: isTimeout ? message : 'Unable to connect to server. Please check your internet connection.',
        });
      }

      return { status: 0, error: message };
    }
  }

  private notifyError(status: number, message: string, endpoint: string, silent?: boolean, details?: any) {
    if (IS_DEV) {
      console.error(`[DjangoApi] ${status} ${endpoint}:`, { message, details });
    }

    if (!silent) {
      const notification = getErrorNotification(status, message);
      if (notification) {
        toast({ variant: 'destructive', title: notification.title, description: notification.description });
      }
    }

    if (status === 401) {
      handleAutoLogout();
    }
  }

  // ═══════════════════════════ PROFILE ═══════════════════════════

  async getProfile(options?: { silent?: boolean }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.PROFILE, { silent: options?.silent });
  }

  async updateProfile(
    userId: string,
    data: Partial<{
      first_name: string;
      last_name: string;
      phone_number: string;
      gender: string;
      face_image_url: string;
      notification_preferences: any;
    }>,
  ): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.PROFILE_UPDATE(userId), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ MEMBERS ═══════════════════════════

  async getMembers(params?: {
    organization_id?: string;
    role?: string;
    order_by?: string;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return this.request(`${API_ROUTES.MEMBERS}${query}`);
  }

  async getMember(id: string): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.MEMBER(id));
  }

  async createMember(data: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    gender?: string;
    department_id?: string;
    organization_id: string;
  }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.MEMBERS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMember(
    id: string,
    data: Partial<{
      first_name: string;
      last_name: string;
      phone_number: string;
      gender: string;
      department_id: string;
      face_image_url: string;
      organization_id: string;
    }>,
  ): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.MEMBER(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMember(id: string): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.MEMBER(id), { method: 'DELETE' });
  }

  async inviteMember(data: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    gender?: string;
    department_id?: string;
    organization_id: string;
  }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.MEMBER_INVITE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkInviteMembers(data: {
    members: Array<{
      email: string;
      first_name?: string;
      last_name?: string;
      phone_number?: string;
      gender?: string;
      department_id?: string;
    }>;
    organization_id: string;
  }): Promise<ApiResponse<{ success: number; failed: number }>> {
    return this.request(API_ROUTES.MEMBER_BULK_INVITE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ DEPARTMENTS ═══════════════════════════

  async getDepartments(organizationId?: string): Promise<ApiResponse<any[]>> {
    const query = organizationId ? `?organization_id=${organizationId}` : '';
    return this.request(`${API_ROUTES.DEPARTMENTS}${query}`);
  }

  async getDepartment(id: string): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.DEPARTMENT(id));
  }

  async createDepartment(data: {
    name: string;
    description?: string;
    organization_id: string;
  }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.DEPARTMENTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(
    id: string,
    data: Partial<{ name: string; description: string }>,
  ): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.DEPARTMENT(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(id: string): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.DEPARTMENT(id), { method: 'DELETE' });
  }

  // ═══════════════════════════ ATTENDANCE ═══════════════════════════

  async getAttendance(params?: {
    user_id?: string;
    organization_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    include_profiles?: string;
  }): Promise<ApiResponse<any[]>> {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined),
          ) as Record<string, string>,
        ).toString()
      : '';
    return this.request(`${API_ROUTES.ATTENDANCE}${query}`);
  }

  async markAttendance(data: {
    user_id: string;
    confidence_score?: number;
    face_roi_url?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.ATTENDANCE_MARK, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ TEMP ATTENDANCE (VISITORS) ═══════════════════════════

  async getTempAttendance(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<any[]>> {
    const query = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return this.request(`${API_ROUTES.TEMP_ATTENDANCE}${query}`);
  }

  async claimVisitor(data: {
    temp_attendance_id: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    gender?: string;
    department_id?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.TEMP_ATTENDANCE_CLAIM, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ ORGANIZATIONS ═══════════════════════════

  async getOrganization(id: string): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.ORGANIZATION(id));
  }

  async updateOrganization(
    id: string,
    data: Partial<any>,
  ): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.ORGANIZATION(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ NOTIFICATIONS ═══════════════════════════

  async getNotifications(params?: {
    user_id?: string;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined),
          ) as Record<string, string>,
        ).toString()
      : '';
    return this.request(`${API_ROUTES.NOTIFICATIONS}${query}`);
  }

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.NOTIFICATION_READ(id), { method: 'PATCH' });
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.NOTIFICATIONS_READ_ALL, { method: 'PATCH' });
  }

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.NOTIFICATION_DELETE(id), { method: 'DELETE' });
  }

  // ═══════════════════════════ ACTIVITY LOGS ═══════════════════════════

  async getActivityLogs(params?: {
    limit?: number;
    entity_type?: string;
  }): Promise<ApiResponse<any[]>> {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined),
          ) as Record<string, string>,
        ).toString()
      : '';
    return this.request(`${API_ROUTES.ACTIVITY_LOGS}${query}`);
  }

  async createActivityLog(data: {
    action: string;
    entity_type: string;
    entity_id?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.ACTIVITY_LOGS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ USER ROLES ═══════════════════════════

  async getUserRole(): Promise<ApiResponse<{ role: string }>> {
    return this.request(API_ROUTES.USER_ROLE);
  }

  async getAdminUsers(): Promise<ApiResponse<any[]>> {
    return this.request(API_ROUTES.ADMIN_USERS);
  }

  // ═══════════════════════════ ADMIN INVITES ═══════════════════════════

  async getAdminInvites(): Promise<ApiResponse<any[]>> {
    return this.request(API_ROUTES.ADMIN_INVITES);
  }

  async createAdminInvite(data: {
    email: string;
    invited_role: string;
    organization_id?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.ADMIN_INVITES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ INVITES (MEMBER) ═══════════════════════════

  async getInvite(token: string): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.INVITE(token));
  }

  async acceptInvite(inviteId: string): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.INVITE_ACCEPT(inviteId), {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' }),
    });
  }

  // ═══════════════════════════ FACE ═══════════════════════════

  async checkFaceEnrollmentStatus(
    userId: string,
  ): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.FACE_ENROLLMENT_STATUS(userId));
  }

  async enrollFace(
    userId: string,
    imageBase64: string,
    userName?: string,
  ): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.FACE_ENROLL, {
      method: 'POST',
      body: JSON.stringify({
        image: imageBase64,
        user_id: userId,
        name: userName,
      }),
    });
  }

  async recognizeFace(
    imageBase64: string,
    organizationId?: string,
  ): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.FACE_RECOGNIZE, {
      method: 'POST',
      body: JSON.stringify({
        frame: imageBase64,
        mode: 'RECOGNIZE',
        organization_id: organizationId,
      }),
    });
  }

  // ═══════════════════════════ DASHBOARD STATS ═══════════════════════════

  async getDashboardStats(): Promise<ApiResponse<{
    total_members: number;
    total_admins: number;
    total_departments: number;
    attended_today: number;
    recent_attendance: any[];
    recent_members: any[];
  }>> {
    return this.request(API_ROUTES.DASHBOARD_STATS);
  }

  async getMemberDashboardStats(userId: string): Promise<ApiResponse<{
    total_attendance: number;
    this_month: number;
    this_week: number;
    attended_today: boolean;
    recent_attendance: any[];
  }>> {
    return this.request(API_ROUTES.MEMBER_DASHBOARD_STATS(userId));
  }

  // ═══════════════════════════ REPORTS ═══════════════════════════

  async getReportData(params: {
    period: string;
    organization_id?: string;
  }): Promise<ApiResponse<any>> {
    const query =
      '?' +
      new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`${API_ROUTES.REPORTS_ATTENDANCE}${query}`);
  }

  // ═══════════════════════════ ONBOARDING ═══════════════════════════

  async getOnboardingSession(): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.ONBOARDING);
  }

  async saveOnboardingSession(
    payload: { step: number; data: Record<string, unknown> },
  ): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.ONBOARDING, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // ═══════════════════════════ SCHEDULES ═══════════════════════════

  async getSchedules(organizationId: string): Promise<ApiResponse<any[]>> {
    return this.request(
      `${API_ROUTES.SCHEDULES}?organization_id=${organizationId}`,
    );
  }

  async createSchedule(data: any): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.SCHEDULES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSchedule(
    id: string,
    data: Partial<any>,
  ): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.SCHEDULE(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteSchedule(id: string): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.SCHEDULE(id), { method: 'DELETE' });
  }

  async bulkUpdateSchedules(
    updates: Array<{ id: string; [key: string]: any }>,
  ): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.SCHEDULES_BULK_UPDATE, {
      method: 'PATCH',
      body: JSON.stringify({ schedules: updates }),
    });
  }

  // ═══════════════════════════ SEND INVITE EMAILS ═══════════════════════════

  async sendAdminInviteEmail(data: {
    invite_id: string;
    email: string;
    role: string;
    token: string;
    organization_name: string;
  }): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.ADMIN_INVITE_SEND_EMAIL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendMemberInviteEmail(data: {
    invite_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    token: string;
    organization_name?: string;
  }): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.MEMBER_SEND_INVITE_EMAIL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ PASSWORD ═══════════════════════════

  async updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.PASSWORD_CHANGE, {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  // ═══════════════════════════ HEALTH CHECK ═══════════════════════════

  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.HEALTH);
  }
}

// Export singleton instance
export const djangoApi = new DjangoApiClient();

// Export class for testing
export { DjangoApiClient };
