
-- Audit log for admin actions
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}'::jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read all audit logs"
  ON public.admin_audit_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert audit logs"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND admin_user_id = auth.uid());

CREATE INDEX idx_audit_log_entity ON public.admin_audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON public.admin_audit_log (created_at DESC);
CREATE INDEX idx_audit_log_admin ON public.admin_audit_log (admin_user_id);
