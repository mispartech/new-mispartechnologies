/**
 * Schools Onboarding API
 * Backend spec: docs/schools/schools-onboarding-backend-prompt.md
 *
 * The PUT call is fully atomic — backend creates organization, default roles,
 * attendance policy, capture points, and seeds the super-admin in one
 * transaction. Any failure rolls everything back.
 */

import { schoolsRequest, type ApiResponse } from './schoolsClient';
import { SCHOOLS_API_ROUTES } from './schoolsApiRoutes';

export type InstitutionType = 'nursery' | 'primary' | 'secondary' | 'tertiary' | 'mixed';
export type Ownership = 'public' | 'private' | 'mission';
export type TermSystem = '3-term' | '2-semester';
export type CaptureMode = 'gate' | 'classroom' | 'event' | 'kiosk' | 'mobile';

export interface SchoolsCapturePointInput {
  label: string;
  mode: CaptureMode;
}

export interface SchoolsAttendancePolicy {
  day_start: string;          // HH:mm
  day_end: string;
  late_threshold_min: number;
  very_late_threshold_min: number;
  weekend_days: number[];     // 0=Sun..6=Sat
  half_day_cutoff: string;    // HH:mm
  grace_days_per_term: number;
}

export interface SchoolsOnboardingPayload {
  // Step 1
  name: string;
  short_code: string;
  motto?: string;
  logo_url?: string;
  institution_type: InstitutionType;
  founded_year?: number;
  ownership: Ownership;
  // Step 2
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  // Step 3
  campus_count: number;
  hierarchy_levels: Array<'faculty' | 'department' | 'programme' | 'level' | 'class'>;
  term_system: TermSystem;
  session_start_date: string; // YYYY-MM-DD
  // Step 4
  expected_students: number;
  expected_teaching_staff: number;
  expected_nonteaching_staff: number;
  expected_guardians: number;
  // Step 5
  policy: SchoolsAttendancePolicy;
  // Step 6
  capture_points: SchoolsCapturePointInput[];
  // Step 7
  admin_first_name: string;
  admin_last_name: string;
  admin_role: 'principal' | 'vice_principal' | 'bursar' | 'registrar' | 'it_admin';
  admin_phone: string;
  // Step 8
  plan: 'starter' | 'pro' | 'business';
  accepted_biometric_terms: boolean;
}

export interface SchoolsOnboardingState extends Partial<SchoolsOnboardingPayload> {
  completed: boolean;
  organization_id?: string;
  next_step?: number;
}

export const schoolsOnboardingApi = {
  resume(): Promise<ApiResponse<SchoolsOnboardingState>> {
    return schoolsRequest(SCHOOLS_API_ROUTES.ONBOARDING, { silent: true });
  },
  submit(payload: SchoolsOnboardingPayload): Promise<ApiResponse<{ organization_id: string }>> {
    return schoolsRequest(SCHOOLS_API_ROUTES.ONBOARDING, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
