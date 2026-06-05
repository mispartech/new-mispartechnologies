/**
 * Schools Staff API client.
 * Backend contract: docs/schools/frontend-integration-guide.md §4.3
 */

import { schoolsRequest, schoolsFetch, unwrapPaginated } from './schoolsClient';
import { SCHOOLS_API_ROUTES } from './schoolsApiRoutes';
import type { PersonAttendanceSummary } from './students';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'visiting';
export type StaffStatus = 'active' | 'on_leave' | 'suspended' | 'separated' | 'inactive';
export type EnrollmentStatus = 'enrolled' | 'pending' | 'not_enrolled';

export interface Staff {
  id: string;
  full_name: string;
  staff_no: string;
  role: string;
  department: string;
  employment_type: EmploymentType;
  status: StaffStatus;
  enrollment: EnrollmentStatus;
  email: string;
  phone: string;
  manager_name?: string;
  punctuality_pct_30d: number;
  attendance_pct_30d: number;
  late_count_30d: number;
  absent_days_30d: number;
  photo_url?: string;
}

const mapStaff = (raw: any): Staff => ({
  id: raw.id,
  full_name: raw.full_name || `${raw.first_name ?? ''} ${raw.last_name ?? ''}`.trim(),
  staff_no: raw.staff_no ?? raw.employee_no ?? '',
  role: raw.role ?? raw.title ?? '',
  department: raw.department_name ?? raw.department ?? '',
  employment_type: (raw.employment_type ?? 'full_time') as EmploymentType,
  status: (raw.status ?? 'active') as StaffStatus,
  enrollment: (raw.enrollment_status ?? 'not_enrolled') as EnrollmentStatus,
  email: raw.email ?? '',
  phone: raw.phone ?? '',
  manager_name: raw.manager_name,
  punctuality_pct_30d: Number(raw.punctuality_pct_30d ?? 0),
  attendance_pct_30d: Number(raw.attendance_pct_30d ?? 0),
  late_count_30d: Number(raw.late_count_30d ?? 0),
  absent_days_30d: Number(raw.absent_days_30d ?? 0),
  photo_url: raw.photo_url,
});

const mapSummary = (raw: any): PersonAttendanceSummary => ({
  attendance_pct_30d: Number(raw?.attendance_pct_30d ?? 0),
  attendance_pct_90d: Number(raw?.attendance_pct_90d ?? 0),
  on_time_rate: Number(raw?.on_time_rate ?? 0),
  late_count_30d: Number(raw?.late_count_30d ?? 0),
  absent_days_30d: Number(raw?.absent_days_30d ?? 0),
  trend_30d: Array.isArray(raw?.trend_30d) ? raw.trend_30d : [],
  recent: Array.isArray(raw?.recent) ? raw.recent : [],
});

export interface StaffListParams {
  q?: string;
  department?: string;
  role?: string;
  employment_type?: EmploymentType;
  page?: number;
  page_size?: number;
}

export const staffApi = {
  async list(params: StaffListParams = {}): Promise<Staff[]> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
    const res = await schoolsRequest<any>(`${SCHOOLS_API_ROUTES.STAFF}${q.toString() ? `?${q}` : ''}`);
    if (res.error) throw new Error(res.error);
    return unwrapPaginated<any>(res.data).items.map(mapStaff);
  },
  async get(id: string): Promise<Staff> {
    return mapStaff(await schoolsFetch<any>(SCHOOLS_API_ROUTES.STAFF_DETAIL(id)));
  },
  async create(body: Partial<Staff>): Promise<Staff> {
    return mapStaff(await schoolsFetch<any>(SCHOOLS_API_ROUTES.STAFF, {
      method: 'POST', body: JSON.stringify(body),
    }));
  },
  async update(id: string, patch: Partial<Staff>): Promise<Staff> {
    return mapStaff(await schoolsFetch<any>(SCHOOLS_API_ROUTES.STAFF_DETAIL(id), {
      method: 'PATCH', body: JSON.stringify(patch),
    }));
  },
  async attendance(id: string): Promise<PersonAttendanceSummary> {
    return mapSummary(await schoolsFetch<any>(SCHOOLS_API_ROUTES.STAFF_ATTENDANCE(id)));
  },
  notifyManager: (id: string) =>
    schoolsFetch<{ ok: boolean }>(SCHOOLS_API_ROUTES.STAFF_NOTIFY_MANAGER(id), { method: 'POST' }),
  async import(file: File): Promise<{ ok: boolean }> {
    const form = new FormData();
    form.append('file', file);
    return schoolsFetch<any>(SCHOOLS_API_ROUTES.STAFF_IMPORT, {
      method: 'POST',
      body: form as unknown as BodyInit,
      headers: {},
    });
  },
};
