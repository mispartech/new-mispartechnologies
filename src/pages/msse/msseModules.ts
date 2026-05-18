import {
  LayoutDashboard, ScanFace, ClipboardList, ShieldAlert, GraduationCap, Users,
  Building2, BookOpen, CalendarClock, FileCheck2, Bed, Bus, Library, CreditCard,
  BarChart3, MessageSquare, UserPlus, FileText, Settings,
} from 'lucide-react';

export interface MsseModule {
  slug: string;
  label: string;
  icon: any;
  group: 'Overview' | 'Identity & Attendance' | 'Academic' | 'Operations' | 'Insights' | 'System';
  status: 'live' | 'soon';
  step: number;
}

export const MSSE_MODULES: MsseModule[] = [
  { slug: '',                    label: 'Dashboard',           icon: LayoutDashboard, group: 'Overview',                status: 'live', step: 0 },
  { slug: 'identity',            label: 'Identity Management', icon: ScanFace,        group: 'Identity & Attendance',   status: 'live', step: 2 },
  { slug: 'attendance',          label: 'Smart Attendance',    icon: ClipboardList,   group: 'Identity & Attendance',   status: 'live', step: 3 },
  { slug: 'security',            label: 'Security Center',     icon: ShieldAlert,     group: 'Identity & Attendance',   status: 'soon', step: 4 },
  { slug: 'students',            label: 'Students',            icon: GraduationCap,   group: 'Academic',                status: 'soon', step: 5 },
  { slug: 'staff',               label: 'Staff',               icon: Users,           group: 'Academic',                status: 'soon', step: 6 },
  { slug: 'departments',         label: 'Departments',         icon: Building2,       group: 'Academic',                status: 'soon', step: 5 },
  { slug: 'classes',             label: 'Classes',             icon: BookOpen,        group: 'Academic',                status: 'soon', step: 5 },
  { slug: 'timetable',           label: 'Timetable',           icon: CalendarClock,   group: 'Academic',                status: 'soon', step: 5 },
  { slug: 'examinations',        label: 'Examinations',        icon: FileCheck2,      group: 'Operations',              status: 'soon', step: 9 },
  { slug: 'hostel',              label: 'Hostel',              icon: Bed,             group: 'Operations',              status: 'soon', step: 13 },
  { slug: 'transportation',      label: 'Transportation',      icon: Bus,             group: 'Operations',              status: 'soon', step: 15 },
  { slug: 'library',             label: 'Library',             icon: Library,         group: 'Operations',              status: 'soon', step: 14 },
  { slug: 'payments',            label: 'Payments',            icon: CreditCard,      group: 'Operations',              status: 'soon', step: 12 },
  { slug: 'analytics',           label: 'AI Analytics',        icon: BarChart3,       group: 'Insights',                status: 'soon', step: 10 },
  { slug: 'communication',       label: 'Communication',       icon: MessageSquare,   group: 'Insights',                status: 'soon', step: 11 },
  { slug: 'visitors',            label: 'Visitor Management',  icon: UserPlus,        group: 'Operations',              status: 'soon', step: 8 },
  { slug: 'reports',             label: 'Reports',             icon: FileText,        group: 'Insights',                status: 'soon', step: 10 },
  { slug: 'settings',            label: 'Settings',            icon: Settings,        group: 'System',                  status: 'soon', step: 16 },
];

export const MSSE_GROUP_ORDER: MsseModule['group'][] = [
  'Overview', 'Identity & Attendance', 'Academic', 'Operations', 'Insights', 'System',
];
