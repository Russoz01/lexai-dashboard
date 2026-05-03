-- ───────────────────────────────────────────────────────────────────
-- Migration 009 — leads anti-spam (validacao + dedup)
-- ───────────────────────────────────────────────────────────────────
-- Audit elite (2026-05-03): policy "leads: insercao publica" tinha
-- WITH CHECK (true) — qualquer um, sem rate limit, podia floodar a
-- tabela leads com emails arbitrarios. Risco: spam massivo, custo de
-- storage, polui funil de vendas.
--
-- Esta migration:
--  1. DROP da policy permissiva.
--  2. CREATE policy anon-insert com WITH CHECK validando:
--       - email match regex RFC 5322 simplificado
--       - length(email) entre 5 e 254 (RFC 5321 max)
--       - created_at recente (now() - interval '5 minutes' a now())
--  3. UNIQUE constraint via index em (lower(email), date_trunc('hour', created_at))
--     pra dedup automatico — atacante nao consegue inserir 1000x o mesmo
--     email na mesma hora.
--
-- IMPORTANTE: mantem leads_self_all (auth.uid() = user_id) intacto para
-- usuarios autenticados editarem seus proprios leads.
--
-- Idempotente.
-- ───────────────────────────────────────────────────────────────────

-- ─── Drop policy permissiva ──────────────────────────────────────────
drop policy if exists "leads: inserção pública" on public.leads;
drop policy if exists "leads_anon_insert_validated" on public.leads;

-- ─── Nova policy anon-insert com validacao ───────────────────────────
create policy leads_anon_insert_validated on public.leads
  for insert
  to anon
  with check (
    -- email format (RFC 5322 simplificado)
    email ~* '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
    -- length entre 5 (a@b.c) e 254 (RFC 5321)
    and length(email) between 5 and 254
    -- created_at obrigatoriamente recente — bloqueia backdating
    and created_at >= now() - interval '5 minutes'
    and created_at <= now() + interval '1 minute'
  );

-- ─── Dedup automatico: 1 email por hora ──────────────────────────────
-- Index unique funcional — atacante que tentar floodar com mesmo email
-- bate em ON CONFLICT, INSERT falha. Combinado com policy acima
-- (5 min window), efetivamente limita a ~12 inserts/hora por email.
--
-- NOTA: date_trunc/extract com timestamptz nao sao IMMUTABLE (dependem do
-- timezone da sessao). Solucao: funcao wrapper IMMUTABLE que internamente
-- converte pra UTC e retorna epoch/3600 (hora-bucket).

create or replace function public.leads_hour_bucket(ts timestamptz)
returns bigint
language sql
immutable
parallel safe
set search_path = ''
as $function$
  select floor(extract(epoch from ts at time zone 'UTC') / 3600)::bigint
$function$;

revoke execute on function public.leads_hour_bucket(timestamptz) from public, anon, authenticated;
grant execute on function public.leads_hour_bucket(timestamptz) to anon, authenticated, service_role;

create unique index if not exists leads_email_hour_unique
  on public.leads (lower(email), public.leads_hour_bucket(created_at));

comment on policy leads_anon_insert_validated on public.leads is
  'Anon insert com validacao email + length + created_at recente. Substitui "leads: insercao publica" (WITH CHECK true). Audit 2026-05-03 (migration 009).';

comment on index public.leads_email_hour_unique is
  'Dedup automatico — 1 lead por email por hora. Anti-flood. Audit 2026-05-03 (migration 009).';
