# LexAI — Analise de Agentes + Roadmap de Features

**Data:** 2026-04-09
**Objetivo:** Analisar os 10 agentes atuais, identificar gaps e propor features que agreguem valor real para escritorios juridicos e alunos de faculdade — com estratificacao por plano (Starter / Pro / Enterprise).

---

## 1. Estado atual — os 10 agentes

| # | Agente | Papel | Publico forte |
|---|--------|-------|---------------|
| 1 | **Chat** | Orquestrador (roteia para especialistas ou responde direto) | Ambos |
| 2 | **Resumidor** | Analisa contratos, acordaos, peticoes | Escritorios |
| 3 | **Redator** | Gera pecas processuais estruturadas | Escritorios |
| 4 | **Pesquisador** | Jurisprudencia do STF, STJ, tribunais | Ambos |
| 5 | **Negociador** | BATNA, ZOPA, estrategia de acordo | Escritorios |
| 6 | **Professor** | Aulas em 3 niveis + questoes OAB | Alunos |
| 7 | **Calculador** | Prazos, correcao, juros, custas | Escritorios |
| 8 | **Legislacao** | Artigos de lei explicados | Ambos |
| 9 | **Rotina** | Agenda e organizacao | Escritorios |
| 10 | **Planilhas** | Timesheet, controle de honorarios | Escritorios |

**Pontos fortes:**
- Cobertura horizontal ampla — cobre analise, redacao, pesquisa, calculo, organizacao.
- Chat orquestrador e diferencial real.
- Professor ja agrega valor enorme para preparacao de OAB.

**Gaps criticos identificados:**

1. **Zero conexao a dados atuais dos tribunais** — Pesquisador usa conhecimento da IA, nao puxa andamentos reais via CNJ DataJud (API publica gratuita).
2. **Zero OCR** — PDFs escaneados (metade dos documentos de tribunal) nao podem ser analisados.
3. **Zero conceito de cliente/caso** — historico e linear, escritorio nao consegue organizar "tudo do cliente X".
4. **Zero banco estruturado de questoes OAB** — Professor gera questoes on-the-fly, sem progressao, sem dificuldade adaptativa, sem repeticao espacada.
5. **Zero comparador de versoes** — Redator cria peca nova, mas nao mostra diff entre v1 e v2 de um contrato.
6. **Zero extracao automatica de prazos** — Prazos e 100% manual; emails do tribunal nao geram prazos automaticamente.
7. **Zero exportacao profissional** — saida e texto puro. Sem DOCX com papel timbrado, sem PDF com cabecalho de escritorio.
8. **Zero modo colaborativo** — hoje e single-user. Escritorio de 5 advogados precisa de 5 contas separadas.
9. **Zero integracao Gmail/Calendar** — temos Gmail MCP disponivel, mas nenhuma feature usa.
10. **Zero gamificacao para alunos** — sem streak, sem XP, sem metas diarias — feature basica de retencao em produto de estudo.

---

## 2. Features propostas — ESCRITORIOS JURIDICOS

### 2.1 Pastas de Casos (CRM-lite juridico)  **Pro**
Nova tabela `casos`: cliente, numero do processo CNJ, valor da causa, fase atual, tags. Cada interacao do historico pode ser anexada a um caso. Timeline visual por caso. Busca global "tudo do cliente X". Dashboard de casos ativos.

**Impacto:** transforma LexAI de "ferramenta pontual" em "centro operacional do escritorio". Retencao multiplica.

**Esforco tecnico:** Medio (1-2 semanas) — nova tabela, UI de listagem, integracao com historico existente.

---

### 2.2 Integracao CNJ DataJud  **Pro**
API publica do CNJ (gratuita, sem keys). Botao "puxar do CNJ" no Pesquisador/Prazos: digite numero do processo → baixa andamentos, partes, ultima movimentacao. Avisa automaticamente se houve movimentacao nova desde a ultima consulta.

**Impacto:** elimina trabalho manual de checar andamento em 20 tribunais diferentes. Feature matadora para reter advogados litigantes.

**Esforco:** Medio-baixo — API publica, sem autenticacao. 3-5 dias de implementacao.

---

### 2.3 OCR de PDFs Escaneados  **Starter**
Muitos tribunais ainda mandam PDF como imagem (nao texto). Hoje, o Resumidor falha silenciosamente nesses casos. Solucao: detectar automaticamente se o PDF e imagem e rodar OCR via Anthropic Vision ou Tesseract.js (client-side, zero custo).

