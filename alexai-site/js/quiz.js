/* =========================================================
   ALEX AI -- quiz.js
   Advanced Quiz Engine -- 15 questions across 5 categories
   Covers: Model Architecture, NLP/Embeddings, Automation,
   Compliance, Enterprise Integration
   ========================================================= */

/* Inject transition and timer styles */
(function () {
  var style = document.createElement('style');
  style.textContent = [
    '.quiz-fade-out { opacity: 0; transform: translateY(-10px); transition: opacity .3s, transform .3s; }',
    '.quiz-fade-in { opacity: 0; transform: translateY(10px); }',
    '.quiz-fade-in.show { opacity: 1; transform: none; transition: opacity .3s ease .05s, transform .3s ease .05s; }',
    '.quiz-timer { height: 2px; background: var(--border, #D9D4C9); margin-bottom: 20px; overflow: hidden; border-radius: 1px; }',
    '.quiz-timer-fill { height: 100%; background: var(--olive, #5B6B4E); transition: width .5s linear; }',
    '.quiz-start-exit { opacity: 0; transform: translateY(-30px); transition: opacity .4s ease, transform .4s ease; }'
  ].join('\n');
  document.head.appendChild(style);
})();

(function () {
  'use strict';

  /* ---------------------------------------------------------
     Question Bank -- 15 questions, 5 categories
     --------------------------------------------------------- */
  var questions = [
    {
      category: 'Arquitetura de Modelos',
      question: 'O que diferencia fundamentalmente um modelo de linguagem baseado em arquitetura Transformer de um modelo recorrente (RNN/LSTM) no processamento de sequencias textuais?',
      options: [
        'A capacidade de processar tokens em paralelo via mecanismo de self-attention, eliminando a dependencia sequencial',
        'O uso de camadas convolucionais para deteccao de padroes morfossintatiticos',
        'A necessidade de menor volume de dados durante o pre-treinamento',
        'A incompatibilidade intrinseca com tecnicas de transfer learning'
      ],
      correct: 0,
      explanation: 'A arquitetura Transformer, proposta por Vaswani et al. (2017), introduziu o mecanismo de self-attention que permite ao modelo processar todos os tokens de uma sequencia simultaneamente, estabelecendo relacoes de dependencia direta entre quaisquer posicoes -- independentemente da distancia. Isso elimina o gargalo sequencial das RNNs/LSTMs, onde a informacao precisava propagarse passo a passo, resultando em perda de contexto em sequencias longas (vanishing gradient).'
    },
    {
      category: 'NLP & Embeddings',
      question: 'Em uma arquitetura RAG (Retrieval-Augmented Generation), qual componente e responsavel por converter documentos em representacoes vetoriais densas para viabilizar busca semantica?',
      options: [
        'O decoder autorregressivo do modelo generativo',
        'O modelo de embedding, que projeta texto em espaco vetorial de alta dimensionalidade',
        'O classificador de intencao (intent classifier)',
        'O tokenizador BPE (Byte Pair Encoding)'
      ],
      correct: 1,
      explanation: 'Em pipelines RAG, o modelo de embedding (como sentence-transformers, OpenAI Ada, ou modelos customizados) converte segmentos textuais em vetores densos de dimensionalidade fixa. Esses vetores sao indexados em bancos vetoriais (Pinecone, Weaviate, Qdrant) e consultados por similaridade cosseno a cada interacao, permitindo que o modelo generativo fundamente suas respostas em informacao factual e atualizada da base de conhecimento da empresa.'
    },
    {
      category: 'Arquitetura de Modelos',
      question: 'No processo de Reinforcement Learning from Human Feedback (RLHF), qual e a funcao primaria do modelo de recompensa (reward model)?',
      options: [
        'Gerar dados sinteticos para aumentar o corpus de treinamento',
        'Aprender a classificar respostas por preferencia humana para guiar a otimizacao da politica do modelo via PPO',
        'Detectar e filtrar conteudo toxico ou inadequado em tempo de inferencia',
        'Otimizar o tempo de inferencia atraves de destilacao de conhecimento'
      ],
      correct: 1,
      explanation: 'No pipeline de RLHF, anotadores humanos comparam pares de respostas e indicam qual e preferivel. O reward model e treinado sobre essas comparacoes para atribuir scores que refletem preferencias humanas. Esse modelo de recompensa e entao usado como funcao objetivo durante o fine-tuning do LLM via Proximal Policy Optimization (PPO), alinhando o comportamento do modelo com expectativas de qualidade, seguranca e utilidade definidas pelos avaliadores.'
    },
    {
      category: 'NLP & Embeddings',
      question: 'Qual tecnica permite que um assistente conversacional mantenha contexto entre sessoes separadas sem exceder o limite da janela de contexto do modelo de linguagem?',
      options: [
        'Aumento do batch size durante inferencia para expandir a capacidade de memoria de trabalho',
        'Armazenamento de resumos e embeddings em banco vetorial com retrieval seletivo por relevancia semantica',
        'Reprocessamento integral de todo o historico de conversas a cada nova mensagem recebida',
        'Uso exclusivo de modelos com janela de contexto superior a 1 milhao de tokens'
      ],
      correct: 1,
      explanation: 'A abordagem mais eficiente para memoria conversacional de longo prazo e a combinacao de sumarizacao incremental com armazenamento vetorial. A cada sessao, o sistema gera um resumo estruturado da conversa e o armazena como embedding em banco vetorial. Em sessoes futuras, o sistema realiza retrieval seletivo dos resumos mais relevantes para o contexto atual, injetando apenas a informacao pertinente na janela de contexto -- preservando memoria sem esgotar o limite de tokens.'
    },
    {
      category: 'Automacao & Metricas',
      question: 'Na analise de sentimento multiaspecto (Aspect-Based Sentiment Analysis), qual e a principal vantagem sobre a classificacao binaria tradicional (positivo/negativo)?',
      options: [
        'Menor custo computacional por inferencia',
        'Maior velocidade de processamento em lotes grandes',
        'Capacidade de identificar polaridades de sentimento distintas para diferentes atributos ou aspectos de uma mesma entidade',
        'Eliminacao completa de falsos positivos no pipeline de classificacao'
      ],
      correct: 2,
      explanation: 'A ABSA permite que o sistema identifique sentimentos diferentes para cada aspecto mencionado em um texto. Por exemplo, em uma avaliacao de restaurante, o cliente pode expressar sentimento positivo sobre a comida e negativo sobre o atendimento. Para operacoes comerciais, isso e critico: permite que o sistema identifique pontos de friccao especificos na experiencia do cliente e acione respostas ou alertas granulares, em vez de classificar a interacao inteira como genericamente positiva ou negativa.'
    },
    {
      category: 'Automacao & Metricas',
      question: 'O conceito de Customer Lifetime Value (CLV) preditivo, quando aplicado a sistemas de automacao com IA conversacional, permite fundamentalmente:',
      options: [
        'Calcular exclusivamente o ticket medio historico de cada cliente',
        'Estimar o valor futuro do cliente com base em padroes comportamentais, historico transacional e propensao a churn',
        'Determinar apenas o custo de aquisicao (CAC) de cada canal',
        'Mensurar exclusivamente o indice de satisfacao instantanea (CSAT)'
      ],
      correct: 1,
      explanation: 'O CLV preditivo utiliza modelos de machine learning (tipicamente modelos probabilisticos como BG/NBD ou redes neurais) para estimar o valor futuro de cada cliente com base em frequencia de compra, recencia, valor monetario e sinais comportamentais. Em sistemas de IA conversacional, isso permite priorizar o nivel de atendimento e personalizar a abordagem comercial: clientes com alto CLV preditivo podem receber tratamento diferenciado, ofertas exclusivas e follow-up mais intensivo.'
    },
    {
      category: 'Integracao Empresarial',
      question: 'Em uma arquitetura de integracao via webhooks, qual e a principal vantagem tecnica sobre polling periodico em APIs REST tradicionais?',
      options: [
        'Reducao significativa de consumo de bandwidth e latencia por notificacao em tempo real baseada em eventos',
        'Maior compatibilidade nativa com sistemas legados e mainframes',
        'Eliminacao completa da necessidade de autenticacao e autorizacao',
        'Simplificacao do tratamento de erros e implementacao de retry logic'
      ],
      correct: 0,
      explanation: 'Webhooks implementam uma arquitetura event-driven onde o sistema emissor notifica o receptor apenas quando um evento relevante ocorre (push model), em contraste com polling onde o receptor consulta periodicamente o emissor buscando mudancas (pull model). Em operacoes comerciais com IA conversacional, webhooks sao essenciais para deteccao instantanea de eventos como carrinho abandonado, formulario preenchido ou mensagem recebida -- permitindo resposta em tempo real em vez de latencia de polling.'
    },
    {
      category: 'NLP & Embeddings',
      question: 'O fenomeno de "alucinacao" (hallucination) em modelos de linguagem de grande escala refere-se tecnicamente a:',
      options: [
        'Geracao de texto que e gramaticalmente correto, semanticamente coerente, porem factualmente incorreto ou fabricado sem base nos dados de treinamento ou contexto fornecido',
        'Falha sistematica no processamento de caracteres especiais e diacriticos',
        'Incapacidade de processar idiomas alem do idioma predominante no corpus de pre-treinamento',
        'Degradacao progressiva de performance quando o tempo de inferencia excede um limiar critico'
      ],
      correct: 0,
      explanation: 'Hallucination e um dos desafios centrais em LLMs: o modelo gera informacao que parece plausivel e e linguisticamente fluente, mas nao e factualmente ancorada. Em sistemas comerciais, isso e mitigado atraves de RAG (ancorando respostas em dados reais da empresa), confidence thresholding (detectando quando o modelo esta incerto), guardrails de validacao factual, e escalonamento humano quando a confianca fica abaixo do limiar configurado -- exatamente a abordagem implementada pelo Alex AI.'
    },
    {
      category: 'Compliance & Seguranca',
      question: 'Sob a LGPD (Lei Geral de Protecao de Dados), o exercicio do "direito ao esquecimento" pelo titular de dados, quando aplicado a sistemas de IA conversacional, implica operacionalmente:',
      options: [
        'Exclusao apenas das mensagens visiveis na interface de chat do cliente',
        'Remocao integral dos dados pessoais de todos os sistemas de armazenamento, incluindo embeddings vetoriais, logs de auditoria e backups, conforme prazos definidos em politica de retencao',
        'Manutencao dos dados com restricao de acesso exclusivamente a administradores do sistema',
        'Transferencia compulsoria dos dados para servidores localizados em jurisdicao internacional'
      ],
      correct: 1,
      explanation: 'O artigo 18 da LGPD garante ao titular o direito de solicitar a eliminacao de seus dados pessoais. Em sistemas de IA conversacional, isso apresenta complexidade tecnica significativa: alem de excluir mensagens e registros transacionais, e necessario remover ou anonimizar embeddings vetoriais que contenham informacao pessoal, purgar logs de treinamento, e garantir que backups nao retenham dados apos o periodo de retencao. O Alex AI implementa pipeline de data deletion que propaga a solicitacao para todas as camadas de armazenamento.'
    },
    {
      category: 'Automacao & Metricas',
      question: 'Segundo estudos de Lead Response Management (InsideSales.com / Harvard Business Review), qual o impacto quantificado de responder um lead inbound nos primeiros 5 minutos versus apos 30 minutos?',
      options: [
        'Aumento de 21 vezes na probabilidade de qualificacao do lead',
        'Nenhuma diferenca estatisticamente significativa no outcome de conversao',
        'Aumento marginal de apenas 2 vezes na taxa de conversao',
        'Reducao da taxa de conversao por percepcao de agressividade comercial'
      ],
      correct: 0,
      explanation: 'O estudo seminal de Oldroyd, McElheran e Elkington (MIT/InsideSales.com) demonstrou que leads contactados nos primeiros 5 minutos tem 21 vezes mais probabilidade de entrar no pipeline qualificado comparado a leads contactados apos 30 minutos. Apos 1 hora, a probabilidade cai 60 vezes. Esse dado fundamenta a proposta de valor central de sistemas como o Alex AI: a eliminacao da latencia de resposta nao e uma otimizacao marginal -- e uma transformacao estrutural na taxa de conversao.'
    },
    {
      category: 'NLP & Embeddings',
      question: 'No contexto de modelos de linguagem, a tokenizacao por subpalavras (subword tokenization via BPE ou SentencePiece) e preferida sobre tokenizacao por palavras inteiras fundamentalmente porque:',
      options: [
        'E mais rapida computacionalmente em todos os cenarios de inferencia',
        'Permite lidar com palavras fora do vocabulario (OOV) ao decompo-las em unidades menores ja reconhecidas, mantendo vocabulario compacto',
        'Elimina completamente a necessidade de etapas de pre-processamento textual',
        'Garante capacidade nativa de traducao automatica entre quaisquer idiomas sem treinamento adicional'
      ],
      correct: 1,
      explanation: 'Tokenizacao por subpalavras (BPE, WordPiece, SentencePiece) resolve o problema de vocabulario aberto: palavras raras, neologismos, termos tecnicos e nomes proprios que nao existem no vocabulario podem ser decompostos em subunidades reconhecidas. Isso permite que modelos como GPT e BERT processem qualquer texto sem encontrar tokens desconhecidos, mantendo um vocabulario de tamanho gerenciavel (tipicamente 30k-100k tokens) em vez de necessitar vocabularios de milhoes de palavras inteiras.'
    },
    {
      category: 'Automacao & Metricas',
      question: 'Em uma estrategia de lead nurturing automatizada, o conceito de lead scoring baseado em sinais de intencao comportamental permite fundamentalmente:',
      options: [
        'Enviar comunicacoes identicas e padronizadas para toda a base de contatos sem segmentacao',
        'Priorizar a alocacao de recursos comerciais nos leads com maior probabilidade de conversao, determinada por padroes comportamentais observados',
        'Reduzir o volume total de comunicacoes a zero, delegando integralmente ao algoritmo',
        'Substituir completamente a equipe de vendas em todas as etapas do funil'
      ],
      correct: 1,
      explanation: 'Lead scoring comportamental atribui pontuacao dinamica baseada em acoes observaveis: abertura de e-mails, visitas a paginas de pricing, downloads de materiais, tempo de interacao com o chatbot, perguntas sobre condicoes de pagamento. O score e recalculado continuamente, permitindo que a equipe comercial foque nos leads com maior propensao a conversao no momento atual. No Alex AI, o scoring e enriquecido por analise semantica das conversas: leads que mencionam urgencia, comparam concorrentes ou perguntam sobre prazo de entrega recebem incremento automatico de score.'
    },
    {
      category: 'Arquitetura de Modelos',
      question: 'Qual a diferenca fundamental entre fine-tuning completo (full fine-tuning) de um LLM e adaptacao por LoRA (Low-Rank Adaptation)?',
      options: [
        'LoRA modifica uma fracao minima dos parametros do modelo via decomposicao em matrizes de baixo rank, reduzindo custo computacional e requisitos de memoria em ate 10.000 vezes',
        'Fine-tuning completo e invariavelmente mais rapido e eficiente que LoRA em todos os cenarios',
        'LoRA requer significativamente mais dados de treinamento supervisionado que fine-tuning completo',
        'Nao existe diferenca pratica ou mensuravel entre os dois metodos em termos de performance ou custo'
      ],
      correct: 0,
      explanation: 'LoRA (Hu et al., 2021) injeta matrizes de baixo rank treinaveis nas camadas de atencao do modelo, congelando os parametros originais. Isso reduz drasticamente o numero de parametros treinaveis (tipicamente 0.01% do total) e a memoria GPU necessaria, permitindo fine-tuning de modelos de bilhoes de parametros em hardware acessivel. Para operacoes como o Alex AI, LoRA e essencial: permite adaptar o modelo ao dominio especifico de cada cliente de forma eficiente, sem necessidade de infraestrutura computacional de grande escala.'
    },
    {
      category: 'Integracao Empresarial',
      question: 'A unificacao de identidade do cliente em uma estrategia omnichannel com IA conversacional depende fundamentalmente de qual capacidade tecnica?',
      options: [
        'Restricao do atendimento a um unico canal de comunicacao para evitar fragmentacao',
        'Resolucao de entidade (entity resolution) para vincular interacoes provenientes de diferentes canais a um mesmo perfil unificado de cliente',
        'Duplicacao proposital de dados em cada canal para garantir redundancia e disponibilidade',
        'Restricao do atendimento exclusivamente a horario comercial para manter consistencia manual'
      ],
      correct: 1,
      explanation: 'Entity resolution (ou identity resolution) e o processo tecnico de determinar que interacoes em diferentes canais -- WhatsApp, Instagram, e-mail, chat -- pertencem ao mesmo individuo. O sistema utiliza sinais como numero de telefone, e-mail, cookies, device fingerprint e analise probabilistica de nomes para unificar perfis. No Alex AI, isso significa que um cliente que inicia conversa pelo Instagram e continua pelo WhatsApp tem seu contexto integralmente preservado: historico de compras, preferencias, objecoes levantadas e estagio no funil.'
    },
    {
      category: 'Compliance & Seguranca',
      question: 'Na avaliacao de retorno sobre investimento (ROI) de um sistema de IA conversacional para operacoes comerciais, qual das seguintes metricas NAO e diretamente atribuivel ao sistema?',
      options: [
        'Receita recuperada de carrinhos ou negociacoes abandonadas',
        'Reducao percentual no custo medio por atendimento ao cliente',
        'Variacao cambial do dolar americano frente ao real brasileiro',
        'Aumento mensuravel na taxa de conversao de leads inbound qualificados'
      ],
      correct: 2,
      explanation: 'Variacoes cambiais sao fatores macroeconomicos exogenos completamente independentes da operacao do sistema de IA. As demais metricas sao diretamente mensuraveis e atribuiveis: receita recuperada pode ser rastreada por evento de abandono e conversao subsequente; custo por atendimento compara o custo operacional antes e depois da implementacao; taxa de conversao e medida por cohort com grupo de controle. O Alex AI fornece dashboards com atribuicao precisa de cada metrica ao sistema, permitindo calculo de ROI auditavel.'
    }
  ];

  /* ---------------------------------------------------------
     State
     --------------------------------------------------------- */
  var currentQuestion = 0;
  var score = 0;
  var answers = [];
  var timerInterval = null;
  var timerTimeout = null;
  var questionLocked = false;

  var QUESTION_TIME = 45; // seconds per question

  /* ---------------------------------------------------------
     Safe DOM Helpers
     --------------------------------------------------------- */
  function $(id) {
    return document.getElementById(id);
  }

  function setDisplay(el, value) {
    if (el) el.style.display = value;
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function setHTML(el, html) {
    if (el) el.innerHTML = html;
  }

  /* ---------------------------------------------------------
     Element References (with null safety)
     --------------------------------------------------------- */
  var startScreen  = $('quiz-start');
  var activeScreen = $('quiz-active');
  var resultsScreen = $('quiz-results');
  var beginBtn     = $('quiz-begin');
  var nextBtn      = $('quiz-next');
  var retryBtn     = $('quiz-retry');
  var progressBar  = $('quiz-progress');
  var counterEl    = $('quiz-counter');
  var categoryEl   = $('quiz-category');
  var questionEl   = $('quiz-question');
  var optionsEl    = $('quiz-options');
  var feedbackEl   = $('quiz-feedback');

  /* ---------------------------------------------------------
     Category Tracking
     --------------------------------------------------------- */
  var categories = {};
  questions.forEach(function (q) {
    if (!categories[q.category]) {
      categories[q.category] = { total: 0, correct: 0 };
    }
    categories[q.category].total++;
  });

  /* ---------------------------------------------------------
     Timer
     --------------------------------------------------------- */
  function createTimerElement() {
    var existing = $('quiz-timer');
    if (existing) {
      existing.parentNode.removeChild(existing);
    }

    var timerWrap = document.createElement('div');
    timerWrap.id = 'quiz-timer';
    timerWrap.className = 'quiz-timer';

    var timerFill = document.createElement('div');
    timerFill.id = 'quiz-timer-fill';
    timerFill.className = 'quiz-timer-fill';
    timerFill.style.width = '100%';

    timerWrap.appendChild(timerFill);

    /* Insert timer before the options container */
    if (optionsEl && optionsEl.parentNode) {
      optionsEl.parentNode.insertBefore(timerWrap, optionsEl);
    } else if (activeScreen) {
      activeScreen.appendChild(timerWrap);
    }

    return timerFill;
  }

  function clearTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (timerTimeout) {
      clearTimeout(timerTimeout);
      timerTimeout = null;
    }
  }

  function startTimer() {
    clearTimer();

    var fill = $('quiz-timer-fill');
    if (!fill) return;

    var elapsed = 0;
    var step = 250; // update every 250ms for smooth depletion

    /* Reset to full */
    fill.style.transition = 'none';
    fill.style.width = '100%';

    /* Force reflow so transition reset takes effect */
    void fill.offsetWidth;

    /* Smooth depletion via CSS transition */
    fill.style.transition = 'width ' + QUESTION_TIME + 's linear';
    fill.style.width = '0%';

    /* Fallback interval to track time in JS */
    timerInterval = setInterval(function () {
      elapsed += step;
    }, step);

    /* Timeout when time expires */
    timerTimeout = setTimeout(function () {
      clearTimer();
      if (!questionLocked) {
        handleTimeout();
      }
    }, QUESTION_TIME * 1000);
  }

  function handleTimeout() {
    questionLocked = true;

    var q = questions[currentQuestion];

    answers.push({
      question: currentQuestion,
      selected: -1,
      correct: q.correct,
      isCorrect: false
    });

    /* Highlight correct answer, disable all */
    if (optionsEl) {
      var buttons = optionsEl.querySelectorAll('.quiz-option');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.add('disabled');
        if (i === q.correct) {
          buttons[i].classList.add('correct');
        }
      }
    }

    /* Show timeout feedback */
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.textContent = '';
      var titleT = document.createElement('div');
      titleT.className = 'quiz-feedback-title wrong';
      titleT.textContent = 'Tempo esgotado.';
      var pT = document.createElement('p');
      pT.textContent = q.explanation;
      feedbackEl.appendChild(titleT);
      feedbackEl.appendChild(pT);
    }

    /* Show next button */
    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
      setText(nextBtn, currentQuestion < questions.length - 1 ? 'Proxima questao' : 'Ver resultado');
    }

    if (feedbackEl) {
      feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ---------------------------------------------------------
     Quiz Reset
     --------------------------------------------------------- */
  function resetQuiz() {
    currentQuestion = 0;
    score = 0;
    answers = [];
    questionLocked = false;
    clearTimer();
    Object.keys(categories).forEach(function (cat) {
      categories[cat].correct = 0;
    });
  }

  /* ---------------------------------------------------------
     Transition Helpers
     --------------------------------------------------------- */

  /**
   * Wraps the question content area in a container that we can
   * apply fade-out / fade-in classes to. Uses the quiz-options
   * parent as the transition target.
   */
  function getTransitionTarget() {
    /* Use the question content wrapper if it exists, otherwise
       fall back to the active screen itself */
    if (questionEl && questionEl.parentNode) {
      return questionEl.parentNode;
    }
    return activeScreen;
  }

  function fadeOutThen(callback) {
    var target = getTransitionTarget();
    if (!target) {
      callback();
      return;
    }

    target.classList.add('quiz-fade-out');

    setTimeout(function () {
      target.classList.remove('quiz-fade-out');
      callback();
    }, 300);
  }

  function fadeIn() {
    var target = getTransitionTarget();
    if (!target) return;

    target.classList.add('quiz-fade-in');

    /* Force reflow to ensure the initial state is rendered */
    void target.offsetWidth;

    target.classList.add('show');

    setTimeout(function () {
      target.classList.remove('quiz-fade-in', 'show');
    }, 350);
  }

  /* ---------------------------------------------------------
     Show Question
     --------------------------------------------------------- */
  function showQuestion() {
    var q = questions[currentQuestion];
    var total = questions.length;

    questionLocked = false;

    if (progressBar) {
      progressBar.style.width = ((currentQuestion / total) * 100) + '%';
    }

    setText(counterEl, 'Questao ' + (currentQuestion + 1) + ' de ' + total);
    setText(categoryEl, q.category);
    setText(questionEl, q.question);
    setDisplay(feedbackEl, 'none');
    setDisplay(nextBtn, 'none');

    /* Build option buttons safely (no innerHTML, prevents XSS if data dynamic) */
    var letters = ['A', 'B', 'C', 'D'];
    if (optionsEl) {
      optionsEl.textContent = '';
      q.options.forEach(function (opt, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        btn.dataset.index = i;
        var letter = document.createElement('span');
        letter.className = 'quiz-option-letter';
        letter.textContent = letters[i];
        var label = document.createElement('span');
        label.textContent = opt;
        btn.appendChild(letter);
        btn.appendChild(label);
        optionsEl.appendChild(btn);
      });
    }

    /* Bind click events */
    if (optionsEl) {
      var buttons = optionsEl.querySelectorAll('.quiz-option');
      for (var i = 0; i < buttons.length; i++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            if (!questionLocked) {
              handleAnswer(parseInt(btn.dataset.index, 10));
            }
          });
        })(buttons[i]);
      }
    }

    /* Create and start timer */
    createTimerElement();
    startTimer();

    /* Re-bind cursor hover for new buttons */
    if (typeof window.rebindCursorHover === 'function') {
      window.rebindCursorHover();
    }

    /* Fade-in animation */
    fadeIn();
  }

  /* ---------------------------------------------------------
     Handle Answer
     --------------------------------------------------------- */
  function handleAnswer(selected) {
    if (questionLocked) return;
    questionLocked = true;
    clearTimer();

    var q = questions[currentQuestion];
    var isCorrect = selected === q.correct;

    if (isCorrect) {
      score++;
      categories[q.category].correct++;
    }

    answers.push({
      question: currentQuestion,
      selected: selected,
      correct: q.correct,
      isCorrect: isCorrect
    });

    /* Disable all options and highlight correct/wrong */
    if (optionsEl) {
      var buttons = optionsEl.querySelectorAll('.quiz-option');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.add('disabled');
        if (i === q.correct) buttons[i].classList.add('correct');
        if (i === selected && !isCorrect) buttons[i].classList.add('wrong');
      }
    }

    /* Show feedback */
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.textContent = '';
      var titleA = document.createElement('div');
      titleA.className = 'quiz-feedback-title ' + (isCorrect ? 'correct' : 'wrong');
      titleA.textContent = isCorrect ? 'Resposta correta.' : 'Resposta incorreta.';
      var pA = document.createElement('p');
      pA.textContent = q.explanation;
      feedbackEl.appendChild(titleA);
      feedbackEl.appendChild(pA);
    }

    /* Show next button */
    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
      setText(nextBtn, currentQuestion < questions.length - 1 ? 'Proxima questao' : 'Ver resultado');
    }

    /* Scroll feedback into view */
    if (feedbackEl) {
      feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ---------------------------------------------------------
     Animated Score Counter
     --------------------------------------------------------- */
  function animateScoreCount(targetEl, targetValue, duration) {
    if (!targetEl) return;

    var startTime = null;
    var startValue = 0;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easedProgress = easeOutCubic(progress);
      var current = Math.round(startValue + (targetValue - startValue) * easedProgress);

      targetEl.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    targetEl.textContent = '0';
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------
     Show Results
     --------------------------------------------------------- */
  function showResults() {
    clearTimer();

    /* Remove timer element from DOM */
    var timerEl = $('quiz-timer');
    if (timerEl && timerEl.parentNode) {
      timerEl.parentNode.removeChild(timerEl);
    }

    setDisplay(activeScreen, 'none');
    setDisplay(resultsScreen, 'block');

    var pct = score / questions.length;

    /* Animate SVG score ring */
    var circle = $('quiz-score-circle');
    if (circle) {
      var circumference = 2 * Math.PI * 52; // r=52
      var offset = circumference - (pct * circumference);
      circle.style.transition = 'none';
      circle.style.strokeDashoffset = circumference;

      setTimeout(function () {
        circle.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)';
        circle.style.strokeDashoffset = offset;
      }, 100);
    }

    /* Animate score number counting up */
    var scoreNumEl = $('quiz-score-num');
    animateScoreCount(scoreNumEl, score, 1200);

    /* Score title and description */
    var titleEl = $('quiz-score-title');
    var descEl = $('quiz-score-desc');

    if (pct >= 0.87) {
      setText(titleEl, 'Dominio tecnico avancado');
      setText(descEl, 'Voce demonstra compreensao profunda dos fundamentos de IA conversacional, arquitetura de modelos e integracao empresarial. Sua capacidade de avaliacao tecnica esta alinhada com o nivel de exigencia que uma operacao de alta performance demanda.');
    } else if (pct >= 0.6) {
      setText(titleEl, 'Compreensao intermediaria solida');
      setText(descEl, 'Voce possui uma base consistente sobre os conceitos fundamentais, com espaco para aprofundamento em areas especificas. Esse nivel de compreensao ja permite avaliar criticamente solucoes de IA para sua operacao.');
    } else if (pct >= 0.33) {
      setText(titleEl, 'Base em construcao');
      setText(descEl, 'Os conceitos abordados sao de alta complexidade tecnica. O importante e que a tecnologia por tras do Alex AI opera com toda essa profundidade para que voce nao precise dominar cada detalhe -- apenas colher os resultados.');
    } else {
      setText(titleEl, 'Territorio novo');
      setText(descEl, 'IA conversacional e um campo de alta complexidade tecnica. O valor do Alex AI esta justamente em abstrair toda essa complexidade: voce define os objetivos de negocio, e o sistema cuida da engenharia necessaria para alcanca-los.');
    }

    /* Category breakdown */
    var breakdownEl = $('quiz-breakdown');
    var breakdownHTML = '';
    Object.keys(categories).forEach(function (cat) {
      var c = categories[cat];
      breakdownHTML += '<div class="quiz-cat-result">';
      breakdownHTML += '<div class="quiz-cat-name">' + cat + '</div>';
      breakdownHTML += '<div class="quiz-cat-score">' + c.correct + '/' + c.total + '</div>';
      breakdownHTML += '</div>';
    });
    setHTML(breakdownEl, breakdownHTML);

    if (resultsScreen) {
      resultsScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ---------------------------------------------------------
     Event Listeners
     --------------------------------------------------------- */

  /* Start button -- slide up and fade out the start card */
  if (beginBtn) {
    beginBtn.addEventListener('click', function () {
      resetQuiz();

      if (startScreen) {
        startScreen.classList.add('quiz-start-exit');

        setTimeout(function () {
          setDisplay(startScreen, 'none');
          startScreen.classList.remove('quiz-start-exit');
          setDisplay(activeScreen, 'block');
          showQuestion();
        }, 400);
      } else {
        setDisplay(activeScreen, 'block');
        showQuestion();
      }
    });
  }

  /* Next button -- transition with fade between questions */
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      clearTimer();
      currentQuestion++;

      if (currentQuestion < questions.length) {
        fadeOutThen(function () {
          showQuestion();

          if (activeScreen) {
            activeScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      } else {
        fadeOutThen(function () {
          showResults();
        });
      }
    });
  }

  /* Retry button */
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      resetQuiz();
      setDisplay(resultsScreen, 'none');
      setDisplay(activeScreen, 'block');

      /* Reset SVG circle */
      var circle = $('quiz-score-circle');
      if (circle) {
        circle.style.transition = 'none';
        circle.style.strokeDashoffset = 2 * Math.PI * 52;
      }

      showQuestion();

      var container = $('quiz-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

})();
