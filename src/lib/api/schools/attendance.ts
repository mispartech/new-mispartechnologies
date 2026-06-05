/**
 * Schools Smart Attendance API client.
 * Backend contract: docs/schools/frontend-integration-guide.md §4.4
 *
 * Frontend keeps its richer type names; we map backend fields where shapes
 * differ slightly (KPIs especially).
 */

import { schoolsRequest, schoolsFetch, unwrapShortList } from './schoolsClient';
import { SCHOOLS_API_ROUTES } from './schoolsApiRoutes';
import { activityApi, type ActivityEntry } from './activity';

export type CaptureMode = 'gate' | 'classroom' | 'event' | 'mobile' | 'kiosk';
export type AttendanceState = 'on_time' | 'late' | 'very_late' | 'absent' | 'excused' | 'present';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AttendanceKPIs {
  date: string;
  present_today: number;
  total_expected: number;
  on_time_rate: number;
  late_rate: number;
  absent_rate: number;
  at_risk_students: number;
  active_sessions: number;
  avg_recognition_ms: number;
  // Pass-through extras from the backend if present
  excused?: number;
  students_enrolled?: number;
  staff_enrolled?: number;
}

export interface LiveCaptureSession {
  id: string;
  mode: CaptureMode;
  location: string;
  active: boolean;
  recognized_today: number;
  unique_faces: number;
  last_event_at: string;
}

export interface AttendanceEvent {
  id: string;
  ts: string;
  person_name: string;
  person_role: 'student' | 'staff' | 'visitor' | 'unknown';
  class_or_dept: string;
  mode: CaptureMode;
  state: AttendanceState;
  confidence: number;
  location: string;
}

export interface RiskStudent {
  id: string;
  name: string;
  class: string;
  attendance_pct: number;
  consecutive_absences: number;
  late_count_30d: number;
  risk: RiskLevel;
  ai_note: string;
}

export interface HeatmapCell {
  day: string;
  period: string;
  rate: number;
  present?: number;
  late?: number;
  absent?: number;
  total?: number;
}

/** Map activity-feed entries → AttendanceEvent so the live board can render them. */
const entryToEvent = (e: ActivityEntry): AttendanceEvent => ({
  id: e.id,
  ts: e.timestamp,
  person_name: e.person_name || 'Unknown',
  person_role: (e.person_type as AttendanceEvent['person_role']) || 'unknown',
  class_or_dept: e.person_ref || '—',
  mode: (e.mode as CaptureMode) || 'gate',
  state: (e.state as AttendanceState) || 'present',
  confidence: 1,
  location: e.capture_point_id || '—',
});

const mapKpis = (raw: any): AttendanceKPIs => {
  const present = Number(raw?.present ?? raw?.present_today ?? 0);
  const late = Number(raw?.late ?? 0);
  const absent = Number(raw?.absent ?? 0);
  const total = Number(raw?.total_enrolled ?? raw?.total_expected ?? present + late + absent);
  const safe = total > 0 ? total : 1;
  return {
    date: raw?.date ?? new Date().toISOString().slice(0, 10),
    present_today: present,
    total_expected: total,
    on_time_rate: Math.max(0, (present - late) / safe),
    late_rate: late / safe,
    absent_rate: absent / safe,
    at_risk_students: Number(raw?.at_risk_students ?? 0),
    active_sessions: Number(raw?.active_sessions ?? 0),
    avg_recognition_ms: Number(raw?.avg_recognition_ms ?? 0),
    excused: raw?.excused,
    students_enrolled: raw?.students_enrolled,
    staff_enrolled: raw?.staff_enrolled,
  };
};

export const attendanceApi = {
  async kpis(): Promise<AttendanceKPIs> {
    const raw = await schoolsFetch<any>(SCHOOLS_API_ROUTES.ATTENDANCE_KPIS);
    return mapKpis(raw);
  },
  sessions: () =>
    schoolsFetch<LiveCaptureSession[]>(SCHOOLS_API_ROUTES.ATTENDANCE_SESSIONS),
  async events(): Promise<AttendanceEvent[]> {
    // The /attendance/ daily roster is record-shaped, not event-shaped.
    // The activity feed delivers the live event stream we render.
    const page = await activityApi.list({ limit: 30 });
    return page.items.map(entryToEvent);
  },
  risk: () =>
    schoolsFetch<RiskStudent[]>(SCHOOLS_API_ROUTES.ATTENDANCE_AT_RISK),
  async heatmap(): Promise<HeatmapCell[]> {
    const raw = await schoolsFetch<any>(SCHOOLS_API_ROUTES.ATTENDANCE_HEATMAP);
    const list = Array.isArray(raw) ? raw : (raw?.results ?? []);
    return list.map((c: any) => ({
      day: c.day,
      period: c.period,
      rate: c.total ? c.present / c.total : Number(c.rate ?? 0),
      present: c.present,
      late: c.late,
      absent: c.absent,
      total: c.total,
    }));
  },
  async roster(params: { date?: string; scope?: 'all' | 'students' | 'staff'; class?: string; dept?: string; state?: string } = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, String(v)); });
    const res = await schoolsRequest<any>(`${SCHOOLS_API_ROUTES.ATTENDANCE}${q.toString() ? `?${q}` : ''}`);
    if (res.error) throw new Error(res.error);
    return unwrapShortList<any>(res.data);
  },
  mark: (body: { person_type: 'student' | 'staff'; person_id: string; date: string; state: AttendanceState; notes?: string }) =>
    schoolsFetch<{ ok: boolean }>(SCHOOLS_API_ROUTES.ATTENDANCE_MARK, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  excuse: (eventId: string, reason: string) =>
    schoolsFetch<{ ok: boolean }>(SCHOOLS_API_ROUTES.ATTENDANCE_EXCUSE(eventId), {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),
  export: (body: { scope: 'all' | 'students' | 'staff'; start_date: string; end_date: string; format?: 'csv' }) =>
    schoolsFetch<{ download_url: string; expires_at: string }>(SCHOOLS_API_ROUTES.ATTENDANCE_EXPORT, {
      method: 'POST',
      body: JSON.stringify({ format: 'csv', ...body }),
    }),
  notifyGuardian: (studentId: string) =>
    schoolsFetch<{ ok: boolean }>(SCHOOLS_API_ROUTES.STUDENT_NOTIFY_GUARDIAN(studentId), { method: 'POST' }),
};
