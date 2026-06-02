/**
 * Schools Students API client (Step 5).
 * Backend pending — spec: docs/schools/step5-students-backend-prompt.md.
 */

export type EnrollmentStatus = 'enrolled' | 'pending' | 'not_enrolled';
export type StudentStatus = 'active' | 'suspended' | 'graduated' | 'withdrawn';

export interface Student {
  id: string;
  full_name: string;
  admission_no: string;
  class: string;          // e.g. SS2 Science
  level: string;          // JSS1..SS3
  gender: 'M' | 'F';
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
}

export interface PersonAttendanceDay {
  date: string;          // YYYY-MM-DD
  state: 'on_time' | 'late' | 'very_late' | 'absent' | 'excused' | 'present';
  first_seen?: string;   // HH:mm
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

const todayMinus = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const MOCK_STUDENTS: Student[] = [
  { id: 'st1', full_name: 'Adaeze Okeke',    admission_no: 'MSS/2023/001', class: 'SS2 Science', level: 'SS2', gender: 'F', guardian_name: 'Mrs Okeke', guardian_phone: '+2348012345001', guardian_email: 'okeke.fam@example.com', status: 'active', enrollment: 'enrolled', attendance_pct_30d: 96, late_count_30d: 1, absent_days_30d: 1, risk: 'low' },
  { id: 'st2', full_name: 'Chinedu Okafor',  admission_no: 'MSS/2023/002', class: 'SS2 Science', level: 'SS2', gender: 'M', guardian_name: 'Mr Okafor', guardian_phone: '+2348012345002', status: 'active', enrollment: 'enrolled', attendance_pct_30d: 62, late_count_30d: 7, absent_days_30d: 11, risk: 'critical' },
  { id: 'st3', full_name: 'Ifeanyi Umeh',    admission_no: 'MSS/2024/045', class: 'SS1 Arts',    level: 'SS1', gender: 'M', guardian_name: 'Mrs Umeh',   guardian_phone: '+2348012345003', status: 'active', enrollment: 'pending', attendance_pct_30d: 84, late_count_30d: 4, absent_days_30d: 4, risk: 'medium' },
  { id: 'st4', full_name: 'Zainab Lawal',    admission_no: 'MSS/2022/118', class: 'JSS3',        level: 'JSS3', gender: 'F', guardian_name: 'Alh. Lawal', guardian_phone: '+2348012345004', status: 'active', enrollment: 'enrolled', attendance_pct_30d: 71, late_count_30d: 9, absent_days_30d: 7, risk: 'high' },
  { id: 'st5', full_name: 'Tunde Adebayo',   admission_no: 'MSS/2021/007', class: 'SS3 Science', level: 'SS3', gender: 'M', guardian_name: 'Dr Adebayo', guardian_phone: '+2348012345005', status: 'active', enrollment: 'enrolled', attendance_pct_30d: 98, late_count_30d: 0, absent_days_30d: 0, risk: 'low' },
  { id: 'st6', full_name: 'Halima Yusuf',    admission_no: 'MSS/2024/077', class: 'JSS2',        level: 'JSS2', gender: 'F', guardian_name: 'Mrs Yusuf',  guardian_phone: '+2348012345006', status: 'active', enrollment: 'enrolled', attendance_pct_30d: 81, late_count_30d: 6, absent_days_30d: 3, risk: 'medium' },
  { id: 'st7', full_name: 'Samuel Eze',      admission_no: 'MSS/2023/210', class: 'SS1 Arts',    level: 'SS1', gender: 'M', guardian_name: 'Mr Eze',     guardian_phone: '+2348012345007', status: 'active', enrollment: 'enrolled', attendance_pct_30d: 78, late_count_30d: 5, absent_days_30d: 5, risk: 'medium' },
  { id: 'st8', full_name: 'Aisha Bello',     admission_no: 'MSS/2022/302', class: 'JSS3',        level: 'JSS3', gender: 'F', guardian_name: 'Mrs Bello',  guardian_phone: '+2348012345008', status: 'suspended', enrollment: 'enrolled', attendance_pct_30d: 71, late_count_30d: 9, absent_days_30d: 7, risk: 'high' },
];

const mockSummary = (s: Student): PersonAttendanceSummary => {
  const trend = Array.from({ length: 30 }).map((_, i) => ({
    date: todayMinus(29 - i),
    rate: Math.max(40, Math.min(100, Math.round(s.attendance_pct_30d + (Math.sin(i) * 8)))),
  }));
  const recent: PersonAttendanceDay[] = Array.from({ length: 10 }).map((_, i) => {
    const r = Math.random();
    const state: PersonAttendanceDay['state'] =
      s.risk === 'critical' && i < 4 ? 'absent'
      : r > 0.85 ? 'late' : r > 0.95 ? 'absent' : 'on_time';
    return {
      date: todayMinus(i),
      state,
      first_seen: state === 'absent' ? undefined : state === 'late' ? '08:22' : '07:48',
      last_seen: state === 'absent' ? undefined : '15:10',
      mode: 'gate',
      location: 'Main Gate',
      confidence: 0.94,
    };
  });
  return {
    attendance_pct_30d: s.attendance_pct_30d,
    attendance_pct_90d: Math.max(50, s.attendance_pct_30d - 3),
    on_time_rate: Math.max(0, (s.attendance_pct_30d - s.late_count_30d) / 100),
    late_count_30d: s.late_count_30d,
    absent_days_30d: s.absent_days_30d,
    trend_30d: trend,
    recent,
  };
};

export const studentsApi = {
  async list(): Promise<Student[]> { return MOCK_STUDENTS; },
  async get(id: string): Promise<Student | undefined> { return MOCK_STUDENTS.find(s => s.id === id); },
  async attendance(id: string): Promise<PersonAttendanceSummary | null> {
    const s = MOCK_STUDENTS.find(x => x.id === id);
    return s ? mockSummary(s) : null;
  },
  async notifyParent(_id: string): Promise<{ ok: boolean }> { return { ok: true }; },
};
