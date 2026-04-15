-- ───────────────────────────────────────────────────────────────────
-- Migration 003 — Trial reminder idempotency column
-- ───────────────────────────────────────────────────────────────────
-- Adds `trial_reminders_sent` to `usuarios` so the /api/cron/trial-reminder
-- job can remember which reminder windows it already sent for each user.
--
-- Shape: { "d3": true, "d1": true }  — keys are 'd<days_before_end>'.
-- Defaults to empty object so NULL-checks aren't needed downstream.
-- ───────────────────────────────────────────────────────────────────

alter table public.usuarios
  add column if not exists trial_reminders_sent jsonb not null default '{}'::jsonb;

comment on column public.usuarios.trial_reminders_sent is
  'Tracks which trial-ending reminders we have already sent. Keys: d3, d1.';
