/**
 * MSSE Staff API client (Step 6).
 * Backend pending — spec: docs/msse/step6-staff-backend-prompt.md.
 */
import type { PersonAttendanceSummary, PersonAttendanceDay } from './students';

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'visiting';
export type StaffStatus = 'active' | 'on_leave' | 'suspended' | 'separated';
export type EnrollmentStatus = 'enrolled' | 'pending' | 'not_enrolled';

export interface Staff {
  id: string;
  full_name: string;
  staff_no: string;
  role: string;            // e.g. Lecturer, HOD, Bursar
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
}

const todayMinus = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const MOCK_STAFF: Staff[] = [
  { id: 'sf1', full_name: 'Mr. Bello Ahmed',     staff_no: 'STF/2018/004', role: 'Lecturer',  department: 'Mathematics',     employment_type: 'full_time', status: 'active',   enrollment: 'enrolled', email: 'bello@msse.school',     phone: '+2348022200001', manager_name: 'Dr. Okafor', punctuality_pct_30d: 96, attendance_pct_30d: 98, late_count_30d: 1, absent_days_30d: 0 },
  { id: 'sf2', full_name: 'Dr. Ngozi Okafor',    staff_no: 'STF/2015/001', role: 'HOD',       department: 'Sciences',        employment_type: 'full_time', status: 'active',   enrollment: 'enrolled', email: 'ngozi@msse.school',     phone: '+2348022200002', punctuality_pct_30d: 99, attendance_pct_30d: 99, late_count_30d: 0, absent_days_30d: 0 },
  { id: 'sf3', full_name: 'Mrs. Funke Adeyemi',  staff_no: 'STF/2020/032', role: 'Lecturer',  department: 'English',         employment_type: 'full_time', status: 'active',   enrollment: 'pending',  email: 'funke@msse.school',     phone: '+2348022200003', manager_name: 'Dr. Okafor', punctuality_pct_30d: 72, attendance_pct_30d: 88, late_count_30d: 8, absent_days_30d: 2 },
  { id: 'sf4', full_name: 'Mr. Kwame Mensah',    staff_no: 'STF/2022/067', role: 'Lecturer',  department: 'Computer Science',employment_type: 'contract',  status: 'active',   enrollment: 'enrolled', email: 'kwame@msse.school',     phone: '+2348022200004', manager_name: 'Dr. Okafor', punctuality_pct_30d: 84, attendance_pct_30d: 94, late_count_30d: 5, absent_days_30d: 1 },
  { id: 'sf5', full_name: 'Mr. Tunde Salami',    staff_no: 'STF/2019/012', role: 'Security Officer', department: 'Operations', employment_type: 'full_time', status: 'active', enrollment: 'enrolled', email: 'tunde@msse.school',     phone: '+2348022200005', punctuality_pct_30d: 91, attendance_pct_30d: 97, late_count_30d: 3, absent_days_30d: 0 },
  { id: 'sf6', full_name: 'Mrs. Halimat Sani',   staff_no: 'STF/2017/008', role: 'Bursar',    department: 'Finance',         employment_type: 'full_time', status: 'on_leave', enrollment: 'enrolled', email: 'halimat@msse.school',  phone: '+2348022200006', punctuality_pct_30d: 64, attendance_pct_30d: 55, late_count_30d: 11, absent_days_30d: 9 },
  { id: 'sf7', full_name: 'Mr. Peter Eze',       staff_no: 'STF/2024/089', role: 'Lecturer',  department: 'Physics',         employment_type: 'part_time',  status: 'active', enrollment: 'not_enrolled', email: 'peter@msse.school',  phone: '+2348022200007', manager_name: 'Dr. Okafor', punctuality_pct_30d: 58, attendance_pct_30d: 79, late_count_30d: 12, absent_days_30d: 4 },
];

const mockSummary = (s: Staff): PersonAttendanceSummary => {
  const trend = Array.from({ length: 30 }).map((_, i) => ({
    date: todayMinus(29 - i),
    rate: Math.max(40, Math.min(100, Math.round(s.attendance_pct_30d + (Math.cos(i) * 6)))),
  }));
  const recent: PersonAttendanceDay[] = Array.from({ length: 10 }).map((_, i) => {
    const r = Math.random();
    const state: PersonAttendanceDay['state'] =
      s.punctuality_pct_30d < 70 && i < 3 ? 'late'
      : r > 0.9 ? 'late' : r > 0.97 ? 'absent' : 'on_time';
    return {
      date: todayMinus(i),
      state,
      first_seen: state === 'absent' ? undefined : state === 'late' ? '08:18' : '07:42',
      last_seen: state === 'absent' ? undefined : '16:05',
      mode: 'gate',
      location: 'Staff Gate',
      confidence: 0.96,
    };
  });
  return {
    attendance_pct_30d: s.attendance_pct_30d,
    attendance_pct_90d: Math.max(50, s.attendance_pct_30d - 2),
    on_time_rate: s.punctuality_pct_30d / 100,
    late_count_30d: s.late_count_30d,
    absent_days_30d: s.absent_days_30d,
    trend_30d: trend,
    recent,
  };
};

export const staffApi = {
  async list(): Promise<Staff[]> { return MOCK_STAFF; },
  async get(id: string): Promise<Staff | undefined> { return MOCK_STAFF.find(s => s.id === id); },
  async attendance(id: string): Promise<PersonAttendanceSummary | null> {
    const s = MOCK_STAFF.find(x => x.id === id);
    return s ? mockSummary(s) : null;
  },
  async notifyManager(_id: string): Promise<{ ok: boolean }> { return { ok: true }; },
};
