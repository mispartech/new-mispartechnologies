/**
 * Django API Client
 *
 * Central API service layer. ALL business-data CRUD goes through here.
 * Supabase is used ONLY for auth, storage, and realtime.
 *
 * Django verifies Supabase JWTs — no Django-issued tokens.
 *
 * ⚠️  Methods for endpoints not yet implemented on the backend are marked
 *     as stubs — they return a synthetic 404 without making a network call
 *     and log a developer-friendly warning.
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { API_ROUTES } from './apiRoutes';

const DJANGO_BASE_URL =
  import.meta.env.VITE_DJANGO_API_URL || 'https://api.mispartechnologies.com';

const IS_DEV = import.meta.env.DEV;

if (IS_DEV) console.log('[DjangoApi] Base URL:', DJANGO_BASE_URL);

// ────────────────────────── types ──────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/** Paginated envelope from Django REST Framework */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface RequestOptions extends RequestInit {
  silent?: boolean;
  timeout?: number;
}

// ────────────────────────── helpers ──────────────────────────

/** Returns a synthetic 404 response for endpoints not yet implemented */
function notImplemented<T>(endpointName: string): ApiResponse<T> {
  console.warn(`[DjangoApi] Endpoint not implemented yet: ${endpointName}`);
  return { status: 404, error: 'Feature not available yet. Backend endpoint pending.' };
}

/**
 * Unwrap a paginated envelope into a plain array.
 * If the response is already an array, return it as-is.
 */
