-- Expand historico.agente CHECK to include all agents actually used by the 7 API routes.
-- Previously: resumidor, prazos, redator, pesquisador, financeiro, rotina, orquestrador
-- Missing but used by code: professor, calculador, legislacao, negociador
-- Without this, every historico insert from ensinar/calcular/legislacao/negociar
-- would fail the CHECK and return 500 to the user.
DO $$
BEGIN
  ALTER TABLE public.historico DROP CONSTRAINT IF EXISTS historico_agente_check;
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE public.historico
  ADD CONSTRAINT historico_agente_check
  CHECK (agente = ANY (ARRAY[
    'resumidor'::text,
    'pesquisador'::text,
    'redator'::text,
    'professor'::text,
    'calculador'::text,
    'legislacao'::text,
    'negociador'::text,
    'prazos'::text,
    'rotina'::text,
    'financeiro'::text,
    'orquestrador'::text
  ]));
