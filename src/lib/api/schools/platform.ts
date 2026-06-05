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

export const schoolsPlatformApi = {
  async tenants(): Promise<ApiResponse<TenantSummary[]>> {
    const r = await schoolsRequest<any>(SCHOOLS_API_ROUTES.PLATFORM_TENANTS);
    if (r.error) return { status: r.status, error: r.error };
    const { items } = unwrapPaginated<TenantSummary>(r.data);
    return { data: items, status: r.status };
  },
  faceEngineHealth(): Promise<ApiResponse<FaceEngineHealth>> {
    return schoolsRequest<FaceEngineHealth>(SCHOOLS_API_ROUTES.PLATFORM_FACE_ENGINE_HEALTH);
  },
  async duplicates(): Promise<ApiResponse<DuplicateSuspect[]>> {
    const r = await schoolsRequest<any>(SCHOOLS_API_ROUTES.PLATFORM_DUPLICATES);
    if (r.error) return { status: r.status, error: r.error };
    const { items } = unwrapPaginated<DuplicateSuspect>(r.data);
    return { data: items, status: r.status };
  },
  async auditLog(): Promise<ApiResponse<PlatformAuditEntry[]>> {
    const r = await schoolsRequest<any>(SCHOOLS_API_ROUTES.PLATFORM_AUDIT_LOG);
    if (r.error) return { status: r.status, error: r.error };
    const { items } = unwrapPaginated<PlatformAuditEntry>(r.data);
    return { data: items, status: r.status };
  },
};