**Impacto:** desbloqueia ~40% dos documentos reais que hoje nao funcionam. Zero atrito para o usuario.

**Esforco:** Baixo — integracao simples, 2-3 dias.

---

### 2.4 Comparador de Versoes (Redline)  **Pro**
Colar/anexar 2 versoes de contrato ou peticao. Mostra diff visual (igual GitHub) com explicacao IA das mudancas. Exporta comparativo em PDF para cliente revisar.

**Impacto:** escritorio ganha horas em revisao de contratos. Feature que agencias corporativas pagariam caro.

**Esforco:** Medio — diff library + UI, 1 semana.

---

### 2.5 Risk Score no Resumidor  **Pro**
Apos analise de documento, IA da score 0-100 de risco juridico. Probabilidade de sucesso estimada (com disclaimer). Pontos de atencao destacados. Grafico visual para apresentar ao cliente.

**Impacto:** insight executivo em 1 segundo. Advogado leva direto para cliente sem precisar traduzir.

**Esforco:** Baixo — mudanca no prompt do Resumidor + componente visual. 3 dias.

---

### 2.6 Time Tracking + Relatorio de Horas  **Starter**
Botao "iniciar cronometro" em qualquer agente. Timer associa tempo ao cliente/caso. Relatorio mensal exportavel (DOCX de nota fiscal).

**Impacto:** escritorio que cobra por hora para de usar Toggl + planilha separados. Tudo no LexAI.

**Esforco:** Medio — nova tabela, UI de timer, exportacao. 1 semana.

---

### 2.7 Templates Compartilhados  **Pro / Enterprise**
Biblioteca de templates de pecas por area (trabalhista, civel, tributario, familia). Cada template e um molde editavel. Usuario adiciona proprios. **Enterprise:** templates compartilhados no time do escritorio.

**Impacto:** reduz dependencia do Redator gerar do zero toda vez. Acelera workflow repetitivo.

**Esforco:** Baixo — tabela + UI de CRUD + um seeder com 20 templates iniciais. 4 dias.

---

### 2.8 Colaboracao Multi-Usuario  **Enterprise**
Workspaces/escritorios com multiplos advogados. Cada advogado tem login proprio mas compartilha casos, templates e documentos. Permissoes (socio/associado/estagiario). Activity feed do escritorio.

**Impacto:** de 1 usuario para 10 no mesmo escritorio. ARPU multiplica por 5-10x.

**Esforco:** Alto — tabelas de orgs + RLS complexa + UI de convites. 2-3 semanas.

---

### 2.9 Email Parser (Gmail MCP)  **Enterprise**
Conecta Gmail → detecta emails do tribunal ou advogado adversario. Extrai prazos e cria automaticamente em Prazos. Alertas: "tribunal mandou despacho, voce tem 15 dias".

**Impacto:** zero trabalho manual de transcrever prazos. Elimina risco de perder prazo por esquecimento.

**Esforco:** Medio — MCP ja existe no ambiente, precisa UI de setup + parser. 1 semana.

---

### 2.10 Exportacao Profissional (DOCX/PDF)  **Starter**
Hoje Redator gera texto puro. Nova opcao: exportar em DOCX com papel timbrado, fonte profissional, margens ABNT, cabecalho customizavel por escritorio. PDF assinado digitalmente (ICP-Brasil opcional).

**Impacto:** peca pronta para protocolo, zero edicao no Word.

**Esforco:** Medio — biblioteca docx.js + UI de configuracao de cabecalho. 1 semana.

---

## 3. Features propostas — ALUNOS DE FACULDADE

### 3.1 Simulado OAB Adaptativo  **Pro**
Banco de 2000+ questoes (geradas pelo Professor + cache em DB). Sistema adaptativo via Elo rating: acertou dificil → recebe dificil; errou facil → recebe facil do mesmo tema. Materias separadas (Civil, Penal, Trabalhista, Const, etc). Relatorio: "voce domina X, precisa revisar Y". Contagem regressiva para proxima prova OAB.

**Impacto:** substitui cursinhos como QC Concurso e Estrategia OAB (ticket de R$ 100-300/mes). LexAI fica a R$ 119 e entrega isso + tudo mais.

**Esforco:** Medio-alto — seed de questoes + algoritmo adaptativo + UI de simulado. 2 semanas.

---

