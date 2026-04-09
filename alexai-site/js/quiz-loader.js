/* quiz-loader.js — lazy-loads quiz.js when #avaliacao enters the viewport.
   Savings: ~37% of initial JS payload.
   Fallback: loads on window.load if IntersectionObserver is unsupported. */
(function () {
  var loaded = false;
  function loadQuiz() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.src = 'js/quiz.js';
    s.async = true;
    document.body.appendChild(s);
  }
  var target = document.getElementById('avaliacao');
  if (!target) { window.addEventListener('load', loadQuiz); return; }
  if (!('IntersectionObserver' in window)) {
    window.addEventListener('load', loadQuiz);
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        loadQuiz();
        io.disconnect();
        break;
      }
    }
  }, { rootMargin: '400px 0px' });
  io.observe(target);
  // Also load on first user interaction (covers fast scroll past threshold)
  ['pointerdown', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, loadQuiz, { once: true, passive: true });
  });
})();
