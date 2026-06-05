/**
 * Schools Smart Campus Security API client.
 *
 * The MVP backend does NOT yet ship dedicated camera/incident/watchlist
 * endpoints (see frontend-integration-guide.md §10). To keep the security
 * page live, we derive what we can from the endpoints that do exist:
 *
 *  - cameras / gates → /api/schools/capture-points/
 *  - gate events     → /api/schools/activity/  (filtered)
 *  - kpis            → /api/schools/overview/  + capture-points roll-up
 *
 * Incidents and watchlist matches are not part of MVP — those methods throw
 * a clear error so the UI surfaces a notification instead of silently
 * showing fake data.
 */

import { schoolsFetch, unwrapPaginated } from './schoolsClient';
import { SCHOOLS_API_ROUTES } from './schoolsApiRoutes';
import { overviewApi } from './overview';
import { activityApi } from './activity';

export type CameraStatus = 'online' | 'offline' | 'degraded';
export type IncidentSeverity = 'info' | 'warning' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';
export type GateMethod = 'face' | 'rfid' | 'qr' | 'visitor_pass' | 'manual';

export interface SecurityKPIs {
  active_cameras: number;
  total_cameras: number;
  open_incidents: number;
  watchlist_hits_24h: number;
  unauthorized_attempts_24h: number;
  avg_response_minutes: number;
  gates_online: number;
  visitors_on_premises: number;
}

export interface CameraFeed {
  id: string;
  name: string;
  zone: string;
  status: CameraStatus;
  motion: boolean;
  watchlist_match: boolean;
  last_frame_at: string;
}

export interface WatchlistMatch {
  id: string;
  ts: string;
  name: string;
  reason: 'expelled' | 'banned' | 'wanted' | 'staff_alert';
  zone: string;
  camera: string;
  confidence: number;
}

export interface IncidentLog {
  id: string;
  ts: string;
  title: string;
  zone: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reported_by: string;
  assigned_to?: string;
  ai_summary?: string;
}

export interface GateEvent {
  id: string;
  ts: string;
  gate: string;
  person_name: string;
  person_role: 'student' | 'staff' | 'visitor' | 'unknown';
  method: GateMethod;
  direction: 'in' | 'out';
  authorized: boolean;
  reason?: string;
}

async function listCapturePoints() {
  const data = await schoolsFetch<any>(SCHOOLS_API_ROUTES.CAPTURE_POINTS);
  return unwrapPaginated<any>(data).items;
}

const NOT_AVAILABLE = 'Security incidents & watchlist endpoints are not part of the MVP backend yet.';

export const securityApi = {
  async kpis(): Promise<SecurityKPIs> {
    const [overview, cps] = await Promise.all([overviewApi.get(), listCapturePoints()]);
    const online = cps.filter((c: any) => c.online).length;
    return {
      active_cameras: online,
      total_cameras: cps.length,
      open_incidents: 0,
      watchlist_hits_24h: 0,
      unauthorized_attempts_24h: 0,
      avg_response_minutes: 0,
      gates_online: online,
      visitors_on_premises: overview.attendance_today?.present ?? 0,
    };
  },
  async cameras(): Promise<CameraFeed[]> {
    const cps = await listCapturePoints();
    return cps.map((c: any) => ({
      id: c.id,
      name: c.label ?? c.name ?? 'Capture point',
      zone: c.location ?? c.mode ?? 'Campus',
      status: c.online ? 'online' : 'offline',
      motion: false,
      watchlist_match: false,
      last_frame_at: c.last_event_at ?? new Date().toISOString(),
    }));
  },
  async gateEvents(): Promise<GateEvent[]> {
    const page = await activityApi.list({ limit: 30 });
    return page.items
      .filter(e => e.mode === 'gate' || e.mode === 'face' || !!e.capture_point_id)
      .map(e => ({
        id: e.id,
        ts: e.timestamp,
        gate: e.capture_point_id ?? 'Main Gate',
        person_name: e.person_name || 'Unknown',
        person_role: (e.person_type as GateEvent['person_role']) || 'unknown',
        method: (['face','rfid','qr','visitor_pass','manual'] as const).includes(e.mode as any)
          ? (e.mode as GateMethod) : 'face',
        direction: 'in',
        authorized: e.state !== 'absent',
      }));
  },
  incidents(): Promise<IncidentLog[]> { return Promise.reject(new Error(NOT_AVAILABLE)); },
  watchlistMatches(): Promise<WatchlistMatch[]> { return Promise.reject(new Error(NOT_AVAILABLE)); },
  acknowledgeIncident(_id: string): Promise<{ ok: boolean }> { return Promise.reject(new Error(NOT_AVAILABLE)); },
  dispatchOfficer(_id: string, _officer: string): Promise<{ ok: boolean }> { return Promise.reject(new Error(NOT_AVAILABLE)); },
};