### 3.2 Flashcards com Spaced Repetition  **Pro**
Algoritmo SM-2 (usado pelo Anki, padrao ouro da memorizacao). Professor gera flashcards automaticos de qualquer aula. Aluno revisa N cartas/dia; cartas dificeis aparecem mais. Contagem de dominadas/total. Deck por materia.

**Impacto:** retencao de conhecimento 3-5x maior que releitura passiva. Feature matadora de produto de estudo.

**Esforco:** Medio — algoritmo e simples (SM-2 em 30 linhas), tabela nova, UI de revisao. 1 semana.

---

### 3.3 Plano de Estudos IA  **Pro**
Wizard: "vou fazer OAB em 60 dias, tenho 4h/dia". IA gera cronograma detalhado: "Dia 1: Const art 1-5 (1h) + Civil art 100-120 (2h) + simulado 20 questoes (1h)". Ajusta conforme desempenho. Notificacoes push quando faltam dias.

**Impacto:** fim da paralisia "por onde comecar?". Aluno chega sem plano e sai com mapa diario.

**Esforco:** Baixo — prompt + geracao estruturada + UI de calendario. 4 dias.

---

### 3.4 Mapa de Dominio (Heat Map)  **Pro**
Visualizacao em grid: materias como linhas, subtemas como colunas. Cor indica nivel de dominio (baseado em % de acertos). Drill-down clicavel. Recomendacoes: "estude Direito Empresarial".

**Impacto:** autodiagnostico visual — aluno ve no relance onde esta fraco.

**Esforco:** Baixo — grafico CSS + agregacao de simulados. 3 dias (depende do 3.1 estar pronto).

---

### 3.5 Streak Gamificado  **Starter**
Dias consecutivos estudando. Metas diarias (30 questoes / 2 aulas / 20 flashcards). XP e niveis (Estudante → Estagiario → Bacharel → Advogado → Jurista). Leaderboard semanal opcional (opt-in).

**Impacto:** retencao diaria. Produto de estudo sem streak perde 60% dos usuarios no primeiro mes.

**Esforco:** Baixo — tabela + logica de contagem + componente visual. 4 dias.

---

### 3.6 Caderno de Estudos  **Starter**
Qualquer resposta do Professor tem botao "salvar no caderno". Cadernos organizados por materia. Highlighting. Exporta PDF ou DOCX para imprimir.

**Impacto:** substitui Evernote/Notion para estudos — aluno nao precisa de 3 ferramentas.

**Esforco:** Baixo — tabela + UI de CRUD + editor basico. 5 dias.

---

### 3.7 Revisao de Peca / Redacao  **Pro**
Aluno cola redacao (ex: peca processual da 2a fase OAB). IA avalia: gramatica, estrutura juridica, argumentacao, pontuacao (rubrica FGV). Da nota e explica cada deducao.

**Impacto:** fim de "sera que esta bom?". Feedback instantaneo na preparacao da 2a fase.

**Esforco:** Baixo — prompt especializado + componente de comentarios inline. 3 dias.

---

### 3.8 Aula em Audio (TTS)  **Pro**
Professor gera resumo em audio via ElevenLabs ou OpenAI TTS. Aluno ouve no carro/onibus. Playlist por materia.

**Impacto:** aproveita 1-2h/dia de tempo morto (commute). Feature rara em cursos tradicionais.

**Esforco:** Medio — integracao TTS + player + storage de audios. 1 semana.

---

### 3.9 Simulado 1a e 2a Fase OAB  **Pro**
1a fase: multipla escolha (5h, 80 questoes), timer real, ambiente fullscreen. 2a fase: peca processual + 4 dissertativas (5h). Correcao automatica com rubrica. Historico de simulados.

**Impacto:** treino realistico. Aluno chega na prova real ja tendo feito 10 simulados sob pressao.

**Esforco:** Medio — depende do banco de questoes (3.1). UI de simulado fullscreen. 1 semana.

---

### 3.10 Calendario de Concursos  **Starter**
Datas de OAB, concursos de Magistratura, MP, Procuradorias, Defensorias. Alerta quando abre inscricao. Link do edital. Filtro por cargo/estado.

**Impacto:** aluno nunca perde prazo de inscricao. Feature de aquisicao tambem (SEO: "calendario concursos juridicos 2026").

**Esforco:** Baixo — seed de datas + UI de calendario. 3 dias.

---

## 4. Estratificacao em planos

