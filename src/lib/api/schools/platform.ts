/**
 * Ednitio Platform Admin API (Mispar Technologies internal).
 * Used by /schools/admin.
 */

import { schoolsRequest, unwrapPaginated, type ApiResponse } from './schoolsClient';
import { SCHOOLS_API_ROUTES } from './schoolsApiRoutes';
import type { FaceEngineHealth } from './faceClient';

export interface TenantSummary {
  organization_id: string;
  name: string;
  institution_type: string;
  plan: 'starter' | 'pro' | 'business';
  mau: number;
  enrolled_identities: number;
  attendance_health_pct: number;
  last_seen_at: string | null;
  onboarding_complete: boolean;
}

export interface PlatformAuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  tenant_id: string | null;
  metadata?: Record<string, any>;
}

export interface DuplicateSuspect {
  id: string;
  tenant_id: string;
  similarity: number;
  primary_person_id: string;
  candidate_person_id: string;
  detected_at: string;
}

// ── Mock fixtures (used until backend ships) ──
const MOCK_TENANTS: TenantSummary[] = [
  { organization_id: 'org-1', name: 'Greenwood Academy',     institution_type: 'secondary', plan: 'pro',      mau: 412, enrolled_identities: 1140, attendance_health_pct: 92, last_seen_at: new Date().toISOString(), onboarding_complete: true },
  { organization_id: 'org-2', name: 'Lighthouse College',    institution_type: 'tertiary',  plan: 'business', mau: 980, enrolled_identities: 4220, attendance_health_pct: 88, last_seen_at: new Date().toISOString(), onboarding_complete: true },
  { organization_id: 'org-3', name: 'Sunrise Primary',       institution_type: 'primary',   plan: 'starter',  mau: 76,  enrolled_identities: 188,  attendance_health_pct: 94, last_seen_at: new Date(Date.now() - 86400000).toISOString(), onboarding_complete: true },
  { organization_id: 'org-4', name: 'Crescent Mixed School', institution_type: 'mixed',     plan: 'pro',      mau: 0,   enrolled_identities: 0,    attendance_health_pct: 0,  last_seen_at: null,                              onboarding_complete: false },
];

const MOCK_HEALTH: FaceEngineHealth = {
  gpu: true, queue_depth: 3, p50_ms: 42, p95_ms: 168, model_version: 'buffalo_l@1.4',
};

const MOCK_AUDIT: PlatformAuditEntry[] = [
  { id: 'a1', ts: new Date().toISOString(), actor: 'platform@mispar', action: 'tenant.suspend', tenant_id: 'org-4' },
  { id: 'a2', ts: new Date(Date.now() - 3600000).toISOString(), actor: 'platform@mispar', action: 'plan.upgrade', tenant_id: 'org-2', metadata: { from: 'pro', to: 'business' } },
];

export const schoolsPlatformApi = {
  async tenants(): Promise<ApiResponse<TenantSummary[]>> {
    const r = await schoolsRequest<any>(SCHOOLS_API_ROUTES.PLATFORM_TENANTS, { silent: true });
    if (r.error) return { data: MOCK_TENANTS, status: 200 };
    const { items } = unwrapPaginated<TenantSummary>(r.data);
    return { data: items, status: r.status };
  },
  async faceEngineHealth(): Promise<ApiResponse<FaceEngineHealth>> {
    const r = await schoolsRequest<FaceEngineHealth>(SCHOOLS_API_ROUTES.PLATFORM_FACE_ENGINE_HEALTH, { silent: true });
    if (r.error) return { data: MOCK_HEALTH, status: 200 };
    return r;
  },
  async duplicates(): Promise<ApiResponse<DuplicateSuspect[]>> {
    const r = await schoolsRequest<any>(SCHOOLS_API_ROUTES.PLATFORM_DUPLICATES, { silent: true });
    if (r.error) return { data: [], status: 200 };
    const { items } = unwrapPaginated<DuplicateSuspect>(r.data);
    return { data: items, status: r.status };
  },
  async auditLog(): Promise<ApiResponse<PlatformAuditEntry[]>> {
    const r = await schoolsRequest<any>(SCHOOLS_API_ROUTES.PLATFORM_AUDIT_LOG, { silent: true });
    if (r.error) return { data: MOCK_AUDIT, status: 200 };
    const { items } = unwrapPaginated<PlatformAuditEntry>(r.data);
    return { data: items, status: r.status };
  },
};
