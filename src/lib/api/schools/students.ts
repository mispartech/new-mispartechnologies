/**
 * Schools Students API client.
 * Backend contract: docs/schools/frontend-integration-guide.md §4.2
 *
 * The frontend type keeps its richer field names (full_name, class, level,
 * attendance_pct_30d, risk, …). We map from the backend payload so existing
 * pages don't need to be rewritten field-by-field.
 */

import { schoolsRequest, schoolsFetch, unwrapPaginated } from './schoolsClient';
import { SCHOOLS_API_ROUTES } from './schoolsApiRoutes';

export type EnrollmentStatus = 'enrolled' | 'pending' | 'not_enrolled';
export type StudentStatus = 'active' | 'suspended' | 'graduated' | 'withdrawn' | 'inactive';

export interface Student {
  id: string;
  full_name: string;
  admission_no: string;
  class: string;
  level: string;
  gender: 'M' | 'F' | string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email?: string;
  status: StudentStatus;
  enrollment: EnrollmentStatus;
  avatar_seed?: string;
  attendance_pct_30d: number;
  late_count_30d: number;
  absent_days_30d: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  photo_url?: string;
}

export interface PersonAttendanceDay {
  date: string;
  state: 'on_time' | 'late' | 'very_late' | 'absent' | 'excused' | 'present';
  first_seen?: string;
  last_seen?: string;
  mode?: 'gate' | 'classroom' | 'event' | 'mobile' | 'kiosk';
  location?: string;
  confidence?: number;
}

export interface PersonAttendanceSummary {
  attendance_pct_30d: number;
  attendance_pct_90d: number;
  on_time_rate: number;
  late_count_30d: number;
  absent_days_30d: number;
  trend_30d: { date: string; rate: number }[];
  recent: PersonAttendanceDay[];
}

const mapStudent = (raw: any): Student => ({
  id: raw.id,
  full_name: raw.full_name || `${raw.first_name ?? ''} ${raw.last_name ?? ''}`.trim(),
  admission_no: raw.admission_no ?? '',
  class: raw.class_name ?? raw.class ?? '',
  level: raw.class_level ?? raw.level ?? '',
  gender: raw.gender ?? '',
  guardian_name: raw.guardian_name ?? '',
  guardian_phone: raw.guardian_phone ?? '',
  guardian_email: raw.guardian_email,
  status: raw.status ?? 'active',
  enrollment: (raw.enrollment_status as EnrollmentStatus) ?? 'not_enrolled',
  attendance_pct_30d: Number(raw.attendance_pct_30d ?? 0),
  late_count_30d: Number(raw.late_count_30d ?? 0),
  absent_days_30d: Number(raw.absent_days_30d ?? 0),
  risk: (raw.risk_level || raw.risk || 'low') as Student['risk'],
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

export interface StudentListParams {
  q?: string;
  class?: string;
  level?: string;
  enrollment?: EnrollmentStatus;
  risk?: Student['risk'];
  page?: number;
  page_size?: number;
}

export const studentsApi = {
  async list(params: StudentListParams = {}): Promise<Student[]> {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
    const res = await schoolsRequest<any>(`${SCHOOLS_API_ROUTES.STUDENTS}${q.toString() ? `?${q}` : ''}`);
    if (res.error) throw new Error(res.error);
    return unwrapPaginated<any>(res.data).items.map(mapStudent);
  },
  async get(id: string): Promise<Student> {
    return mapStudent(await schoolsFetch<any>(SCHOOLS_API_ROUTES.STUDENT(id)));
  },
  async create(body: Partial<Student>): Promise<Student> {
    return mapStudent(await schoolsFetch<any>(SCHOOLS_API_ROUTES.STUDENTS, {
      method: 'POST',
      body: JSON.stringify(body),
    }));
  },
  async update(id: string, patch: Partial<Student>): Promise<Student> {
    return mapStudent(await schoolsFetch<any>(SCHOOLS_API_ROUTES.STUDENT(id), {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }));
  },
  async attendance(id: string): Promise<PersonAttendanceSummary> {
    return mapSummary(await schoolsFetch<any>(SCHOOLS_API_ROUTES.STUDENT_ATTENDANCE(id)));
  },
  notifyGuardian: (id: string) =>
    schoolsFetch<{ ok: boolean }>(SCHOOLS_API_ROUTES.STUDENT_NOTIFY_GUARDIAN(id), { method: 'POST' }),
  async import(file: File): Promise<{ job_id?: string; ok: boolean }> {
    const form = new FormData();
    form.append('file', file);
    return schoolsFetch<any>(SCHOOLS_API_ROUTES.STUDENTS_IMPORT, {
      method: 'POST',
      body: form as unknown as BodyInit,
      headers: {},
    });
  },
};
