-- ───────────────────────────────────────────────────────────────────
-- Migration 008 — REVOKE EXECUTE de SECURITY DEFINER + rls_auto_enable INVOKER
-- ───────────────────────────────────────────────────────────────────
-- Audit elite (2026-05-03) achou: 11 funcoes SECURITY DEFINER tinham
-- ACL `=X/postgres` (PUBLIC) + `anon=X` + `authenticated=X` — qualquer
-- visitante anon podia chamar qualquer SECURITY DEFINER e bypassar RLS
-- com privilegio do owner postgres.
--
-- Esta migration:
--  1. REVOKE EXECUTE FROM PUBLIC, anon, authenticated em todas as 10
--     funcoes SECURITY DEFINER perigosas.
--  2. GRANT EXECUTE TO service_role (sempre).
--  3. EXCECAO — mantem GRANT TO authenticated em 4 funcoes que tem
--     caller real autenticado client-side/server-side via anon/auth client:
--       - check_and_charge          (routes API /consultor /ensinar /compliance /simulado /tradutor)
--       - increment_quota           (src/lib/quotas.ts fallback)
--       - increment_rate_limit_atomic (src/lib/rate-limit.ts)
--       - increment_shared_doc_views (src/app/share/[token]/page.tsx)
--     `increment_shared_doc_views` MANTEM GRANT TO anon tambem porque a
--     pagina /share/[token] usa createPublicClient (anon key) — doc
--     publico via token, nao precisa auth.
--  4. rls_auto_enable: trocado pra SECURITY INVOKER — funcao roda em
--     event trigger DDL, perigosa com privilegio elevado. Event trigger
--     ja roda como superuser quando disparado por DDL, entao INVOKER eh
--     suficiente.
--
-- Funcoes restritas a service_role only (sem caller client/auth):
--   - log_audit
--   - limpar_sessoes_expiradas
--   - ensure_usuario_row (chamada via trigger no DB, nao via RPC client)
--   - consume_rate_limit (legacy — substituida por increment_rate_limit_atomic)
--   - verificar_rate_limit (legacy — substituida por increment_rate_limit_atomic)
--
-- Idempotente: REVOKE/GRANT sao idempotentes nativamente.
-- ───────────────────────────────────────────────────────────────────

-- ─── service_role only (5 funcoes) ───────────────────────────────────
revoke execute on function public.log_audit(uuid, text, text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.log_audit(uuid, text, text, uuid, jsonb) to service_role;

revoke execute on function public.limpar_sessoes_expiradas() from public, anon, authenticated;
grant execute on function public.limpar_sessoes_expiradas() to service_role;

revoke execute on function public.ensure_usuario_row() from public, anon, authenticated;
grant execute on function public.ensure_usuario_row() to service_role;

revoke execute on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

revoke execute on function public.verificar_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.verificar_rate_limit(text, integer, integer) to service_role;

-- ─── service_role + authenticated (3 funcoes com caller server-side) ──
revoke execute on function public.check_and_charge(uuid, text) from public, anon;
grant execute on function public.check_and_charge(uuid, text) to authenticated, service_role;

revoke execute on function public.increment_quota(uuid, text) from public, anon;
grant execute on function public.increment_quota(uuid, text) to authenticated, service_role;

revoke execute on function public.increment_rate_limit_atomic(text, integer, integer) from public, anon;
grant execute on function public.increment_rate_limit_atomic(text, integer, integer) to authenticated, service_role;

-- ─── service_role + authenticated + anon (1 funcao public-share) ─────
-- increment_shared_doc_views: pagina /share/[token] eh publica (anon),
-- usa createPublicClient. Mantem anon GRANT — funcao valida token interno
-- e so incrementa views, nao expoe dados.
revoke execute on function public.increment_shared_doc_views(text) from public;
grant execute on function public.increment_shared_doc_views(text) to anon, authenticated, service_role;

-- ─── rls_auto_enable: SECURITY DEFINER → SECURITY INVOKER ────────────
-- Event trigger DDL — roda como superuser quando DDL dispara, INVOKER
-- nao reduz capacidade mas remove privilege escalation se chamada
-- diretamente. Tambem revoga EXECUTE de tudo exceto service_role.
alter function public.rls_auto_enable() security invoker;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
grant execute on function public.rls_auto_enable() to service_role;

comment on function public.log_audit(uuid, text, text, uuid, jsonb) is
  'SECURITY DEFINER restrita a service_role apos audit 2026-05-03 (migration 008). Antes: callable por anon — bypass de RLS para inserir audit_logs falsos.';

comment on function public.rls_auto_enable() is
  'Event trigger DDL — auto-enable RLS em novas tabelas public. Trocado pra SECURITY INVOKER em migration 008 (2026-05-03) — antes era SECURITY DEFINER callable por anon, privilege escalation risk.';
