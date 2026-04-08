-- Observability table for per-call cost, tokens, latency, success/failure.
-- Enables queries like "what's our Haiku cost per user this month?" and
-- lets the route factory record failures (previously silently lost in catch {}).
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  agente TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_input INT NOT NULL DEFAULT 0,
  tokens_output INT NOT NULL DEFAULT 0,
  cache_read_tokens INT NOT NULL DEFAULT 0,
  cache_write_tokens INT NOT NULL DEFAULT 0,
  latencia_ms INT NOT NULL,
  sucesso BOOLEAN NOT NULL,
  erro_tipo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_usuario_created
  ON public.agent_runs (usuario_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agente_created
  ON public.agent_runs (agente, created_at DESC);

ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own runs" ON public.agent_runs;
CREATE POLICY "users read own runs" ON public.agent_runs
  FOR SELECT
  USING (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid()));
