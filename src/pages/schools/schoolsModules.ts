import {
  LayoutDashboard, ScanFace, ClipboardList, ShieldCheck, GraduationCap, Users,
  Building2, BookOpen, CalendarClock, FileCheck2, Bed, Bus, Library, CreditCard,
  BarChart3, MessageSquare, UserPlus, FileText, Settings, Activity,
} from 'lucide-react';

export interface SchoolsModule {
  slug: string;
  label: string;
  icon: any;
  group: 'Overview' | 'Attendance' | 'People' | 'Security' | 'Academics' | 'Operations' | 'Insights' | 'System';
  status: 'live' | 'soon';
  step: number;
}

export const SCHOOLS_MODULES: SchoolsModule[] = [
  { slug: '',                    label: 'Dashboard',           icon: LayoutDashboard, group: 'Overview',   status: 'live', step: 0 },

  { slug: 'attendance/admin',    label: 'Attendance Admin',    icon: Activity,        group: 'Attendance', status: 'live', step: 6 },
  { slug: 'attendance',          label: 'Live Capture',        icon: ClipboardList,   group: 'Attendance', status: 'live', step: 3 },

  { slug: 'students',            label: 'Students',            icon: GraduationCap,   group: 'People',     status: 'live', step: 5 },
  { slug: 'staff',               label: 'Staff',               icon: Users,           group: 'People',     status: 'live', step: 6 },
  { slug: 'identity',            label: 'Identity',            icon: ScanFace,        group: 'People',     status: 'live', step: 2 },

  { slug: 'security',            label: 'Security Center',     icon: ShieldCheck,     group: 'Security',   status: 'live', step: 4 },

  { slug: 'departments',         label: 'Departments',         icon: Building2,       group: 'Academics',  status: 'soon', step: 5 },
  { slug: 'classes',             label: 'Classes',             icon: BookOpen,        group: 'Academics',  status: 'soon', step: 5 },
  { slug: 'timetable',           label: 'Timetable',           icon: CalendarClock,   group: 'Academics',  status: 'soon', step: 5 },
  { slug: 'examinations',        label: 'Examinations',        icon: FileCheck2,      group: 'Academics',  status: 'soon', step: 9 },

  { slug: 'visitors',            label: 'Visitors',            icon: UserPlus,        group: 'Operations', status: 'soon', step: 8 },
  { slug: 'hostel',              label: 'Hostel',              icon: Bed,             group: 'Operations', status: 'soon', step: 13 },
  { slug: 'transportation',      label: 'Transport',           icon: Bus,             group: 'Operations', status: 'soon', step: 15 },
  { slug: 'library',             label: 'Library',             icon: Library,         group: 'Operations', status: 'soon', step: 14 },
  { slug: 'payments',            label: 'Payments',            icon: CreditCard,      group: 'Operations', status: 'soon', step: 12 },

  { slug: 'analytics',           label: 'AI Analytics',        icon: BarChart3,       group: 'Insights',   status: 'soon', step: 10 },
  { slug: 'reports',             label: 'Reports',             icon: FileText,        group: 'Insights',   status: 'soon', step: 10 },
  { slug: 'communication',       label: 'Communication',       icon: MessageSquare,   group: 'Insights',   status: 'soon', step: 11 },

  { slug: 'settings',            label: 'Settings',            icon: Settings,        group: 'System',     status: 'soon', step: 16 },
];

export const SCHOOLS_GROUP_ORDER: SchoolsModule['group'][] = [
  'Overview', 'Attendance', 'People', 'Security', 'Academics', 'Operations', 'Insights', 'System',
];
