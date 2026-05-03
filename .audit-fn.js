// Self-contained audit function for Pralvex light-mode contrast audit.
// Runs in browser via playwright_evaluate. Returns array of issues.
() => {
  function parseColor(str) {
    if (!str) return null;
    str = str.trim();
    if (str === 'transparent' || str === 'none') return null;
    if (str.startsWith('#')) {
      let h = str.slice(1);
      if (h.length === 3) h = h.split('').map(c => c+c).join('');
      if (h.length !== 6) return null;
      return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16), a: 1 };
    }
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(/[,\s/]+/).filter(Boolean);
    const r = parseFloat(parts[0]), g = parseFloat(parts[1]), b = parseFloat(parts[2]);
    const a = parts.length>=4 ? parseFloat(parts[3]) : 1;
    if ([r,g,b].some(v=>isNaN(v))) return null;
    return { r, g, b, a };
  }
  function blend(fg, bg) {
    if (!fg) return null;
    if (fg.a >= 0.999) return { ...fg, a: 1 };
    if (!bg) return fg;
    const a = fg.a + bg.a * (1 - fg.a);
    return {
      r: (fg.r*fg.a + bg.r*bg.a*(1-fg.a))/a,
      g: (fg.g*fg.a + bg.g*bg.a*(1-fg.a))/a,
      b: (fg.b*fg.a + bg.b*bg.a*(1-fg.a))/a,
      a
    };
  }
  function relLum({r,g,b}) {
    const f = c => { c=c/255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); };
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);
  }
  function contrast(fg, bg) {
    const lf=relLum(fg), lb=relLum(bg);
    return (Math.max(lf,lb)+0.05)/(Math.min(lf,lb)+0.05);
  }
  function resolveBg(el) {
    let cur = el;
    while (cur && cur !== document.documentElement) {
      const cs = getComputedStyle(cur);
      const bg = parseColor(cs.backgroundColor);
      if (bg && bg.a > 0.05) {
        if (bg.a < 0.999) {
          let p = cur.parentElement;
          while (p && p !== document.documentElement) {
            const pcs = getComputedStyle(p);
            const pbg = parseColor(pcs.backgroundColor);
            if (pbg && pbg.a > 0.05) {
              if (pbg.a >= 0.999) return { bg: blend(bg, pbg), source: cur.tagName };
              p = p.parentElement; continue;
            }
            p = p.parentElement;
          }
          const bodyBg = parseColor(getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim()) || {r:255,g:255,b:255,a:1};
          return { bg: blend(bg, bodyBg), source: cur.tagName + '+body' };
        }
        return { bg, source: cur.tagName };
      }
      cur = cur.parentElement;
    }
    const bodyBg = parseColor(getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim()) || {r:245,g:239,b:230,a:1};
    return { bg: bodyBg, source: 'body' };
  }
  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    if (rect.width<4 || rect.height<4) return false;
    if (rect.bottom<-200) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility==='hidden' || cs.display==='none') return false;
    if (parseFloat(cs.opacity) < 0.1) return false;
    return true;
  }
  function getText(el) {
    let t='';
    for (const n of el.childNodes) if (n.nodeType===3) t+=n.nodeValue;
    return t.trim().slice(0,60);
  }
  function describe(el) {
    const id = el.id ? '#'+el.id : '';
    const cls = el.className && typeof el.className==='string' ? '.'+el.className.split(' ').filter(Boolean).slice(0,3).join('.') : '';
    return el.tagName.toLowerCase()+id+cls;
  }
  function textIsLarge(cs) {
    const fs = parseFloat(cs.fontSize);
    const fw = parseInt(cs.fontWeight,10) || 400;
    return fs >= 24 || (fs >= 18.66 && fw >= 700);
  }
  const issues = [];
  const seen = new Set();
  const sels = ['h1','h2','h3','h4','h5','h6','p','a','button','span','label','li','td','th','small'];
  const els = document.querySelectorAll(sels.join(','));
  els.forEach(el => {
    if (!isVisible(el)) return;
    const text = getText(el);
    if (!text || text.length < 2) return;
    const cs = getComputedStyle(el);
    const fg = parseColor(cs.color);
    if (!fg || fg.a < 0.05) return;
    const bgInfo = resolveBg(el);
    const bg = bgInfo.bg;
    const fgB = blend(fg, bg);
    if (!fgB) return;
    const ratio = contrast(fgB, bg);
    const large = textIsLarge(cs);
    const threshold = large ? 3 : 4.5;
    if (ratio < threshold) {
      const sig = describe(el)+'|'+text.slice(0,40);
      if (seen.has(sig)) return;
      seen.add(sig);
      issues.push({
        el: describe(el),
        text,
        fontSize: parseFloat(cs.fontSize).toFixed(0),
        fontWeight: cs.fontWeight,
        color: cs.color,
        bg: `rgb(${bg.r.toFixed(0)},${bg.g.toFixed(0)},${bg.b.toFixed(0)})`,
        bgAlpha: bg.a.toFixed(2),
        ratio: parseFloat(ratio.toFixed(2)),
        threshold,
        large,
        bgSource: bgInfo.source,
        severity: ratio < 2 ? 'P0' : (ratio < (threshold-0.5) ? 'P1' : 'P2')
      });
    }
  });
  return { count: issues.length, issues, theme: document.documentElement.getAttribute('data-theme'), url: location.pathname, bgBase: getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim() };
}
