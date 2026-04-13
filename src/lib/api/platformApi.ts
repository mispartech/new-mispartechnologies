/**
 * Platform API — public stats + admin dashboard endpoints
 */

const DJANGO_BASE_URL =
  import.meta.env.VITE_DJANGO_API_URL || 'https://api.mispartechnologies.com';

export interface PlatformStats {
  total_users: number;
  total_organizations: number;
  accuracy_rate: number;
}

export interface DashboardStats extends PlatformStats {
  demo_requests: number;
  active_plans: number;
}

/** Public — no auth required */
export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const res = await fetch(`${DJANGO_BASE_URL}/api/platform/stats/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  } catch {
    // Fallback defaults until backend is ready
    return { total_users: 0, total_organizations: 0, accuracy_rate: 99 };
  }
}

/** Admin-only — requires platform admin token from localStorage */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const token = localStorage.getItem('platform_admin_token');
    const res = await fetch(`${DJANGO_BASE_URL}/api/platform/dashboard-stats/`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return await res.json();
  } catch {
    return { total_users: 0, total_organizations: 0, accuracy_rate: 99, demo_requests: 0, active_plans: 0 };
  }
}

/** Admin-only — manually override public-facing stats */
export async function updatePlatformStats(
  stats: Partial<PlatformStats>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('platform_admin_token');
    const res = await fetch(`${DJANGO_BASE_URL}/api/platform/stats/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(stats),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || 'Failed to update stats');
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