### Starter — R$ 59/mes
**Foco:** individual, comecando. Suficiente pra testar tudo.

- Todos os 10 agentes (quotas limitadas: 20 interacoes/dia)
- OCR de PDFs (2.3)
- Time tracking basico (2.6)
- Exportacao DOCX profissional (2.10)
- Streak gamificado (3.5)
- Caderno de estudos (3.6)
- Calendario de concursos (3.10)

### Pro — R$ 119/mes
**Foco:** advogado serio OU aluno preparando OAB. Plano estrela.

- Tudo do Starter (quotas: 100 interacoes/dia)
- Pastas de Casos (CRM-lite) — 2.1
- Integracao CNJ DataJud — 2.2
- Comparador de versoes — 2.4
- Risk Score no Resumidor — 2.5
- Templates pessoais — 2.7
- Simulado OAB adaptativo — 3.1
- Flashcards SRS — 3.2
- Plano de Estudos IA — 3.3
- Mapa de Dominio — 3.4
- Revisao de peca/redacao — 3.7
- Aula em audio (TTS) — 3.8
- Simulado 1a e 2a fase OAB — 3.9

### Enterprise — R$ 239/mes (por usuario em time)
**Foco:** escritorio de 5+ advogados.

- Tudo do Pro (quotas ilimitadas)
- Colaboracao multi-usuario (ate 10) — 2.8
- Templates compartilhados no time — 2.7
- Email Parser via Gmail — 2.9
- API publica para integracoes
- SLA + suporte prioritario
- Dashboard agregado do escritorio
- Relatorio mensal de produtividade

---

## 5. Roadmap sugerido (fases)

### Fase 1 — Quick Wins (2-3 semanas)
Features simples com alto impacto. Ordem de execucao:

1. **OCR de PDFs** (2.3) — desbloqueia 40% dos casos que hoje falham
2. **Streak + Caderno de estudos** (3.5 + 3.6) — engagement basico
3. **Calendario de concursos** (3.10) — SEO + aquisicao
4. **Risk Score no Resumidor** (2.5) — so prompt + componente
5. **Exportacao DOCX profissional** (2.10) — peca pronta pra protocolo

### Fase 2 — Retencao (mes 2)
Features que transformam LexAI em operacao central:

1. **Pastas de Casos** (2.1) — core feature de retencao para escritorios
2. **Flashcards SRS** (3.2) — core feature de retencao para alunos
3. **Plano de Estudos IA** (3.3) — onboarding de aluno novo
4. **Time Tracking** (2.6) — feature pedida por todo escritorio

### Fase 3 — Diferenciacao (mes 3)
Features que criam moat competitivo:

1. **Integracao CNJ DataJud** (2.2) — ninguem mais faz isso bem
2. **Simulado OAB adaptativo** (3.1) — substitui QC Concursos
3. **Simulado 1a e 2a fase** (3.9) — treino realistico
4. **Mapa de Dominio** (3.4) — depende do 3.1
5. **Comparador de versoes** (2.4) — feature corporativa
6. **Revisao de peca/redacao** (3.7) — feedback instantaneo

### Fase 4 — Escala (mes 4+)
Features Enterprise e integracoes:

1. **Multi-usuario / colaboracao** (2.8)
2. **Templates compartilhados no time** (2.7)
3. **Email Parser** (2.9)
4. **Aula em audio TTS** (3.8)
5. **API publica**

---

## 6. Metricas para acompanhar

### Escritorios
- % de usuarios com >1 caso cadastrado
- Media de interacoes/semana por caso ativo
- % convertendo de Pro para Enterprise
- Churn mensal por plano

### Alunos
- Streak medio em dias
- % completando 1 simulado/semana
- Cards revisados por aluno por dia
- Retencao 30 dias pos-onboarding
- Conversao free → Pro apos primeira simulada

---

## 7. Decisoes pendentes para o Leonardo

1. **Banco de questoes OAB:** gerar sinteticamente via Professor ou licenciar de provedor? (Custo vs qualidade)
2. **TTS provider:** ElevenLabs (mais natural, mais caro) ou OpenAI TTS (barato, voz razoavel)?
3. **Multi-usuario:** comecar por Enterprise ou abrir para Pro tambem com limite de 2?
4. **CNJ DataJud:** rate limit da API publica pode virar gargalo — vale criar cache no Supabase?
5. **Preco Enterprise por usuario:** R$ 239 e pro primeiro seat ou por seat? (Mudaria economica).
