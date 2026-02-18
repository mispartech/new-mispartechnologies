import { useCallback } from 'react';
import { djangoApi } from '@/lib/api/client';

type EntityType = 'member' | 'department' | 'attendance' | 'visitor' | 'admin' | 'organization' | 'settings' | 'schedule';
type ActionType = 'create' | 'update' | 'delete' | 'view' | 'claim' | 'invite' | 'login' | 'logout';

interface LogActivityParams {
  action: ActionType;
  entityType: EntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export const useActivityLogger = () => {
  const logActivity = useCallback(async ({
    action,
    entityType,
    entityId,
    metadata = {}
  }: LogActivityParams) => {
    try {
      await djangoApi.createActivityLog({
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata,
      });
    } catch (err) {
      console.error('Activity logging error:', err);
    }
  }, []);

  return { logActivity };
};
