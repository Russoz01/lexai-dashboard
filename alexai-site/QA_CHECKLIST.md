# Alex AI — QA Checklist

Checklist rapido para rodar antes de cada deploy em producao. Serve pra
segurar regressao obvia antes de chegar em cliente. Marcar o que foi
verificado e anexar printscreen se tiver algo estranho.

Ambiente alvo: `https://alexai.com.br/` (producao) ou preview do Vercel.

---

## 1. Smoke test (1 min)

- [ ] A pagina carrega sem erro no console (F12 > Console)
- [ ] Nenhum recurso 404 na aba Network (F12 > Network, recarregar com Ctrl+Shift+R)
- [ ] Hero aparece corretamente, sem FOUC de fonte ou layout
- [ ] O texto dos cantos do hero diz `ALEX AI / 2026` (nao `LEXAI`)
- [ ] A coordenada bottom-left comeca com `S` (nao `N`)
- [ ] Tema claro e escuro alternam pelo botao sem piscar
- [ ] Botao de WhatsApp abre `https://wa.me/5534993026456`

## 2. Interacoes (3 min)

- [ ] Scroll completo do topo ao footer, sem travar nem cortar secao
- [ ] Secao TL;DR ("Em 60 segundos") aparece logo apos o hero
- [ ] Marquee passa 7 itens em PT-BR (nao texto em ingles)
- [ ] ROI calculator (`#roi`) reage ao mover qualquer slider
- [ ] Toggle mensal/anual na secao de planos recalcula precos
- [ ] FAQ abre e fecha. As perguntas 1 e 2 mostram a resposta curta
      antes do bloco "Ver a explicacao tecnica"
- [ ] O bloco `<details>` da FAQ expande e recolhe
- [ ] Formularios/links do footer respondem ao clique

## 3. Conteudo (2 min)

- [ ] Nao existe logo wall fake dentro de `#prova`
- [ ] Caso `Caso 01 · Mercado Imobiliario` foi removido (substituido por pilot-note)
- [ ] Bloco `.founder-numbers` aparece com 4 itens dentro do pilot-note
- [ ] Scarcity copy nao diz "Apenas 1 vaga" (usa "Poucas vagas")
- [ ] Footer mostra linha de CNPJ ("em registro") e contato DPO
- [ ] `<title>` e meta description falam do WhatsApp como canal

## 4. SEO / social (2 min)

- [ ] `https://alexai.com.br/og-image.png` abre no navegador (PNG, 1200x630)
- [ ] [opengraph.xyz](https://www.opengraph.xyz/url/https%3A%2F%2Falexai.com.br%2F) mostra o preview com o novo titulo
- [ ] `view-source:` mostra o JSON-LD de FAQPage atualizado (pergunta 1: "chatbot", pergunta 2: "aprende sobre a minha empresa")
- [ ] `sitemap.xml` abre e aponta para a home
- [ ] `robots.txt` permite crawl (se existir) ou nao bloqueia

## 5. Acessibilidade (2 min)

- [ ] Navegacao por TAB chega em todos os CTAs do hero, TL;DR e pilot-note
- [ ] Focus ring visivel em modo escuro e claro
- [ ] Elementos `<details>` da FAQ abrem com Enter pelo teclado
- [ ] `prefers-reduced-motion` desliga animacoes (DevTools > Rendering)
- [ ] Contraste minimo WCAG AA no texto pequeno (`.pilot-note__bullet-text`, `.founder-numbers__label`)
- [ ] Alt text presente em todas as imagens com conteudo

## 6. Responsivo (2 min)

Testar nos tamanhos abaixo com DevTools > Device toolbar:

- [ ] 375 x 800 (iPhone padrao) -- hero, TL;DR e pilot-note legiveis
- [ ] 414 x 896 (iPhone XL)
- [ ] 768 x 1024 (tablet)
- [ ] 1280 x 800 (desktop pequeno)
- [ ] 1920 x 1080 (desktop grande)

Foco: `.tldr__inner` vira 1 coluna < 900px, `.founder-numbers` vira 2 colunas < 900px e 1 coluna < 520px, `.pilot-note__bullets` vira 1 coluna < 1100px.

## 7. Analytics e observabilidade

- [ ] Vercel Analytics reporta pageview na dashboard do projeto
- [ ] Core Web Vitals aparecem (LCP, CLS, INP) apos primeiro minuto
- [ ] Se `ALEX_AI_SENTRY_DSN` estiver setado, erro simulado (`throw new Error('qa test')` no console) aparece no Sentry
- [ ] CSP nao quebrou nada: console limpo de `Refused to load` ou `blocked by CSP`
- [ ] CSP report endpoint `/api/csp-report` existe ou o 404 foi marcado como aceito ate o endpoint ser criado

## 8. Privacidade / LGPD

- [ ] `<meta name="description">` nao expoe dados de cliente
- [ ] `mailto:contato@alexai.com.br` e o email do DPO no footer
- [ ] Texto de LGPD no FAQ continua preciso apos edicoes
- [ ] Nenhum numero fabricado foi reintroduzido (check case-study e social proof)

---

## Quando algo reprova

1. Anotar o item exato que falhou nesta lista.
2. Tirar printscreen com DevTools aberto, mostrando o erro.
3. Abrir issue no repo ou mensagem direta pro fundador no WhatsApp.
4. Nao fazer deploy ate o item estar verde de novo.

Ultima atualizacao: 2026-04-08 (Tier 1 + Tier 2 do audit 18-agent).
