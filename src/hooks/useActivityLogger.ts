import { useCallback } from 'react';

type EntityType = 'member' | 'department' | 'attendance' | 'visitor' | 'admin' | 'organization' | 'settings' | 'schedule';
type ActionType = 'create' | 'update' | 'delete' | 'view' | 'claim' | 'invite' | 'login' | 'logout';

interface LogActivityParams {
  action: ActionType;
  entityType: EntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Activity logger hook.
 * Currently a silent no-op — the /api/activity-logs/ endpoint is not yet implemented.
 * When the backend endpoint is available, uncomment the API call below.
 */
export const useActivityLogger = () => {
  const logActivity = useCallback(async (_params: LogActivityParams) => {
    // No-op until backend implements /api/activity-logs/
    // await djangoApi.createActivityLog({ ... });
  }, []);

  return { logActivity };
};
