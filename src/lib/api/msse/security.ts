/**
 * MSSE Smart Campus Security API client (Step 4).
 * Backend pending — endpoints documented in docs/msse/step4-security-backend-prompt.md.
 */

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

export interface RestrictedZoneAlert {
  id: string;
  ts: string;
  zone: string;
  person_name?: string;
  description: string;
  severity: IncidentSeverity;
}

const now = () => new Date().toISOString();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const MOCK_SECURITY_KPIS: SecurityKPIs = {
  active_cameras: 22,
  total_cameras: 24,
  open_incidents: 3,
  watchlist_hits_24h: 2,
  unauthorized_attempts_24h: 7,
  avg_response_minutes: 4.2,
  gates_online: 4,
  visitors_on_premises: 11,
};

export const MOCK_CAMERAS: CameraFeed[] = [
  { id: 'cam-1', name: 'Main Gate',           zone: 'Perimeter',  status: 'online',  motion: true,  watchlist_match: false, last_frame_at: now() },
  { id: 'cam-2', name: 'Admin Block Lobby',   zone: 'Admin',      status: 'online',  motion: true,  watchlist_match: false, last_frame_at: now() },
  { id: 'cam-3', name: 'Hostel A — Entrance', zone: 'Hostel',     status: 'online',  motion: false, watchlist_match: false, last_frame_at: now() },
  { id: 'cam-4', name: 'Science Block Hall',  zone: 'Academic',   status: 'online',  motion: true,  watchlist_match: true,  last_frame_at: now() },
  { id: 'cam-5', name: 'Library',             zone: 'Academic',   status: 'online',  motion: false, watchlist_match: false, last_frame_at: now() },
  { id: 'cam-6', name: 'Field Side Gate',     zone: 'Perimeter',  status: 'degraded',motion: true,  watchlist_match: false, last_frame_at: minutesAgo(2) },
  { id: 'cam-7', name: 'Staff Quarters',      zone: 'Residential',status: 'online',  motion: false, watchlist_match: false, last_frame_at: now() },
  { id: 'cam-8', name: 'Backyard Storage',    zone: 'Restricted', status: 'offline', motion: false, watchlist_match: false, last_frame_at: minutesAgo(48) },
];

export const MOCK_WATCHLIST_MATCHES: WatchlistMatch[] = [
  { id: 'w1', ts: minutesAgo(7),  name: 'Unknown Male (Profile #2384)', reason: 'banned',     zone: 'Academic',  camera: 'Science Block Hall', confidence: 0.93 },
  { id: 'w2', ts: minutesAgo(42), name: 'Former Student — K. Audu',     reason: 'expelled',   zone: 'Perimeter', camera: 'Main Gate',          confidence: 0.88 },
];

export const MOCK_INCIDENTS: IncidentLog[] = [
  { id: 'i1', ts: minutesAgo(12), title: 'Watchlist match — Science Block',   zone: 'Academic',   severity: 'critical', status: 'investigating', reported_by: 'AI Vision', assigned_to: 'Officer Bello', ai_summary: 'Person matched expulsion watchlist with 93% confidence. Last seen heading toward Lab 2.' },
  { id: 'i2', ts: minutesAgo(95), title: 'Unauthorized hostel access attempt',zone: 'Hostel',     severity: 'warning',  status: 'open',          reported_by: 'Gate System', ai_summary: 'Three RFID failures within 2 minutes by same unknown badge.' },
  { id: 'i3', ts: minutesAgo(310),title: 'Tailgating at Field Side Gate',     zone: 'Perimeter',  severity: 'warning',  status: 'open',          reported_by: 'AI Vision' },
  { id: 'i4', ts: minutesAgo(1440),title: 'Restricted zone breach — Storage', zone: 'Restricted', severity: 'critical', status: 'resolved',      reported_by: 'AI Vision', assigned_to: 'Officer Bello' },
];

export const MOCK_GATE_EVENTS: GateEvent[] = [
  { id: 'g1', ts: now(),           gate: 'Main Gate',       person_name: 'Adaeze Okeke',    person_role: 'student', method: 'face',         direction: 'in',  authorized: true },
  { id: 'g2', ts: minutesAgo(1),   gate: 'Main Gate',       person_name: 'Mrs. Eze',        person_role: 'staff',   method: 'face',         direction: 'in',  authorized: true },
  { id: 'g3', ts: minutesAgo(3),   gate: 'Main Gate',       person_name: 'Contractor #14',  person_role: 'visitor', method: 'visitor_pass', direction: 'in',  authorized: true },
  { id: 'g4', ts: minutesAgo(6),   gate: 'Field Side Gate', person_name: 'Unknown',         person_role: 'unknown', method: 'rfid',         direction: 'in',  authorized: false, reason: 'Unknown RFID tag' },
  { id: 'g5', ts: minutesAgo(11),  gate: 'Hostel A Gate',   person_name: 'Tunde Adebayo',   person_role: 'student', method: 'qr',           direction: 'out', authorized: true },
  { id: 'g6', ts: minutesAgo(14),  gate: 'Main Gate',       person_name: 'Unknown',         person_role: 'unknown', method: 'face',         direction: 'in',  authorized: false, reason: 'No identity match' },
];

export const MOCK_RESTRICTED_ALERTS: RestrictedZoneAlert[] = [
  { id: 'r1', ts: minutesAgo(8),  zone: 'Lab Storage',       person_name: 'Unknown', description: 'Movement detected outside class hours', severity: 'critical' },
  { id: 'r2', ts: minutesAgo(55), zone: 'Server Room',       description: 'Door held open > 2 minutes',                                     severity: 'warning' },
  { id: 'r3', ts: minutesAgo(180),zone: 'Records Archive',   person_name: 'Mr. Okonkwo', description: 'After-hours access (authorized)',     severity: 'info' },
];

export const securityApi = {
  async kpis(): Promise<SecurityKPIs> { return MOCK_SECURITY_KPIS; },
  async cameras(): Promise<CameraFeed[]> { return MOCK_CAMERAS; },
  async watchlistMatches(): Promise<WatchlistMatch[]> { return MOCK_WATCHLIST_MATCHES; },
  async incidents(): Promise<IncidentLog[]> { return MOCK_INCIDENTS; },
  async gateEvents(): Promise<GateEvent[]> { return MOCK_GATE_EVENTS; },
  async restrictedAlerts(): Promise<RestrictedZoneAlert[]> { return MOCK_RESTRICTED_ALERTS; },
  async acknowledgeIncident(_id: string): Promise<{ ok: boolean }> { return { ok: true }; },
  async dispatchOfficer(_id: string, _officer: string): Promise<{ ok: boolean }> { return { ok: true }; },
};
