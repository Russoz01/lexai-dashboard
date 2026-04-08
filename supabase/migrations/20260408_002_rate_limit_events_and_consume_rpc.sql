-- Event-based rate limit table + atomic sliding-window RPC.
--
-- The existing public.rate_limits table uses a different counter-based model
-- (chave/requisicoes/janela_inicio/bloqueado_ate) and is not wired to any code.
-- We intentionally leave it untouched and introduce rate_limit_events for the
-- new RPC so the previously-planned work can roll forward non-destructively.
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_key_created
  ON public.rate_limit_events (key, created_at DESC);

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

-- consume_rate_limit: atomic count + insert in a single RPC. Eliminates the
-- classic check-then-insert race where N concurrent callers can all pass a
-- max-N check and all insert.
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key TEXT,
  p_window_seconds INT DEFAULT 60,
  p_max INT DEFAULT 20
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_oldest TIMESTAMPTZ;
BEGIN
  -- Housekeeping: drop events older than the current window.
  DELETE FROM public.rate_limit_events
    WHERE key = p_key
      AND created_at < NOW() - (p_window_seconds || ' seconds')::interval;

  SELECT COUNT(*), MIN(created_at)
    INTO v_count, v_oldest
    FROM public.rate_limit_events
    WHERE key = p_key;

  IF v_count >= p_max THEN
    RETURN jsonb_build_object(
      'ok', false,
      'remaining', 0,
      'reset_in_seconds',
        GREATEST(1, EXTRACT(EPOCH FROM
          (v_oldest + (p_window_seconds || ' seconds')::interval - NOW()))::INT)
    );
  END IF;

  INSERT INTO public.rate_limit_events (key) VALUES (p_key);

  RETURN jsonb_build_object(
    'ok', true,
    'remaining', p_max - v_count - 1,
    'reset_in_seconds', p_window_seconds
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_rate_limit TO authenticated, anon;