function unwrapPaginated<T>(data: any): { items: T[]; count: number; next: string | null; previous: string | null } {
  if (Array.isArray(data)) {
    return { items: data as T[], count: data.length, next: null, previous: null };
  }
  if (data && typeof data === 'object' && 'results' in data) {
    return {
      items: Array.isArray(data.results) ? data.results : [],
      count: data.count ?? 0,
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }
  // Fallback — wrap single object or return empty
  return { items: data ? [data] : [], count: data ? 1 : 0, next: null, previous: null };
}

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
    return null;
  }
  if (status >= 500) {
    return { title: 'Server Error', description: 'Server error. Please try again later.' };
  }
  if (status === 0) {
    return null;
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
    const { silent, timeout, ...fetchOptions } = options;
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
      const timeoutId = setTimeout(() => controller.abort(), timeout ?? 15000);

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
          const isHtml = text.trimStart().startsWith('<') || text.includes('<!DOCTYPE');
          const error = isHtml
            ? 'Something went wrong. Please try again later.'
            : (text.slice(0, 200) || 'Request failed');
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
        console.warn(`[DjangoApi] ${endpoint}:`, isTimeout ? 'TIMEOUT' : message);
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
      console.warn(`[DjangoApi] ${status} ${endpoint}:`, message);
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
    data: Partial<{
      first_name: string;
      last_name: string;
      phone_number: string;
      gender: string;
      face_image_url: string;
      notification_preferences: any;
    }>,
  ): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.PROFILE_UPDATE, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ MEMBERS ═══════════════════════════

  /**
   * GET /api/members/ — returns paginated envelope { count, results, next, previous }
   * This method unwraps it to return a plain array in data for backward compat.
   */
  async getMembers(params?: {
    role?: string;
    order_by?: string;
    limit?: number;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<any[]> & { count?: number; next?: string | null; previous?: string | null }> {
    const query = params
      ? '?' + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]),
          ),
        ).toString()
      : '';
    const result = await this.request<any>(`${API_ROUTES.MEMBERS}${query}`);
    if (result.error) return result as any;

    const { items, count, next, previous } = unwrapPaginated(result.data);
    return { data: items, status: result.status, count, next, previous };
  }

  /**
   * POST /api/members/ — create a new member (REST: POST to collection)
   */
  async createMember(data: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    gender?: string;
    department_id?: string;
    role?: string;
    job_title?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.MEMBERS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMember(id: string): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.MEMBER(id));
  }

  async updateMember(id: string, data: Partial<any>): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.MEMBER(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteMember(id: string): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.MEMBER(id), {
      method: 'DELETE',
    });
  }

  /**
   * POST /api/members/ — invite a member (backend sends email atomically)
   */
  async inviteMember(data: any): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.MEMBERS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkInviteMembers(data: any): Promise<ApiResponse<any>> {
    return notImplemented('/api/members/bulk-invite/');
  }

  // ═══════════════════════════ DEPARTMENTS ═══════════════════════════

  async getDepartments(): Promise<ApiResponse<any[]>> {
    const result = await this.request<any>(API_ROUTES.DEPARTMENTS);
    if (result.error) return result as any;
    const { items } = unwrapPaginated(result.data);
    return { data: items, status: result.status };
  }

  async getDepartment(id: string): Promise<ApiResponse<any>> {
    return notImplemented(`/api/departments/${id}/`);
  }

  async createDepartment(data: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.DEPARTMENTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(id: string, data: Partial<{ name: string; description: string }>): Promise<ApiResponse<any>> {
    return notImplemented(`/api/departments/${id}/ PATCH`);
  }

  async deleteDepartment(id: string): Promise<ApiResponse<void>> {
    return notImplemented(`/api/departments/${id}/ DELETE`);
  }

  // ═══════════════════════════ ATTENDANCE ═══════════════════════════

  /**
   * GET /api/attendance/ — returns paginated envelope
   * Unwrapped to plain array for backward compat.
   */
  async getAttendance(params?: {
    user_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    page?: number;
    page_size?: number;
  }, options?: { silent?: boolean }): Promise<ApiResponse<any[]> & { count?: number; next?: string | null; previous?: string | null }> {
    const query = params
      ? '?' +
        new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]),
          ),
        ).toString()
      : '';
    const result = await this.request<any>(`${API_ROUTES.ATTENDANCE}${query}`, { silent: options?.silent });
    if (result.error) return result as any;

    const { items, count, next, previous } = unwrapPaginated(result.data);
    return { data: items, status: result.status, count, next, previous };
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

  // ═══════════════════════════ TEMP ATTENDANCE ═══════════════════════════

  async getTempAttendance(params?: {
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<any[]>> {
    const query = params
      ? '?' + new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]),
          ),
        ).toString()
      : '';
    const result = await this.request<any>(`${API_ROUTES.TEMP_ATTENDANCE}${query}`);
    if (result.error) return result as any;
    const { items } = unwrapPaginated(result.data);
    return { data: items, status: result.status };
  }

  async claimVisitor(data: {
    temp_face_id?: string;
    temp_attendance_id?: string;
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    phone_number?: string;
    gender?: string;
    department_id?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.TEMP_ATTENDANCE_CLAIM, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ TEMP ATTENDANCE CLUSTERS ═══════════════════════════

  async getTempAttendanceClusters(): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.TEMP_ATTENDANCE_CLUSTERS);
  }

  async mergeTempAttendanceClusters(data: {
    primary_id: string;
    merge_ids: string[];
  }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.TEMP_ATTENDANCE_CLUSTERS_MERGE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ ORGANIZATION SETTINGS ═══════════════════════════

  async getOrgSettings(options?: { silent?: boolean }): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.ORG_SETTINGS, { silent: options?.silent });
  }

  async updateOrgSettings(_orgId: string, data: Partial<any>): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.ORG_SETTINGS, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ═══════════════════════════ NOTIFICATIONS — STUB ═══════════════════════════

  async getNotifications(_params?: any): Promise<ApiResponse<any[]>> {
    return notImplemented('/api/notifications/');
  }

  async markNotificationRead(_id: string): Promise<ApiResponse<void>> {
    return notImplemented('/api/notifications/read/');
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    return notImplemented('/api/notifications/read-all/');
  }

  async deleteNotification(_id: string): Promise<ApiResponse<void>> {
    return notImplemented('/api/notifications/delete/');
  }

  // ═══════════════════════════ ADMIN USERS — STUB ═══════════════════════════

  async getAdminUsers(): Promise<ApiResponse<any[]>> {
    return notImplemented('/api/user-roles/admins/');
  }

  // ═══════════════════════════ ADMIN INVITES — STUB ═══════════════════════════

  async getAdminInvites(): Promise<ApiResponse<any[]>> {
    return notImplemented('/api/admin-invites/');
  }

  /**
   * POST /api/admin-invites/ — single call; backend sends email atomically
   */
  async createAdminInvite(_data: any): Promise<ApiResponse<any>> {
    return notImplemented('/api/admin-invites/ POST');
  }

  // ═══════════════════════════ INVITES (MEMBER) ═══════════════════════════

  async getInvite(token: string): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.ACCEPT_INVITE(token));
  }

  async acceptInvite(token: string): Promise<ApiResponse<void>> {
    return this.request(API_ROUTES.ACCEPT_INVITE(token), {
      method: 'POST',
      body: JSON.stringify({ status: 'accepted' }),
    });
  }

  // ═══════════════════════════ FACE ═══════════════════════════

  async getFaceEnrollmentStatus(options?: { silent?: boolean }): Promise<ApiResponse<{ enrolled: boolean }>> {
    return this.request(API_ROUTES.FACE_ENROLLMENT_STATUS, { silent: options?.silent });
  }

  async enrollFace(imageBlob: Blob): Promise<ApiResponse<any>> {
    const token = await this.getAccessToken();
    const formData = new FormData();
    formData.append('image', imageBlob, 'enrollment.jpg');

    const url = `${DJANGO_BASE_URL}${API_ROUTES.FACE_ENROLL}`;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!response.ok) {
        const error = data?.detail || data?.error || data?.message || 'Enrollment failed';
        this.notifyError(response.status, error, API_ROUTES.FACE_ENROLL, false, data);
        return { status: response.status, error };
      }

      return { data, status: response.status };
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === 'AbortError';
      const message = isTimeout ? 'Upload timed out. Please try again.' : 'Network error during enrollment.';
      if (!isTimeout) console.warn('[DjangoApi] enrollFace error:', err);
      toast({ variant: 'destructive', title: isTimeout ? 'Upload Timeout' : 'Connection Error', description: message });
      return { status: 0, error: message };
    }
  }

  async recognizeFace(
    imageDataUrl: string,
    organizationId?: string,
    options?: { silent?: boolean; timeout?: number },
  ): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.FACE_RECOGNIZE, {
      method: 'POST',
      body: JSON.stringify({
        frame: imageDataUrl,
        mode: 'RECOGNIZE',
      }),
      silent: options?.silent,
      timeout: options?.timeout,
    });
  }

  // ═══════════════════════════ REPORTS — STUB ═══════════════════════════

  async getReportData(_params: any): Promise<ApiResponse<any>> {
    return notImplemented('/api/reports/attendance/');
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

  // ═══════════════════════════ SCHEDULES — STUB ═══════════════════════════

  async getSchedules(): Promise<ApiResponse<any[]>> {
    return notImplemented('/api/schedules/');
  }

  async createSchedule(_data: any): Promise<ApiResponse<any>> {
    return notImplemented('/api/schedules/ POST');
  }

  async updateSchedule(_id: string, _data: any): Promise<ApiResponse<any>> {
    return notImplemented('/api/schedules/ PATCH');
  }

  async deleteSchedule(_id: string): Promise<ApiResponse<void>> {
    return notImplemented('/api/schedules/ DELETE');
  }

  async bulkUpdateSchedules(_updates: any): Promise<ApiResponse<void>> {
    return notImplemented('/api/schedules/bulk-update/');
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
