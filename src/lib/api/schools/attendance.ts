/**
 * MSSE Smart Attendance API client (Step 3).
 * Backend pending — endpoints are documented in docs/msse/step3-attendance-backend-prompt.md.
 * All calls fall back to MOCK_* fixtures so the UI is fully demonstrable.
 */

export type CaptureMode = 'gate' | 'classroom' | 'event' | 'mobile' | 'kiosk';
export type AttendanceState = 'on_time' | 'late' | 'very_late' | 'absent' | 'excused' | 'present';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

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
  person_role: 'student' | 'staff' | 'visitor';
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
  day: string;     // Mon..Fri
  period: string;  // P1..P8
  rate: number;    // 0..1
}

export interface AttendanceKPIs {
  present_today: number;
  total_expected: number;
  on_time_rate: number;
  late_rate: number;
  absent_rate: number;
  at_risk_students: number;
  active_sessions: number;
  avg_recognition_ms: number;
}

const now = () => new Date().toISOString();

export const MOCK_KPIS: AttendanceKPIs = {
  present_today: 1284,
  total_expected: 1420,
  on_time_rate: 0.86,
  late_rate: 0.09,
  absent_rate: 0.05,
  at_risk_students: 37,
  active_sessions: 6,
  avg_recognition_ms: 412,
};

export const MOCK_SESSIONS: LiveCaptureSession[] = [
  { id: 's1', mode: 'gate',      location: 'Main Gate',          active: true,  recognized_today: 1284, unique_faces: 1106, last_event_at: now() },
  { id: 's2', mode: 'classroom', location: 'Block A — Room 12',  active: true,  recognized_today: 38,   unique_faces: 38,   last_event_at: now() },
  { id: 's3', mode: 'classroom', location: 'Block B — Room 05',  active: true,  recognized_today: 41,   unique_faces: 41,   last_event_at: now() },
  { id: 's4', mode: 'event',     location: 'Auditorium',         active: false, recognized_today: 0,    unique_faces: 0,    last_event_at: now() },
  { id: 's5', mode: 'mobile',    location: 'Teacher Tablet — JSS1', active: true, recognized_today: 32, unique_faces: 32,   last_event_at: now() },
  { id: 's6', mode: 'kiosk',     location: 'Library Kiosk',      active: true,  recognized_today: 74,   unique_faces: 68,   last_event_at: now() },
];

export const MOCK_EVENTS: AttendanceEvent[] = [
  { id: 'e1', ts: now(), person_name: 'Adaeze Okeke',  person_role: 'student', class_or_dept: 'SS2 Science',   mode: 'gate',      state: 'on_time', confidence: 0.97, location: 'Main Gate' },
  { id: 'e2', ts: now(), person_name: 'Mr. Bello',     person_role: 'staff',   class_or_dept: 'Mathematics',   mode: 'gate',      state: 'on_time', confidence: 0.98, location: 'Main Gate' },
  { id: 'e3', ts: now(), person_name: 'Ifeanyi Umeh',  person_role: 'student', class_or_dept: 'SS1 Arts',      mode: 'classroom', state: 'late',    confidence: 0.94, location: 'Room 12' },
  { id: 'e4', ts: now(), person_name: 'Zainab Lawal',  person_role: 'student', class_or_dept: 'JSS3',          mode: 'gate',      state: 'very_late', confidence: 0.92, location: 'Main Gate' },
  { id: 'e5', ts: now(), person_name: 'Visitor',       person_role: 'visitor', class_or_dept: '—',             mode: 'gate',      state: 'present', confidence: 0.81, location: 'Main Gate' },
  { id: 'e6', ts: now(), person_name: 'Tunde Adebayo', person_role: 'student', class_or_dept: 'SS3 Science',   mode: 'classroom', state: 'on_time', confidence: 0.96, location: 'Room 05' },
];

export const MOCK_RISK: RiskStudent[] = [
  { id: 'r1', name: 'Chinedu Okafor',  class: 'SS2 Science', attendance_pct: 62, consecutive_absences: 4, late_count_30d: 7, risk: 'critical', ai_note: '4 consecutive absences. Attendance fell 18% this term — recommend counselor follow-up.' },
  { id: 'r2', name: 'Aisha Bello',     class: 'JSS3',        attendance_pct: 71, consecutive_absences: 2, late_count_30d: 9, risk: 'high',     ai_note: 'Chronic lateness on Mondays. Pattern suggests transport issue.' },
  { id: 'r3', name: 'Samuel Eze',      class: 'SS1 Arts',    attendance_pct: 78, consecutive_absences: 1, late_count_30d: 5, risk: 'medium',   ai_note: 'Attendance dipped after midterm. Monitor for 2 weeks.' },
  { id: 'r4', name: 'Halima Yusuf',    class: 'JSS2',        attendance_pct: 81, consecutive_absences: 0, late_count_30d: 6, risk: 'medium',   ai_note: 'Frequent late arrivals — notify parent via SMS.' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const PERIODS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
export const MOCK_HEATMAP: HeatmapCell[] = DAYS.flatMap((d, di) =>
  PERIODS.map((p, pi) => ({
    day: d, period: p,
    rate: Math.max(0.45, Math.min(0.99, 0.92 - (pi * 0.04) - (di === 0 ? 0.08 : 0) + (Math.sin(di + pi) * 0.05))),
  })),
);

export const attendanceApi = {
  async kpis(): Promise<AttendanceKPIs> { return MOCK_KPIS; },
  async sessions(): Promise<LiveCaptureSession[]> { return MOCK_SESSIONS; },
  async events(): Promise<AttendanceEvent[]> { return MOCK_EVENTS; },
  async risk(): Promise<RiskStudent[]> { return MOCK_RISK; },
  async heatmap(): Promise<HeatmapCell[]> { return MOCK_HEATMAP; },
  async notifyParent(_studentId: string): Promise<{ ok: boolean }> { return { ok: true }; },
  async markExcused(_eventId: string, _reason: string): Promise<{ ok: boolean }> { return { ok: true }; },
};
