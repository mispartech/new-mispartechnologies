/**
 * Schools Activity Feed — GET /api/schools/activity/?cursor=&limit=
 * Cursor-paginated, ordered by most recent.
 */

import { schoolsRequest, unwrapCursor } from './schoolsClient';
import { SCHOOLS_API_ROUTES } from './schoolsApiRoutes';

export interface ActivityEntry {
  id: string;
  type: 'attendance' | string;
  person_type: 'student' | 'staff' | 'visitor' | 'unknown';
  person_id: string;
  person_name: string;
  person_ref: string;
  state: string;
  mode: string;
  timestamp: string;
  capture_point_id: string | null;
}

export const activityApi = {
  async list(params: { cursor?: string; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.cursor) q.set('cursor', params.cursor);
    q.set('limit', String(params.limit ?? 20));
    const res = await schoolsRequest<any>(`${SCHOOLS_API_ROUTES.ACTIVITY}?${q.toString()}`);
    if (res.error) throw new Error(res.error);
    return unwrapCursor<ActivityEntry>(res.data);
  },
};
