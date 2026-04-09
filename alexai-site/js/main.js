/* =========================================================
   ALEX AI -- main.js
   Custom Cursor, Loader, Navigation, Scroll Reveal, Counter,
   FAQ Accordion, Plans Toggle, Smooth Scroll, Parallax,
   Magnetic Buttons, Card Tilt, Phone Chat Loop,
   Text Split Animation, Floating Hero Shapes
   ========================================================= */

(function () {
  'use strict';

  /* ============================================================
     UTILITIES
     ============================================================ */

  /**
   * Debounce -- delays execution until a pause in calls.
   * @param {Function} fn   Callback to debounce
   * @param {number}   ms   Delay in milliseconds
   * @returns {Function}
   */
  function debounce(fn, ms) {
    var timer;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, ms);
    };
  }

  /**
   * rAF throttle -- coalesces calls into next animation frame.
   * Use for scroll/resize handlers that mutate DOM/styles.
   */
  function rafThrottle(fn) {
    var ticking = false;
    return function () {
      var ctx = this;
      var args = arguments;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        fn.apply(ctx, args);
        ticking = false;
      });
    };
  }

  /**
   * Detect whether the current device is touch-primary.
   * @returns {boolean}
   */
  function isTouchDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }

  /**
   * Check if user prefers reduced motion.
   * @returns {boolean}
   */
  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  /**
   * Linear interpolation helper.
   */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* ---- Shared state ----
     hasFinePointer: real mouse/trackpad. Custom cursor + mouse FX should
     only run when this is true (skips phones, tablets, kiosks).
     isTouch is kept as legacy fallback for hybrids that report both. */
  var hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var isTouch   = !hasFinePointer;
  var noMotion  = prefersReducedMotion();

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  var dot  = document.getElementById('c-dot');
  var ring = document.getElementById('c-ring');
  var cursorWrap = document.getElementById('cursor');

  /* Hide cursor elements on touch devices */
  if (isTouch) {
    if (cursorWrap) cursorWrap.style.display = 'none';
    document.body.style.cursor = 'auto';
    document.querySelectorAll('a, button').forEach(function (el) {
      el.style.cursor = 'pointer';
    });
  }

  var mx = 0, my = 0, rx = 0, ry = 0;

  if (!isTouch && dot && ring) {
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    }, { passive: true });

    (function animRing() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    })();
  }

  /**
   * Bind hover class toggle for custom cursor on interactive elements.
   * Exposed on window so quiz.js can re-call it after rendering options.
   */
  function bindCursorHover() {
    document.querySelectorAll('a, button, [data-hover], .quiz-option').forEach(function (el) {
      /* Avoid binding twice */
      if (el._cursorBound) return;
      el._cursorBound = true;
      el.addEventListener('mouseenter', function () {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', function () {
        document.body.classList.remove('cursor-hover');
      });
    });
  }
  bindCursorHover();
  window.rebindCursorHover = bindCursorHover;

  /* ============================================================
     NAVIGATION -- scroll detection + dark-section awareness
     ============================================================ */
  var nav         = document.getElementById('nav');
  var heroSection = document.getElementById('home');
  var darkSections = document.querySelectorAll('.section-dark, .hero');

  /**
   * Combined nav handler: scrolled class, dark-over detection.
   */
  function updateNav() {
    if (!nav) return;

    /* Scrolled state */
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    /* Dark section detection */
    var navH    = nav.offsetHeight;
    var overDark = false;
    darkSections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top < navH && rect.bottom > navH) {
        overDark = true;
      }
    });

    /* Also treat hero bottom check */
    if (heroSection) {
      var heroBot = heroSection.getBoundingClientRect().bottom;
      if (heroBot > 80) overDark = true;
    }

    if (overDark && !nav.classList.contains('scrolled')) {
      nav.classList.add('nav-over-dark');
    } else if (!overDark) {
      nav.classList.remove('nav-over-dark');
    }
  }

  /* rAF-throttled scroll handler for nav */
  window.addEventListener('scroll', rafThrottle(updateNav), { passive: true });
  updateNav();

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  var navToggle = document.getElementById('nav-toggle');
  var navMenu   = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('open');
    });
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
      });
    });
  }

  /* ============================================================
     LOADER
     ============================================================ */
  var loader         = document.getElementById('loader');
  var loaderProgress = document.getElementById('loader-progress');
  var loaderPct      = document.getElementById('loader-pct');
  var progress       = 0;

  if (loader && loaderProgress && loaderPct) {
    var loaderTick = setInterval(function () {
      progress += Math.random() * 18;
      if (progress >= 100) {
        progress = 100;
        clearInterval(loaderTick);
        setTimeout(function () {
          loader.classList.add('done');
          setTimeout(function () {
            loader.style.display = 'none';
            initScrollReveal();
            initTextSplit();
          }, 600);
        }, 180);
      }
      loaderProgress.style.width = progress + '%';
      loaderPct.textContent = Math.floor(progress);
    }, 70);
  } else {
    /* If no loader exists, init reveals immediately */
    initScrollReveal();
    initTextSplit();
  }

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  function initScrollReveal() {
    if (noMotion) {
      /* Immediately reveal everything when reduced motion is preferred */
      document.querySelectorAll('.rv, .rv-s').forEach(function (el) {
        el.classList.add('on');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
          /* a11y/perf: stop observing once revealed (fix memory leak) */
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });

    document.querySelectorAll('.rv, .rv-s').forEach(function (el) {
      observer.observe(el);
    });

    /* Fallback: a scroll-driven sweep in case IO is throttled / blocked.
       Cheap no-op once IO has marked everything .on. */
    var fallbackTick = false;
    function fallbackSweep() {
      var pending = document.querySelectorAll('.rv:not(.on), .rv-s:not(.on)');
      if (!pending.length) {
        window.removeEventListener('scroll', onScrollFallback, { passive: true });
        return;
      }
      Array.prototype.forEach.call(pending, function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 80 && r.bottom > -80) {
          el.classList.add('on');
        }
      });
    }
    function onScrollFallback() {
      if (fallbackTick) return;
      fallbackTick = true;
      requestAnimationFrame(function () {
        fallbackTick = false;
        fallbackSweep();
      });
    }
    window.addEventListener('scroll', onScrollFallback, { passive: true });
    /* Body scroller fallback: when <body> has its own overflow:auto
       (happens in some layouts), scroll events fire on body, not window. */
    document.addEventListener('scroll', onScrollFallback, { passive: true, capture: true });
    /* Initial sweep — also catches any element already in viewport */
    setTimeout(fallbackSweep, 400);
    /* Hard safety net: if anything is still unrevealed after 4s
       (IO throttled, fallback blocked, scroller mismatch), force-reveal
       everything so content never stays invisible. */
    setTimeout(function () {
      var stragglers = document.querySelectorAll('.rv:not(.on), .rv-s:not(.on)');
      Array.prototype.forEach.call(stragglers, function (el) {
        el.classList.add('on');
      });
    }, 4000);
  }

  /* ============================================================
     COUNTER ANIMATION
     ============================================================ */
  function animateCounter(el) {
    var target   = parseFloat(el.dataset.target);
    var suffix   = el.dataset.suffix || '';
    var prefix   = el.dataset.prefix || '';
    var start    = null;
    var duration = noMotion ? 0 : 1500;

    if (noMotion) {
      el.textContent = prefix + (Number.isInteger(target) ? target : target.toFixed(1)) + suffix;
      return;
    }

    function step(ts) {
      if (!start) start = ts;
      var prog  = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      var val   = target * eased;
      el.textContent = prefix + (Number.isInteger(target) ? Math.floor(val) : val.toFixed(1)) + suffix;
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('[data-counter]').forEach(function (el) {
    counterObs.observe(el);
  });

  /* ============================================================
     FAQ ACCORDION
     ============================================================ */
  document.querySelectorAll('.faq-item').forEach(function (item, idx) {
    var btn = item.querySelector('.faq-question');
    var ans = item.querySelector('.faq-answer');
    if (!btn) return;
    /* a11y wiring */
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-expanded', 'false');
    if (ans) {
      var ansId = 'faq-answer-' + idx;
      ans.setAttribute('id', ansId);
      ans.setAttribute('role', 'region');
      btn.setAttribute('aria-controls', ansId);
    }
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      /* Close all */
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
        var b = i.querySelector('.faq-question');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      /* Open clicked if it was closed */
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ============================================================
     PLANS TOGGLE
     Pricing calibrated for small-city PME reality (interior BR).
     Broken values ending in 7 for marketing psychology.
     Annual = ~20% off recurring (rounded to keep broken feel).
     - Essencial mensal: R$ 597/mes  -> anual: R$ 477/mes (economia R$ 1.440/ano)
     - Pro mensal:       R$ 1.197/mes -> anual: R$ 957/mes (economia R$ 2.880/ano)
     ============================================================ */
  var pricing = {
    mensal: {
      essencial: { setup: '1.997', rec: 'R$ 597/mes', save: '' },
      pro:       { setup: '3.997', rec: 'R$ 1.197/mes', save: '' }
    },
    anual: {
      essencial: { setup: '1.997', rec: 'R$ 477/mes', save: 'Economia de R$ 1.440/ano' },
      pro:       { setup: '3.997', rec: 'R$ 957/mes', save: 'Economia de R$ 2.880/ano' }
    }
  };

  window.setBilling = function (type) {
    if (type !== 'mensal' && type !== 'anual') return;

    document.querySelectorAll('.ptog').forEach(function (b) {
      var active = b.dataset.billing === type;
      b.classList.toggle('ptog--on', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    ['essencial', 'pro'].forEach(function (plan) {
      var p       = pricing[type][plan];
      var setupEl = document.getElementById('setup-' + plan);
      var recEl   = document.getElementById('rec-' + plan);
      var saveEl  = document.getElementById('save-' + plan);

      if (setupEl) setupEl.textContent = p.setup;
      if (recEl) {
        var strong = document.createElement('strong');
        strong.textContent = p.rec;
        recEl.textContent = '';
        recEl.appendChild(strong);
        recEl.appendChild(document.createTextNode(' manutencao'));
      }
      if (saveEl) {
        saveEl.textContent = p.save || '';
        saveEl.classList.toggle('show', !!p.save && type === 'anual');
      }
    });
  };

  // Bind click events (replaces inline onclick)
  document.querySelectorAll('.ptog').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.setBilling(btn.dataset.billing);
    });
  });

  /* ============================================================
     SMOOTH SCROLL
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        var offset = target.getBoundingClientRect().top + window.scrollY - 56;
        window.scrollTo({ top: offset, behavior: noMotion ? 'auto' : 'smooth' });
      }
    });
  });

  /* ============================================================
     PARALLAX HERO TITLE
     ============================================================ */
  var heroTitle = document.querySelector('.hero-title');

  /* ============================================================
     FLOATING HERO SHAPES PARALLAX
     ============================================================ */
  var heroFloats     = document.querySelectorAll('.hero-float');
  var floatRates     = [0.05, 0.08, 0.12];

  /**
   * Combined scroll-driven parallax: hero title + hero float shapes.
   * Runs via rAF-throttled scroll handler.
   */
  var scrollTicking = false;

  function onScrollParallax() {
    if (noMotion) return;
    /* Disable hero parallax on small phones — saves CPU on low-end Androids */
    if (window.innerWidth < 400) return;

    var y  = window.scrollY;
    var wh = window.innerHeight;

    /* Hero title parallax + fade */
    if (heroTitle && y < wh) {
      heroTitle.style.transform = 'translateY(' + (y * 0.15) + 'px)';
      heroTitle.style.opacity   = Math.max(0, 1 - (y / wh) * 1.3);
    }

    /* Floating shapes parallax */
    heroFloats.forEach(function (el, i) {
      var rate = floatRates[i % floatRates.length];
      el.style.transform = 'translateY(' + (y * rate) + 'px)';
    });
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        onScrollParallax();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  /* ============================================================
     MAGNETIC BUTTON EFFECT
     ============================================================ */
  if (!isTouch && !noMotion) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', rafThrottle(function (e) {
        var rect = el.getBoundingClientRect();
        var cx   = rect.left + rect.width  / 2;
        var cy   = rect.top  + rect.height / 2;
        var dx   = e.clientX - cx;
        var dy   = e.clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var pull = Math.max(0, 1 - dist / 40);

        el.style.transform  = 'translate(' + (dx * pull * 0.3) + 'px, ' + (dy * pull * 0.3) + 'px)';
        el.style.transition = 'transform 0.15s ease-out';
      }), { passive: true });

      el.addEventListener('mouseleave', function () {
        el.style.transform  = 'translate(0, 0)';
        el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      });
    });
  }

  /* ============================================================
     CARD TILT EFFECT (3D perspective)
     ============================================================ */
  if (!isTouch && !noMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var maxRot = 3; /* degrees */

      card.addEventListener('mousemove', rafThrottle(function (e) {
        var rect = card.getBoundingClientRect();
        var cx   = rect.width  / 2;
        var cy   = rect.height / 2;
        /* Mouse position relative to card center, normalised -1..1 */
        var px   = (e.clientX - rect.left - cx) / cx;
        var py   = (e.clientY - rect.top  - cy) / cy;

        /* rotateY = horizontal offset, rotateX = inverted vertical offset */
        var rotY =  px * maxRot;
        var rotX = -py * maxRot;

        card.style.transform  = 'perspective(600px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
        card.style.transition = 'transform 0.15s ease-out';
      }), { passive: true });

      card.addEventListener('mouseleave', function () {
        card.style.transform  = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      });
    });
  }

  /* ============================================================
     PHONE CONVERSATION LOOP
     Animates .msg elements inside .phone-messages in sequence.
     Repeats after a pause. Only runs while visible.
     ============================================================ */
  (function initPhoneChat() {
    var chatContainer = document.querySelector('.phone-messages');
    if (!chatContainer) return;

    var messages   = chatContainer.querySelectorAll('.msg');
    var typingEl   = chatContainer.querySelector('.msg-typing');
    if (messages.length === 0) return;

    var loopTimer    = null;
    var stepTimers   = [];
    var isVisible    = false;
    var delayPerMsg  = 700;  /* ms stagger between messages */
    var typingTime   = 2000; /* how long typing indicator shows */
    var resetPause   = 3000; /* pause before replaying */

    /** Hide all messages and typing indicator */
    function resetChat() {
      messages.forEach(function (msg) {
        msg.classList.remove('msg-anim');
      });
      if (typingEl) typingEl.classList.remove('msg-anim');
    }

    /** Clear all scheduled timers */
    function clearTimers() {
      stepTimers.forEach(function (t) { clearTimeout(t); });
      stepTimers = [];
      if (loopTimer) { clearTimeout(loopTimer); loopTimer = null; }
    }

    /** Run one full animation cycle */
    function playSequence() {
      if (!isVisible) return;
      resetChat();

      messages.forEach(function (msg, i) {
        var t = setTimeout(function () {
          if (!isVisible) return;
          msg.classList.add('msg-anim');
        }, (i + 1) * delayPerMsg);
        stepTimers.push(t);
      });

      /* Show typing indicator after last message */
      var typingStart = (messages.length + 1) * delayPerMsg;
      if (typingEl) {
        var t1 = setTimeout(function () {
          if (!isVisible) return;
          typingEl.classList.add('msg-anim');
        }, typingStart);
        stepTimers.push(t1);

        /* Hide typing after typingTime */
        var t2 = setTimeout(function () {
          if (!isVisible) return;
          typingEl.classList.remove('msg-anim');
        }, typingStart + typingTime);
        stepTimers.push(t2);
      }

      /* Schedule next cycle */
      var totalTime = typingStart + typingTime + resetPause;
      loopTimer = setTimeout(function () {
        if (isVisible) playSequence();
      }, totalTime);
    }

    if (noMotion) {
      /* Show all messages immediately without animation */
      messages.forEach(function (msg) { msg.classList.add('msg-anim'); });
      return;
    }

    var chatObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          isVisible = true;
          playSequence();
        } else {
          isVisible = false;
          clearTimers();
          resetChat();
        }
      });
    }, { threshold: 0.3 });

    chatObserver.observe(chatContainer);
  })();

  /* ============================================================
     TEXT SPLIT ANIMATION
     Elements with [data-split] have their text split into words,
     each wrapped for a slide-up reveal on scroll.
     ============================================================ */
  function initTextSplit() {
    var splitEls = document.querySelectorAll('[data-split]');
    if (splitEls.length === 0) return;

    if (noMotion) {
      /* No animation -- leave text as-is */
      return;
    }

    splitEls.forEach(function (el) {
      /* Guard: only split once */
      if (el.dataset.splitDone) return;
      el.dataset.splitDone = '1';

      var text  = el.textContent.trim();
      var words = text.split(/\s+/);
      el.textContent = '';
      el.setAttribute('aria-label', text);

      words.forEach(function (word, i) {
        /* Outer span hides overflow */
        var outer = document.createElement('span');
        outer.style.display      = 'inline-block';
        outer.style.overflow     = 'hidden';
        outer.style.verticalAlign = 'top';

        /* Inner span slides up */
        var inner = document.createElement('span');
        inner.textContent   = word;
        inner.style.display = 'inline-block';
        inner.style.transform  = 'translateY(110%)';
        inner.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ' + (i * 0.045) + 's';
        inner.className = 'split-word';

        outer.appendChild(inner);
        el.appendChild(outer);

        /* Add a space between words */
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(' '));
        }
      });
    });

    /* Observe for visibility */
    var splitObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var innerSpans = entry.target.querySelectorAll('.split-word');
          innerSpans.forEach(function (span) {
            span.style.transform = 'translateY(0)';
          });
          splitObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    splitEls.forEach(function (el) {
      splitObserver.observe(el);
    });
  }

  /* ============================================================
     COMPARISON BARS ANIMATION
     ============================================================ */
  function initCompBars() {
    var bars = document.querySelectorAll('.comp-bar[data-width]');
    if (!bars.length) return;

    var compObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var barEls = entry.target.querySelectorAll('.comp-bar[data-width]');
          barEls.forEach(function (bar) {
            var w = bar.dataset.width;
            bar.style.width = w + '%';
          });
          compObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.comp-row').forEach(function (row) {
      compObs.observe(row);
    });
  }

  initCompBars();

  /* ============================================================
     ROI CALCULATOR
     ============================================================ */
  function initRoiCalculator() {
    var leads  = document.getElementById('roi-leads');
    var ticket = document.getElementById('roi-ticket');
    var conv   = document.getElementById('roi-conv');
    var off    = document.getElementById('roi-off');
    if (!leads || !ticket || !conv || !off) return;

    var leadsV = document.getElementById('roi-leads-v');
    var ticketV = document.getElementById('roi-ticket-v');
    var convV = document.getElementById('roi-conv-v');
    var offV = document.getElementById('roi-off-v');
    var lossEl = document.getElementById('roi-loss');
    var gainEl = document.getElementById('roi-gain');
    var percentEl = document.getElementById('roi-percent');
    var paybackEl = document.getElementById('roi-payback');

    // Formatters
    function formatBRL(n) {
      n = Math.round(n);
      return 'R$ ' + n.toLocaleString('pt-BR');
    }

    // ROI logic (conservative — calibrated for small-city PME reality):
    // - Off-hour abandonment: 55% of leads who arrive outside expediente give up
    // - Current actual revenue = leads actually attended * conv% * ticket
    // - AI uplift: 1.6x conversion (capped at 22%) + captures 75% of off-hour leads
    // - Alex AI ongoing cost = R$ 1.197/mes (Pro plan)
    // - Setup unico Pro = R$ 3.997
    function update() {
      var L = parseInt(leads.value, 10);
      var T = parseInt(ticket.value, 10);
      var C = parseInt(conv.value, 10) / 100;
      var O = parseInt(off.value, 10) / 100;

      // Display values
      leadsV.textContent = L.toLocaleString('pt-BR');
      ticketV.textContent = formatBRL(T);
      convV.textContent = (C * 100).toFixed(0) + '%';
      offV.textContent = (O * 100).toFixed(0) + '%';

      var offAbandonment = 0.55; // 55% abandon when outside business hours
      var aiUplift = 1.6;
      var maxConv = 0.22;
      var aiCapture = 0.75; // recupera 75% dos off-hour

      // Currently lost revenue
      var leadsLostOff = L * O * offAbandonment;
      var currentAttended = L - leadsLostOff;
      var currentRevenue = currentAttended * C * T;

      // With Alex AI
      var aiLeadsLost = L * O * (1 - aiCapture); // only small % still leaks
      var aiAttended = L - aiLeadsLost;
      var aiConv = Math.min(C * aiUplift, maxConv);
      var aiRevenue = aiAttended * aiConv * T;

      var monthlyGain = Math.max(aiRevenue - currentRevenue, 0);
      var monthlyLoss = monthlyGain; // perda por nao ter Alex AI = ganho potencial

      // Annual ROI
      var aiYearCost = 1197 * 12 + 3997; // R$ 18.361
      var annualGain = monthlyGain * 12;
      var roiPct = aiYearCost > 0 ? ((annualGain - aiYearCost) / aiYearCost) * 100 : 0;

      // Payback in days
      var dailyGain = monthlyGain / 30;
      var totalInvest = 3997 + 1197;
      var paybackDays = dailyGain > 0 ? Math.ceil(totalInvest / dailyGain) : 0;

      // Apply with grammar
      lossEl.textContent = formatBRL(monthlyLoss);
      gainEl.textContent = formatBRL(aiRevenue);
      percentEl.textContent = Math.round(Math.max(roiPct, 0)).toLocaleString('pt-BR') + '%';

      var paybackText;
      if (paybackDays <= 0 || monthlyGain <= 0) {
        paybackText = 'ajuste os valores';
      } else if (paybackDays === 1) {
        paybackText = '1 dia';
      } else if (paybackDays < 365) {
        paybackText = paybackDays + ' dias';
      } else {
        paybackText = '> 1 ano';
      }
      paybackEl.textContent = paybackText;
    }

    [leads, ticket, conv, off].forEach(function (el) {
      el.addEventListener('input', update);
    });
    update();
  }

  initRoiCalculator();

  /* ============================================================
     CANVAS GRADIENT MESH (hero background)
     ============================================================ */
  function initHeroCanvas() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    if (prefersReducedMotion()) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    // Blobs: each is a large colored radial gradient that drifts
    var blobs = [
      { x: .25, y: .35, r: .55, color: [122, 141, 104], speed: .00012, phase: 0 },
      { x: .75, y: .55, r: .65, color: [217, 190, 138], speed: .00009, phase: 2 },
      { x: .50, y: .85, r: .50, color: [145, 123, 94],  speed: .00015, phase: 4 },
      { x: .10, y: .15, r: .40, color: [91,  107, 78],  speed: .00011, phase: 1 }
    ];

    var t0 = performance.now();
    function draw(t) {
      var dt = t - t0;
      ctx.clearRect(0, 0, w, h);
      // Darker base
      ctx.fillStyle = 'rgba(26,29,23,0)';
      ctx.fillRect(0, 0, w, h);

      blobs.forEach(function (b) {
        var cx = (b.x + Math.sin(dt * b.speed + b.phase) * .12) * w;
        var cy = (b.y + Math.cos(dt * b.speed * 1.3 + b.phase) * .12) * h;
        var rad = b.r * Math.max(w, h);
        var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        grd.addColorStop(0,   'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',.55)');
        grd.addColorStop(0.4, 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',.18)');
        grd.addColorStop(1,   'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    resize();
    draw(performance.now());
    window.addEventListener('resize', debounce(function () {
      canvas.width = 0; canvas.height = 0;
      resize();
    }, 180));
  }
  initHeroCanvas();

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */
  function initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', rafThrottle(update), { passive: true });
    update();
  }
  initScrollProgress();

  /* ============================================================
     MOUSE PARALLAX (hero shapes follow mouse)
     ============================================================ */
  function initMouseParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (prefersReducedMotion()) return;
    if (isTouchDevice()) return;

    var floats = document.querySelectorAll('.hero-float[data-depth]');
    var orbs = document.querySelectorAll('.hero-orb');
    if (!floats.length && !orbs.length) return;

    var targetX = 0, targetY = 0;
    var curX = 0, curY = 0;

    hero.addEventListener('mousemove', rafThrottle(function (e) {
      var rect = hero.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      targetX = (e.clientX - cx) / rect.width;
      targetY = (e.clientY - cy) / rect.height;
    }), { passive: true });

    function tick() {
      curX += (targetX - curX) * .06;
      curY += (targetY - curY) * .06;

      floats.forEach(function (el) {
        var depth = parseFloat(el.dataset.depth) || .4;
        var tx = -curX * 60 * depth;
        var ty = -curY * 60 * depth;
        el.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px, 0)';
      });

      orbs.forEach(function (el, i) {
        var d = (i + 1) * .15;
        var tx = curX * 40 * d;
        var ty = curY * 40 * d;
        el.style.setProperty('--mx', tx + 'px');
        el.style.setProperty('--my', ty + 'px');
        el.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px, 0)';
      });

      requestAnimationFrame(tick);
    }
    tick();
  }
  initMouseParallax();

  /* ============================================================
     CARD HOVER SPOTLIGHT (mouse-tracking gradient)
     ============================================================ */
  function initCardSpotlight() {
    if (isTouchDevice()) return;
    var cards = document.querySelectorAll('.plan-card, .cc-card, .tec-card, .feat, .step');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', rafThrottle(function (e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      }), { passive: true });
    });
  }
  initCardSpotlight();

  /* ============================================================
     SCROLL-LINKED PARALLAX (data-parallax)
     ============================================================ */
  function initScrollParallax() {
    if (prefersReducedMotion()) return;
    var items = document.querySelectorAll('[data-parallax]');
    if (!items.length) return;
    function update() {
      items.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var speed = parseFloat(el.dataset.parallax) || .3;
        var offset = (window.innerHeight / 2 - rect.top - rect.height / 2) * speed;
        el.style.setProperty('--parallax-y', offset + 'px');
        el.style.transform = 'translate3d(0,' + offset + 'px,0)';
      });
    }
    window.addEventListener('scroll', rafThrottle(update), { passive: true });
    update();
  }
  initScrollParallax();

  /* ============================================================
     PHASE 4 — BIG TECH LEVEL INTERACTIONS
     ============================================================ */

  /* ── 3D tilt on cards (mouse-reactive rotateX/rotateY) ── */
  function init3DTilt() {
    if (prefersReducedMotion() || isTouchDevice()) return;
    var cards = document.querySelectorAll('.feat, .step, .cc-card, .tec-card, .plan-card');
    var maxAngle = 8; // degrees
    cards.forEach(function (card) {
      var rafId = null;
      card.addEventListener('mousemove', function (e) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(function () {
          var rect = card.getBoundingClientRect();
          var cx = rect.width / 2;
          var cy = rect.height / 2;
          var dx = (e.clientX - rect.left - cx) / cx;
          var dy = (e.clientY - rect.top - cy) / cy;
          var ry = dx * maxAngle;
          var rx = -dy * maxAngle;
          card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
          card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        });
      }, { passive: true });
      card.addEventListener('mouseleave', function () {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--tz', '0px');
        card.style.setProperty('--ts', '1');
      });
    });
  }
  init3DTilt();

  /* ── Magnetic buttons (follow cursor with spring) ── */
  function initMagneticButtons() {
    if (prefersReducedMotion() || isTouchDevice()) return;
    var targets = document.querySelectorAll('.btn-fill, .magnetic, .nav-cta');
    targets.forEach(function (el) {
      var strength = 0.25;
      el.addEventListener('mousemove', rafThrottle(function (e) {
        var rect = el.getBoundingClientRect();
        var mx = e.clientX - rect.left - rect.width / 2;
        var my = e.clientY - rect.top - rect.height / 2;
        el.style.transform = 'translate3d(' + (mx * strength).toFixed(1) + 'px, ' + (my * strength).toFixed(1) + 'px, 0)';
      }), { passive: true });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }
  initMagneticButtons();

  /* ── Click ripple effect ── */
  function initRipple() {
    var targets = document.querySelectorAll('.btn-fill, .btn-outline, .nav-cta, .plan-cta');
    targets.forEach(function (el) {
      el.addEventListener('click', function (e) {
        var rect = el.getBoundingClientRect();
        var ripple = document.createElement('span');
        ripple.className = 'ripple';
        var size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top  = (e.clientY - rect.top - size / 2) + 'px';
        el.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 700);
      });
    });
  }
  initRipple();

  /* ── Viewport number counters (IntersectionObserver) ── */
  function initCounters() {
    if (prefersReducedMotion()) return;
    if (!('IntersectionObserver' in window)) return;
    var targets = document.querySelectorAll('[data-count]');
    // Auto-detect numbers in common stat elements
    var statSelectors = '.big-stat-number, .trust-num, .quiz-stat-val, .stat-number, .roi-out-num';
    document.querySelectorAll(statSelectors).forEach(function (el) {
      if (el.hasAttribute('data-count')) return;
      var txt = (el.textContent || '').trim();
      var match = txt.match(/^([^0-9]*)([\d.,]+)(.*)$/);
      if (match && match[2]) {
        var numStr = match[2].replace(/\./g, '').replace(',', '.');
        var num = parseFloat(numStr);
        if (!isNaN(num) && num > 0) {
          el.setAttribute('data-count', num);
          el.setAttribute('data-count-prefix', match[1] || '');
          el.setAttribute('data-count-suffix', match[3] || '');
          el.setAttribute('data-count-decimals', (numStr.split('.')[1] || '').length);
          el.setAttribute('data-count-orig', txt);
          targets = document.querySelectorAll('[data-count]'); // refresh
        }
      }
    });

    function formatNumber(n, decimals) {
      if (decimals > 0) {
        return n.toFixed(decimals).replace('.', ',');
      }
      return Math.round(n).toLocaleString('pt-BR');
    }

    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var decimals = parseInt(el.getAttribute('data-count-decimals'), 10) || 0;
      var prefix = el.getAttribute('data-count-prefix') || '';
      var suffix = el.getAttribute('data-count-suffix') || '';
      var duration = 1600;
      var start = performance.now();
      function tick(now) {
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        var val = target * eased;
        el.textContent = prefix + formatNumber(val, decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + formatNumber(target, decimals) + suffix;
      }
      requestAnimationFrame(tick);
    }

    var observed = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !observed.has(entry.target)) {
          observed.add(entry.target);
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    document.querySelectorAll('[data-count]').forEach(function (el) {
      io.observe(el);
    });
  }
  initCounters();

  /* ── Scroll to top floating button ── */
  function initScrollTop() {
    var btn = document.createElement('button');
    btn.id = 'scroll-top';
    btn.setAttribute('aria-label', 'Voltar ao topo');
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(btn);
    function toggle() {
      if (window.scrollY > window.innerHeight) btn.classList.add('visible');
      else btn.classList.remove('visible');
    }
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', rafThrottle(toggle), { passive: true });
    toggle();
  }
  initScrollTop();

  /* ── Enhanced staggered reveal for card grids ── */
  function initStaggerReveal() {
    if (prefersReducedMotion()) return;
    if (!('IntersectionObserver' in window)) return;
    // Auto-add .rv to card-grid children that don't already have it
    var groups = [
      '.features-grid',
      '.steps-grid',
      '.plans-grid',
      '.cc-grid',
      '.tec-grid',
      '.trust-row',
      '.about-tags',
      '.tech-tags'
    ];
    // Cards that have their own 3D transform — only add .rv (no .rv-up)
    var tiltClasses = ['feat', 'step', 'cc-card', 'tec-card', 'plan-card'];
    groups.forEach(function (sel) {
      var grid = document.querySelector(sel);
      if (!grid) return;
      Array.prototype.forEach.call(grid.children, function (child, i) {
        var isTilt = tiltClasses.some(function (c) { return child.classList.contains(c); });
        if (!child.classList.contains('rv')) {
          if (isTilt) child.classList.add('rv');
          else child.classList.add('rv', 'rv-up');
        }
        if (!child.style.getPropertyValue('--rv-delay')) {
          child.style.setProperty('--rv-delay', (i * 0.08) + 's');
        }
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('rv-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.rv').forEach(function (el) {
      io.observe(el);
    });
  }
  initStaggerReveal();

  /* ── FAQ accordion smooth expand ── */
  function initFAQ() {
    var items = document.querySelectorAll('.faq-item');
    items.forEach(function (item) {
      var q = item.querySelector('.faq-q, .faq-question');
      if (!q) return;
      q.addEventListener('click', function () {
        items.forEach(function (other) {
          if (other !== item) other.classList.remove('active');
        });
        item.classList.toggle('active');
      });
    });
  }
  initFAQ();

  /* ── Dynamic bg color shift based on scroll ── */
  function initBgShift() {
    if (prefersReducedMotion()) return;
    var sections = document.querySelectorAll('.section--dark, .section--dark-alt');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          document.body.classList.add('body-dark');
        } else {
          if (document.querySelectorAll('.section--dark.is-active, .section--dark-alt.is-active').length === 0) {
            document.body.classList.remove('body-dark');
          }
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { io.observe(s); });
  }
  initBgShift();

  /* ============================================================
     THEME TOGGLE (light / dark / system)
     ============================================================ */
  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    var root = document.documentElement;
    var STORAGE_KEY = 'alexai-theme';

    function getStored() {
      try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }
    function setStored(v) {
      try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {}
    }
    function currentTheme() {
      return root.getAttribute('data-theme') || 'light';
    }
    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      setStored(theme);
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
      btn.setAttribute('title',
        theme === 'dark' ? 'Tema claro' : 'Tema escuro');
      /* Dispatch custom event for other JS to react */
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      /* Add a brief visual flash for feedback */
      btn.animate(
        [
          { transform: 'rotate(0deg) scale(1)' },
          { transform: 'rotate(180deg) scale(1.15)' },
          { transform: 'rotate(360deg) scale(1)' }
        ],
        { duration: 600, easing: 'cubic-bezier(.22, 1, .36, 1)' }
      );
      applyTheme(next);
    });

    /* React to OS theme change if user hasn't made an explicit choice */
    if (window.matchMedia) {
      var mql = window.matchMedia('(prefers-color-scheme: dark)');
      var listener = function (e) {
        if (!getStored()) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      };
      if (mql.addEventListener) mql.addEventListener('change', listener);
      else if (mql.addListener) mql.addListener(listener);
    }
  }
  initThemeToggle();

  /* ============================================================
     SCARCITY SLOTS
     ------------------------------------------------------------
     Lets us update "vagas" copy without a redeploy. The operator
     sets window.ALEX_AI_SLOTS_LEFT before main.js loads (ex.: via
     a <script> no index.html, ou futuramente via endpoint). Os
     elementos com data-slots="..." recebem a copy certa, sem que
     a gente invente um numero que nao tem fonte.

     Sem config: o texto default do HTML ja diz "Poucas vagas",
     e o bloco com numero (.urgency-count) e' escondido pra nao
     mostrar placeholder "--".
     ============================================================ */
  function initScarcitySlots() {
    var cfg = window.ALEX_AI_SLOTS_LEFT;
    var nodes = document.querySelectorAll('[data-slots]');
    if (!nodes.length) return;

    function fmtLine(n) {
      if (n == null || n === false) return null;
      if (n <= 0) return 'Janela atual fechada';
      if (n === 1) return 'Ultima vaga disponivel';
      if (n <= 3) return 'Poucas vagas (' + n + ')';
      return n + ' vagas disponiveis';
    }

    nodes.forEach(function (el) {
      var bucket = el.getAttribute('data-slots');
      var value  = cfg && typeof cfg === 'object' ? cfg[bucket] : undefined;

      var target = el.querySelector('[data-slots-line]');
      var numEl  = el.querySelector('[data-slots-num]');

      if (typeof value === 'number') {
        var line = fmtLine(value);
        if (target && line) target.textContent = line;
        if (numEl) {
          numEl.textContent = value < 10 ? '0' + value : String(value);
          /* reveal any parent count wrapper */
          var wrapper = numEl.closest('.urgency-count');
          if (wrapper) wrapper.style.display = '';
        }
      } else {
        /* No value for this bucket: keep the default HTML copy,
           but hide numeric placeholder so we never render "--". */
        if (numEl) {
          var wrapper2 = numEl.closest('.urgency-count');
          if (wrapper2) wrapper2.style.display = 'none';
          else numEl.style.display = 'none';
        }
      }
    });
  }
  initScarcitySlots();

})();
