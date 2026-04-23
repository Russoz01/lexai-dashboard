-- ───────────────────────────────────────────────────────────────────
-- Migration 005 — Default legal practice area per user
-- ───────────────────────────────────────────────────────────────────
-- Adds `area_juridica_padrao` to `usuarios` so every agent/prompt pode
-- se auto-calibrar pela área principal do advogado.
--
-- v10.10 Phase 4: enum constraint aceita apenas os 10 slugs canônicos
-- definidos em src/lib/agents/taxonomy.ts. Novos valores exigem bump
-- de migration + atualização do CHECK.
--
-- Comportamento:
--  - Opcional (nullable). Advogado que ainda não escolheu → null.
--  - Prompts e AreaSelector lidam com null como "não configurado".
--  - Não bloqueia fluxo existente — é enriquecimento.
-- ───────────────────────────────────────────────────────────────────

alter table public.usuarios
  add column if not exists area_juridica_padrao text;

-- Só aplica o CHECK se ele ainda não existir (migration idempotente).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'usuarios_area_juridica_padrao_check'
  ) then
    alter table public.usuarios
      add constraint usuarios_area_juridica_padrao_check
      check (area_juridica_padrao is null or area_juridica_padrao in (
        'civel',
        'familia',
        'trabalhista',
        'penal',
        'tributario',
        'consumidor',
        'empresarial',
        'imobiliario',
        'previdenciario',
        'administrativo'
      ));
  end if;
end $$;

comment on column public.usuarios.area_juridica_padrao is
  'Area principal de atuacao do advogado (v10.10). Slug canonico de src/lib/agents/taxonomy.ts. NULL = nao configurado.';
