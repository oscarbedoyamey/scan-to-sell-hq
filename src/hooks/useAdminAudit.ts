import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export const useAdminAudit = () => {
  const { user } = useAuth();

  const logAction = useCallback(
    async (
      action: string,
      entityType: string,
      entityId?: string,
      details?: Record<string, unknown>,
      reason?: string
    ) => {
      if (!user) return;
      await (supabase as any).from('admin_audit_log').insert({
        admin_user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId ?? null,
        details: details ?? {},
        reason: reason ?? null,
      });
    },
    [user]
  );

  return { logAction };
};
