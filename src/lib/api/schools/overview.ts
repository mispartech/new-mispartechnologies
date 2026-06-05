/**
 * Schools Overview API — GET /api/schools/overview/
 * Returns a snapshot used by the dashboard hero / health ring.
 */

import { schoolsFetch } from './schoolsClient';
import { SCHOOLS_API_ROUTES } from './schoolsApiRoutes';

export interface SchoolsOverview {
  enrolled_identities: number;
  attendance_today: { present: number; late: number; absent: number };
  at_risk_students: number;
  active_sessions: number;
  realtime_connected: boolean;
}

export const overviewApi = {
  get: () => schoolsFetch<SchoolsOverview>(SCHOOLS_API_ROUTES.OVERVIEW),
};
