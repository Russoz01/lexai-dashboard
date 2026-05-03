-- ───────────────────────────────────────────────────────────────────
-- Migration 012 — search_path = '' lockdown em 7 funcoes
-- ───────────────────────────────────────────────────────────────────
-- Audit elite (2026-05-03): 7 funcoes nao tinham SET search_path = ''
-- explicito. Risco: atacante com CREATE em qualquer schema do search_path
-- (geralmente public) cria objeto malicioso (ex: tabela `usuarios` em
-- schema temp) que sequestra a referencia nao-qualificada dentro da
-- funcao. Vetor classico de privilege escalation em PG.
--
-- Mitigation:
--  1. ALTER FUNCTION ... SET search_path = '' em todas.
--  2. CREATE OR REPLACE com TODOS object refs internos qualificados
--     com schema explicito (public.usuarios, public.audit_logs, etc).
--
-- Funcoes corrigidas:
--  - public.set_updated_at        (trigger trivial — so seta NEW.updated_at)
--  - leadora.set_updated_at       (trigger trivial)
--  - public.update_oauth_tokens_updated_at (trigger trivial)
--  - public.touch_updated_at      (trigger trivial)
--  - public.log_audit             (INSERT em audit_logs — qualifica)
--  - public.limpar_sessoes_expiradas (DELETE em sessoes — qualifica)
--  - public.verificar_rate_limit  (SELECT/INSERT/UPDATE em rate_limits — qualifica)
--
-- Triggers triviais (set_updated_at/touch_updated_at/update_oauth_tokens)
-- nao referenciam objeto algum, so manipulam NEW. Mesmo assim search_path
-- = '' eh defensa em profundidade caso algum dia adicione lookup.
--
-- Idempotente: ALTER FUNCTION SET sobrescreve setting; CREATE OR REPLACE
-- substitui body.
-- ───────────────────────────────────────────────────────────────────

-- ─── Triggers triviais — apenas ALTER SET search_path ────────────────
alter function public.set_updated_at() set search_path = '';
alter function leadora.set_updated_at() set search_path = '';
alter function public.update_oauth_tokens_updated_at() set search_path = '';
alter function public.touch_updated_at() set search_path = '';

-- ─── log_audit — reescreve com schema qualificado ────────────────────
create or replace function public.log_audit(
  p_usuario_id uuid,
  p_acao text,
  p_recurso text default null,
  p_recurso_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.audit_logs (usuario_id, acao, recurso, recurso_id, metadata)
  values (p_usuario_id, p_acao, p_recurso, p_recurso_id, p_metadata);
end;
$function$;

-- ─── limpar_sessoes_expiradas — reescreve com schema qualificado ─────
create or replace function public.limpar_sessoes_expiradas()
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_count integer;
begin
  delete from public.sessoes where expires_at < now() or revogada = true;
  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;

-- ─── verificar_rate_limit — reescreve com schema qualificado ─────────
create or replace function public.verificar_rate_limit(
  p_chave text,
  p_max_req integer default 10,
  p_janela_seg integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_row public.rate_limits%rowtype;
begin
  select * into v_row from public.rate_limits where chave = p_chave;

  if not found then
    insert into public.rate_limits (chave, requisicoes, janela_inicio)
    values (p_chave, 1, now());
    return true;
  end if;

  -- Janela expirou → reset
  if v_row.janela_inicio + (p_janela_seg * interval '1 second') < now() then
    update public.rate_limits
    set requisicoes = 1, janela_inicio = now(), bloqueado_ate = null
    where chave = p_chave;
    return true;
  end if;

  -- Ainda bloqueado
  if v_row.bloqueado_ate is not null and v_row.bloqueado_ate > now() then
    return false;
  end if;

  -- Limite atingido → bloquear por 5 min
  if v_row.requisicoes >= p_max_req then
    update public.rate_limits
    set bloqueado_ate = now() + interval '5 minutes'
    where chave = p_chave;
    return false;
  end if;

  -- Incrementar
  update public.rate_limits set requisicoes = requisicoes + 1 where chave = p_chave;
  return true;
end;
$function$;

-- ─── Re-aplica grants apos CREATE OR REPLACE ─────────────────────────
-- CREATE OR REPLACE preserva ACL, mas defensivo: garante service_role only
-- alinhado com migration 008.
revoke execute on function public.log_audit(uuid, text, text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.log_audit(uuid, text, text, uuid, jsonb) to service_role;

revoke execute on function public.limpar_sessoes_expiradas() from public, anon, authenticated;
grant execute on function public.limpar_sessoes_expiradas() to service_role;

revoke execute on function public.verificar_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.verificar_rate_limit(text, integer, integer) to service_role;

comment on function public.log_audit(uuid, text, text, uuid, jsonb) is
  'SECURITY DEFINER + search_path = '''' + schema-qualified refs. service_role only. Migrations 008 + 012 (2026-05-03).';

comment on function public.verificar_rate_limit(text, integer, integer) is
  'SECURITY DEFINER + search_path = '''' + schema-qualified refs. service_role only. Legacy — usar increment_rate_limit_atomic. Migrations 008 + 012 (2026-05-03).';
