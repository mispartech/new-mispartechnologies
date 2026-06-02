/**
 * School Admin Console API (per-tenant operations)
 * Used by /schools/dashboard/admin.
 */

import { schoolsRequest, unwrapPaginated, type ApiResponse } from './schoolsClient';
import { SCHOOLS_API_ROUTES } from './schoolsApiRoutes';

export interface CapturePoint {
  id: string;
  label: string;
  mode: 'gate' | 'classroom' | 'event' | 'kiosk' | 'mobile';
  online: boolean;
  last_event_at: string | null;
  recognized_today: number;
  unique_faces: number;
  location?: string;
}

export interface AttendanceExportRequest {
  scope: 'staff' | 'students' | 'all';
  start_date: string;
  end_date: string;
  format?: 'csv' | 'xlsx';
}

export interface AttendanceExportResponse {
  download_url: string;
  expires_at: string;
}

export const schoolsAdminApi = {
  async capturePoints(): Promise<ApiResponse<CapturePoint[]>> {
    const r = await schoolsRequest<any>(SCHOOLS_API_ROUTES.CAPTURE_POINTS, { silent: true });
    if (r.error) return r as any;
    const { items } = unwrapPaginated<CapturePoint>(r.data);
    return { data: items, status: r.status };
  },
  exportAttendance(payload: AttendanceExportRequest): Promise<ApiResponse<AttendanceExportResponse>> {
    return schoolsRequest(SCHOOLS_API_ROUTES.ATTENDANCE_EXPORT, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getSettings(): Promise<ApiResponse<any>> {
    return schoolsRequest(SCHOOLS_API_ROUTES.SETTINGS, { silent: true });
  },
  updateSettings(patch: Record<string, any>): Promise<ApiResponse<any>> {
    return schoolsRequest(SCHOOLS_API_ROUTES.SETTINGS, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },
};
