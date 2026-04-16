-- 004_referrals.sql
-- Sistema de indicação: "Indique um colega, ganhe 15 dias"
-- Cada usuario tem um codigo unico. Quando o indicado completa signup,
-- o indicante ganha 15 dias de bonus no trial/plano.

create table if not exists public.referrals (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references public.usuarios(id) on delete cascade,
  referred_id   uuid references public.usuarios(id) on delete set null,
  code          text not null unique,
  status        text not null default 'pending' check (status in ('pending', 'completed', 'expired')),
  reward_days   int not null default 15,
  reward_applied boolean not null default false,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

-- Indice para buscar por codigo (usado no signup)
create index if not exists idx_referrals_code on public.referrals(code);
-- Indice para listar indicacoes de um usuario
create index if not exists idx_referrals_referrer on public.referrals(referrer_id);

-- RLS: usuario so ve suas proprias indicacoes
alter table public.referrals enable row level security;

create policy "referrals_own_read"
  on public.referrals for select
  using (referrer_id = (
    select id from public.usuarios where auth_user_id = auth.uid()
  ));

create policy "referrals_own_insert"
  on public.referrals for insert
  with check (referrer_id = (
    select id from public.usuarios where auth_user_id = auth.uid()
  ));

-- Adiciona coluna de codigo de indicacao no perfil do usuario
alter table public.usuarios
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references public.usuarios(id);
