/**
 * Django API Client
 *
 * Central API service layer. ALL business-data CRUD goes through here.
 * Supabase is used ONLY for auth, storage, and realtime.
 *
 * Django verifies Supabase JWTs — no Django-issued tokens.
 */

import { supabase } from '@/integrations/supabase/client';

const DJANGO_BASE_URL =
  import.meta.env.VITE_DJANGO_API_URL || 'https://api.mispartechnologies.com';

// ────────────────────────── types ──────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// ────────────────────────── client ──────────────────────────

class DjangoApiClient {
  /* ── auth helper ── */

  private async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  /* ── generic fetch wrapper ── */

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${DJANGO_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...((options.headers as Record<string, string>) || {}),
        },
      });

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        if (!response.ok) {
          return { status: response.status, error: text || 'Request failed' };
        }
        return { data: text as unknown as T, status: response.status };
      }

      if (!response.ok) {
        return {
          status: response.status,
          error:
            data?.detail || data?.error || data?.message || 'Request failed',
        };
      }

      return { data: data as T, status: response.status };
    } catch (err) {
      console.error('API request failed:', err);
      return {
        status: 0,
        error: err instanceof Error ? err.message : 'Network error',
      };
    }
  }

  // ═══════════════════════════ PROFILE ═══════════════════════════

  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/api/profile/');
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
    return this.request(`/api/profile/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async syncFromSupabase(data: {
    supabase_uid: string;
    email: string;
    first_name?: string;
    last_name?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/auth/sync/', {
      method: 'POST',
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
    return this.request(`/api/members/${query}`);
  }

  async getMember(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/members/${id}/`);
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
    return this.request('/api/members/', {
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
    return this.request(`/api/members/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMember(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/members/${id}/`, { method: 'DELETE' });
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
    return this.request('/api/members/invite/', {
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
    return this.request('/api/members/bulk-invite/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ DEPARTMENTS ═══════════════════════════

  async getDepartments(organizationId?: string): Promise<ApiResponse<any[]>> {
    const query = organizationId
      ? `?organization_id=${organizationId}`
      : '';
    return this.request(`/api/departments/${query}`);
  }

  async getDepartment(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/departments/${id}/`);
  }

  async createDepartment(data: {
    name: string;
    description?: string;
    organization_id: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/departments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(
    id: string,
    data: Partial<{ name: string; description: string }>,
  ): Promise<ApiResponse<any>> {
    return this.request(`/api/departments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/departments/${id}/`, { method: 'DELETE' });
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
    return this.request(`/api/attendance/${query}`);
  }

  async markAttendance(data: {
    user_id: string;
    confidence_score?: number;
    face_roi_url?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/attendance/mark/', {
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
      ? '?' +
        new URLSearchParams(params as Record<string, string>).toString()
      : '';
    return this.request(`/api/temp-attendance/${query}`);
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
    return this.request('/api/temp-attendance/claim/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ ORGANIZATIONS ═══════════════════════════

  async getOrganization(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/organizations/${id}/`);
  }

  async createOrganization(data: {
    name: string;
    type: string;
    industry?: string;
    size_range?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/organizations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrganization(
    id: string,
    data: Partial<any>,
  ): Promise<ApiResponse<any>> {
    return this.request(`/api/organizations/${id}/`, {
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
    return this.request(`/api/notifications/${query}`);
  }

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/notifications/${id}/read/`, { method: 'PATCH' });
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    return this.request('/api/notifications/read-all/', { method: 'PATCH' });
  }

  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/notifications/${id}/`, { method: 'DELETE' });
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
    return this.request(`/api/activity-logs/${query}`);
  }

  async createActivityLog(data: {
    action: string;
    entity_type: string;
    entity_id?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/activity-logs/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ USER ROLES ═══════════════════════════

  async getUserRole(userId: string): Promise<ApiResponse<{ role: string }>> {
    return this.request(`/api/user-roles/${userId}/`);
  }

  async getAdminUsers(): Promise<ApiResponse<any[]>> {
    return this.request('/api/user-roles/admins/');
  }

  // ═══════════════════════════ ADMIN INVITES ═══════════════════════════

  async getAdminInvites(): Promise<ApiResponse<any[]>> {
    return this.request('/api/admin-invites/');
  }

  async createAdminInvite(data: {
    email: string;
    invited_role: string;
    organization_id?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/api/admin-invites/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ INVITES (MEMBER) ═══════════════════════════

  async getInvite(token: string): Promise<ApiResponse<any>> {
    return this.request(`/api/invites/${token}/`);
  }

  async acceptInvite(inviteId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/invites/${inviteId}/accept/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'accepted' }),
    });
  }

  // ═══════════════════════════ FACE ═══════════════════════════

  async checkFaceEnrollmentStatus(
    userId: string,
  ): Promise<ApiResponse<any>> {
    return this.request(`/api/face/enrollment-status/${userId}/`);
  }

  async enrollFace(
    userId: string,
    imageBase64: string,
    userName?: string,
  ): Promise<ApiResponse<any>> {
    return this.request('/api/face/enroll/', {
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
    return this.request('/api/recognize-frame/', {
      method: 'POST',
      body: JSON.stringify({
        frame: imageBase64,
        mode: 'RECOGNIZE',
        organization_id: organizationId,
      }),
    });
  }

  async uploadFaceImage(
    userId: string,
    imageBase64: string,
  ): Promise<ApiResponse<{ url: string }>> {
    return this.request('/api/face/upload/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, image: imageBase64 }),
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
    return this.request('/api/dashboard/stats/');
  }

  async getMemberDashboardStats(userId: string): Promise<ApiResponse<{
    total_attendance: number;
    this_month: number;
    this_week: number;
    attended_today: boolean;
    recent_attendance: any[];
  }>> {
    return this.request(`/api/dashboard/member-stats/${userId}/`);
  }

  // ═══════════════════════════ REPORTS ═══════════════════════════

  async getReportData(params: {
    period: string;
    organization_id?: string;
  }): Promise<ApiResponse<any>> {
    const query =
      '?' +
      new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/api/reports/attendance/${query}`);
  }

  // ═══════════════════════════ ONBOARDING ═══════════════════════════

  async getOnboardingSession(
    userId: string,
  ): Promise<ApiResponse<{ step: number; data: Record<string, unknown> }>> {
    return this.request(`/api/onboarding/${userId}/`);
  }

  async saveOnboardingSession(
    userId: string,
    payload: { step: number; data: Record<string, unknown> },
  ): Promise<ApiResponse<void>> {
    return this.request(`/api/onboarding/${userId}/`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteOnboardingSession(
    userId: string,
  ): Promise<ApiResponse<void>> {
    return this.request(`/api/onboarding/${userId}/`, { method: 'DELETE' });
  }

  // ═══════════════════════════ SCHEDULES ═══════════════════════════

  async getSchedules(organizationId: string): Promise<ApiResponse<any[]>> {
    return this.request(
      `/api/schedules/?organization_id=${organizationId}`,
    );
  }

  async createSchedule(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/schedules/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ PASSWORD ═══════════════════════════

  async updatePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    return this.request('/api/auth/password/change/', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  // ═══════════════════════════ HEALTH CHECK ═══════════════════════════

  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/api/health/');
  }
}

// Export singleton instance
export const djangoApi = new DjangoApiClient();

// Export class for testing
export { DjangoApiClient };
