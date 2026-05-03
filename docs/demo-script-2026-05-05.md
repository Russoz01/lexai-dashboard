# Roteiro de Demo Pralvex — 2026-05-05

> Documento operacional pra Leonardo conduzir demo segunda-feira.
> Audit elite v4 #7 (2026-05-03). Editar livremente conforme prospect.

## Pre-demo (T-30min)

- [ ] Abrir aba pralvex.com.br em chrome anonimo (sem cache de sessao logada)
- [ ] Login como demo-user@pralvex.com.br (criar conta fresh se preciso)
- [ ] Verificar /status: latencia <200ms, todos 22 agentes operational
- [ ] Carregar Anthropic console em aba separada — confirmar que API key ativa, sem 401
- [ ] Abrir Sentry dashboard em aba separada (pra ver erros em tempo real)
- [ ] Ter PDF de **contrato real anonimizado** (rename: `contrato-demo.pdf`) no Desktop
- [ ] Ter 1 caso real anonimizado pra Pesquisador (ex: tese de prescricao trienal)
- [ ] Notebook conectado em fonte AC + WiFi backup (4G hotspot do celular)
- [ ] Stripe sandbox aberto pra mostrar checkout sem cobrar (cartao 4242 4242 4242 4242)

## Estrutura — 3 atos × 5min cada (15-20min total)

### Ato 1 — Resumidor + analise contratual (5min)

**Setup**: dashboard, agente Resumidor selecionado.

1. "Voces analisam contrato manualmente — quanto tempo leva pra extrair clausulas criticas de um contrato de 30 paginas?"
2. Drag-drop `contrato-demo.pdf` no Resumidor.
3. Aguardar 30-60s — o stream NDJSON mostra progresso em tempo real.
4. Resultado: resumo executivo + lista de clausulas + risco contratual.
5. **Hook**: "isso aqui levou 47 segundos. Voce gastaria 40 minutos."

**Talking points**:
- Documento NUNCA sai do browser — parsing client-side via pdf-parser.ts
- Texto so vai pra IA via Anthropic Sonnet 4 (LGPD compliant)
- Memoria do agente fica isolada por usuario (RLS Postgres)

### Ato 2 — Pesquisador + jurisprudencia (5min)

**Setup**: navegar pra agente Pesquisador.

1. Input: "tese de prescricao trienal em acao de cobranca de honorarios advocaticios"
2. Aguardar 60-80s — stream mostra progresso ("buscando jurisprudencia...", "filtrando STJ/STF...")
3. Resultado: 3-5 acordaos com ementa + tribunal + data + link real
4. **Hook**: "Astrea cobra R$1.379 por usuario com mesmo banco que o nosso. A diferenca e que aqui o agente entrega tese pronta pra colar na peca."

**Talking points**:
- Web search ativo via Anthropic — busca jurisprudencia NOVA, nao apenas ate cutoff
- Cita ementa + link rastreavel (nunca alucina precedente)
- Funciona pra direito civil, trabalhista, tributario, previdenciario

### Ato 3 — Redator + peca processual (5-7min)

**Setup**: navegar pra agente Redator.

1. Input: copiar/colar 1 paragrafo dos fatos do caso real
2. Selecionar tipo: "peticao inicial — acao de cobranca"
3. Stream: ve a peca sendo escrita ao vivo, paragrafo por paragrafo
4. Resultado: peca completa com fundamentacao + jurisprudencia + pedido
5. **Hook**: "voce edita o que quiser — ela ja vem pronta pra protocolar."

**Talking points**:
- Modelo Anthropic Sonnet 4 com max_tokens 8192 (rascunho longo)
- Suporta apelacao, agravo, embargos, contestacao via outros agentes
- Memoria persiste entre sessoes — proxima peca do mesmo caso ja conhece os fatos

## Backup plays (se algo travar)

**Se Anthropic 503**: AbortController cancela em 90s + mensagem humana ("query mais especifica?"). Plano B: trocar pra Resumidor (ja roda Haiku 4.5, mais rapido).

**Se Supabase down**: ja tem fallback demo-fallback.ts em alguns agentes. Mostra resultado pre-cacheado.

**Se WiFi cai**: hotspot 4G do celular. OfflineBanner.tsx avisa.

**Se prospect quer ver outros agentes**: navegar pelo Sidebar. Top 5 hardcoded (chat/resumidor/pesquisador/redator/calculador) sao garantidos.

## Pos-demo (T+10min)

1. **Pricing reveal**: navegar /planos. Anchor pricing reorder ja deixa Enterprise R$1.599 visivel primeiro.
2. **Comparison Astrea**: "Astrea e R$1.379 por usuario, sem variar features. Pralvex Firma a 9 advogados sai R$13.131/mes mas com docs ilimitados + 22 agentes ativos + onboarding 1:1."
3. **Free trial**: "demo de 50 minutos — sem cartao. Login com Google, comeca em 30 segundos."
4. **Soft close**: "vou te mandar um email com acesso ao demo agora. Quanto tempo voce precisa pra testar com seus contratos reais?"

## Numeros-chave que voce DEVE saber de cabeca

- 22 agentes prontos hoje + 5 EM BREVE = 27 catalogados
- 4 modulos: Casos, CRM, Jurimetria, Marketing
- Solo R$599 (1 advogado) · Escritorio R$1.399 (1-5) · Firma R$1.459 (6-15) · Enterprise R$1.599 (16+)
- 17% off pagamento anual (quando habilitado — veja BILLING_ANNUAL flag)
- Trial 50min sem cartao
- LGPD Art. 18 cumprido — endpoint /api/preferences/purge-memory

## Riscos NAO mitigaveis ate segunda

- **Stripe annual prices**: 4 prices nao criados ainda. Se prospect pedir desconto anual NA HORA, dizer "vou criar plano custom hoje a noite e te mando link" — evita prometer e nao entregar.
- **OAB compliance copy**: footer ja menciona Provimento 205, mas se prospect for da OAB regional/seccional, pode questionar publicidade. Resposta: "voce decide o que postar — Marketing IA so gera rascunho conforme suas preferencias regionais."

## Apos demo — followup imediato

Email curto (60min apos):
> Leonardo, obrigado pelo tempo. Como prometi, link de acesso direto: [URL].
> Trial de 50 minutos esta ativo no seu nome. Qualquer travada, responde aqui.
> Em 48h envio comparativo personalizado vs ferramenta atual de voces.

CRM update (Pralvex dashboard /crm): criar lead com tag "demo-2026-05-05" + score 8.5 + next_action "follow-up 48h".
