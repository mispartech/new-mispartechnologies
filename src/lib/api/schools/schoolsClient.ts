/**
 * Schools API Client — talks to the dedicated `schools-api` backend
 * (separate from the main mispartechnologies API).
 *
 * Mirrors patterns from src/lib/api/client.ts (JWT injection, silent flag,
 * paginated unwrap, 401 auto-logout) but stays decoupled so the two
 * backends can evolve independently.
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const BASE_URL =
  import.meta.env.VITE_SCHOOLS_API_URL || 'https://api.schools.mispartechnologies.com';

const IS_DEV = import.meta.env.DEV;

if (IS_DEV) console.log('[SchoolsApi] Base URL:', BASE_URL);

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface RequestOptions extends RequestInit {
  silent?: boolean;
  timeout?: number;
}

export function unwrapPaginated<T>(data: any): {
  items: T[];
  count: number;
  next: string | null;
  previous: string | null;
} {
  if (Array.isArray(data)) {
    return { items: data as T[], count: data.length, next: null, previous: null };
  }
  if (data && typeof data === 'object' && 'results' in data) {
    return {
      items: Array.isArray(data.results) ? data.results : [],
      count: data.count ?? 0,
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }
  return { items: data ? [data] : [], count: data ? 1 : 0, next: null, previous: null };
}

async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function handleAutoLogout() {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    Object.keys(localStorage)
      .filter(k => k.startsWith('sb-'))
      .forEach(k => localStorage.removeItem(k));
  }
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
    window.location.href = '/auth';
  }
}

export async function schoolsRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
  baseOverride?: string,
): Promise<ApiResponse<T>> {
  const { silent, timeout, ...fetchOptions } = options;
  const token = await getAccessToken();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${baseOverride ?? BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout ?? 15000);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: { ...headers, ...((fetchOptions.headers as Record<string, string>) || {}) },
    });
    clearTimeout(timeoutId);

    const text = await response.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!response.ok) {
      const error =
        (typeof data === 'object' && (data?.detail || data?.error || data?.message)) ||
        (typeof data === 'string' ? data.slice(0, 200) : 'Request failed');

      if (IS_DEV) console.warn(`[SchoolsApi] ${response.status} ${endpoint}:`, error);
      if (!silent && response.status !== 404) {
        toast({
          variant: 'destructive',
          title: response.status === 401 ? 'Session Expired'
            : response.status === 403 ? 'Access Denied'
            : response.status >= 500 ? 'Server Error'
            : 'Request Failed',
          description: error,
        });
      }
      if (response.status === 401) handleAutoLogout();
      return { status: response.status, error };
    }

    return { data: data as T, status: response.status };
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err instanceof DOMException && err.name === 'AbortError';
    const message = isTimeout ? 'Request timed out.' : err instanceof Error ? err.message : 'Network error';
    if (IS_DEV) console.warn(`[SchoolsApi] ${endpoint}:`, message);
    if (!silent) {
      toast({
        variant: 'destructive',
        title: isTimeout ? 'Request Timeout' : 'Connection Error',
        description: message,
      });
    }
    return { status: 0, error: message };
  }
}

/** Synthetic 404 — used by stubs while a backend endpoint is pending. */
export function notImplemented<T>(endpointName: string): ApiResponse<T> {
  if (IS_DEV) console.warn(`[SchoolsApi] Endpoint not implemented yet: ${endpointName}`);
  return { status: 404, error: 'Feature not available yet. Backend endpoint pending.' };
}
