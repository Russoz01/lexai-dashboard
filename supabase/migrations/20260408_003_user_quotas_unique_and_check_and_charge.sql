-- Ensure uniqueness so ON CONFLICT works for atomic upserts.
DO $$
BEGIN
  ALTER TABLE public.user_quotas
    ADD CONSTRAINT user_quotas_usuario_agente_mes_unique
    UNIQUE (usuario_id, agente, mes);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- check_and_charge: 1-roundtrip unified auth+quota lookup.
--
-- Replaces the 3 sequential roundtrips currently in src/lib/quotas.ts:
--   1. SELECT usuarios
--   2. SELECT user_quotas
--   3. RPC increment_quota
--
-- Critically also returns usuario_id so downstream historico/drafts/etc inserts
-- use the correct public.usuarios.id instead of passing auth.users.id (which
-- violates the FK and silently fails in the current code).
CREATE OR REPLACE FUNCTION public.check_and_charge(
  p_auth_user_id UUID,
  p_agente TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_usuario_id UUID;
  v_plano TEXT;
  v_sub_status TEXT;
  v_trial_ended TIMESTAMPTZ;
  v_is_trialing BOOLEAN;
  v_limit INT;
  v_used INT;
  v_month TEXT := to_char(NOW(), 'YYYY-MM');
BEGIN
  SELECT id, COALESCE(plano, 'free'), subscription_status, trial_ended_at
    INTO v_usuario_id, v_plano, v_sub_status, v_trial_ended
    FROM public.usuarios
    WHERE auth_user_id = p_auth_user_id
    LIMIT 1;

  IF v_usuario_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'user_not_found');
  END IF;

  v_is_trialing := v_sub_status = 'trialing'
    AND v_trial_ended IS NOT NULL
    AND v_trial_ended > NOW();

  v_limit := CASE
    WHEN v_is_trialing THEN 100000
    WHEN v_plano = 'enterprise' THEN 100000
    WHEN v_plano = 'pro' THEN 200
    WHEN v_plano = 'starter' THEN 50
    ELSE 5
  END;

  INSERT INTO public.user_quotas (usuario_id, agente, mes, count)
    VALUES (v_usuario_id, p_agente, v_month, 0)
    ON CONFLICT (usuario_id, agente, mes) DO NOTHING;

  SELECT count INTO v_used
    FROM public.user_quotas
    WHERE usuario_id = v_usuario_id
      AND agente = p_agente
      AND mes = v_month
    FOR UPDATE;

  IF v_used >= v_limit THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'quota_exceeded',
      'plano', CASE WHEN v_is_trialing THEN 'enterprise' ELSE v_plano END,
      'limite', v_limit,
      'usado', v_used,
      'usuario_id', v_usuario_id
    );
  END IF;

  UPDATE public.user_quotas
    SET count = count + 1, updated_at = NOW()
    WHERE usuario_id = v_usuario_id
      AND agente = p_agente
      AND mes = v_month;

  RETURN jsonb_build_object(
    'ok', true,
    'usuario_id', v_usuario_id,
    'plano', CASE WHEN v_is_trialing THEN 'enterprise' ELSE v_plano END,
    'remaining', v_limit - v_used - 1,
    'limite', v_limit
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_charge TO authenticated;
