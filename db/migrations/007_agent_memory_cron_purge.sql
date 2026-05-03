-- ───────────────────────────────────────────────────────────────────
-- Migration 007 — Cron purge automático de agent_memory expirada
-- ───────────────────────────────────────────────────────────────────
-- Sem este job, expires_at em agent_memory vira metadata sem efeito —
-- ninguem apaga, tabela cresce sem teto. Audit elite (review 2026-05-03)
-- detectou: pg_cron nao habilitado em PROD.
--
-- Job: roda 03:00 UTC diario (horario de baixo trafego BR).
-- DELETE simples — RLS bypassed em pg_cron context (SUPERUSER).
-- ───────────────────────────────────────────────────────────────────

create extension if not exists pg_cron;

-- Idempotente: remove job antigo (mesmo nome) antes de recriar.
do $$
declare
  existing_jobid bigint;
begin
  select jobid into existing_jobid
  from cron.job
  where jobname = 'purge_agent_memory_daily'
  limit 1;

  if existing_jobid is not null then
    perform cron.unschedule(existing_jobid);
  end if;
end $$;

select cron.schedule(
  'purge_agent_memory_daily',
  '0 3 * * *',  -- 03:00 UTC diario (~ 00:00 BRT)
  $$ delete from public.agent_memory where expires_at < now() $$
);

comment on extension pg_cron is
  'pg_cron habilitado para purge automatico de agent_memory (TTL 90d). Adicionado por migration 007 em 2026-05-03 apos audit elite.';
