#!/usr/bin/env node
/**
 * Alex AI -- automated QA smoke test.
 *
 * Purpose: machine-verifiable slice of QA_CHECKLIST.md that blocks
 * deploys when the site diverges from expected content. Runs in
 * two modes:
 *
 *   - offline (default): parses local files in this directory
 *   - online:            hits a running URL (useful for preview
 *                        deployments on Vercel or localhost)
 *
 * Exits 0 on success, 1 on any failure. Stdout is human-readable,
 * stderr is reserved for fatal errors.
 *
 * Usage:
 *   node scripts/qa-smoke.mjs
 *   node scripts/qa-smoke.mjs --url https://alexai.com.br
 *   node scripts/qa-smoke.mjs --url http://localhost:8090
 *
 * This script intentionally avoids dependencies so it can run on a
 * clean Vercel build image without `npm install` beyond what the
 * project already needs.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = join(__dirname, '..');

/* ---------- CLI args ---------- */
const args = process.argv.slice(2);
const urlFlagIdx = args.indexOf('--url');
const baseUrl = urlFlagIdx >= 0 ? args[urlFlagIdx + 1] : null;

/* ---------- tiny check harness ---------- */
let passed = 0;
let failed = 0;
const failures = [];

function check(label, condition, hint) {
  if (condition) {
    passed++;
    console.log('  ok   ' + label);
  } else {
    failed++;
    failures.push({ label, hint });
    console.log('  FAIL ' + label + (hint ? ' -- ' + hint : ''));
  }
}

function section(title) {
  console.log('\n== ' + title + ' ==');
}

/* ---------- file loader (offline) + http loader (online) ---------- */
async function loadFile(rel) {
  if (baseUrl) {
    const url = baseUrl.replace(/\/$/, '') + '/' + rel.replace(/^\//, '');
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('text/') || ct.includes('json') || ct.includes('xml') || ct.includes('javascript')) {
      return await res.text();
    }
    // binary: return byte length as a string marker
    const buf = new Uint8Array(await res.arrayBuffer());
    return { __binary: true, length: buf.byteLength, contentType: ct };
  }
  try {
    return await readFile(join(siteRoot, rel), 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      // offline mode: maybe it's a binary we can stat
      const { stat } = await import('node:fs/promises');
      const s = await stat(join(siteRoot, rel));
      return { __binary: true, length: s.size, contentType: null };
    }
    throw err;
  }
}

/* ---------- main ---------- */
async function main() {
  console.log('Alex AI QA smoke test');
  console.log('Mode: ' + (baseUrl ? 'online (' + baseUrl + ')' : 'offline (local files)'));

  let html, css, mainJs, vercelJson, sitemap, privacidade, termos, cspReport;

  try {
    html        = await loadFile('index.html');
    css         = await loadFile('css/style.css');
    mainJs      = await loadFile('js/main.js');
    vercelJson  = await loadFile('vercel.json');
    sitemap     = await loadFile('sitemap.xml');
    privacidade = await loadFile('privacidade.html');
    termos      = await loadFile('termos.html');
    cspReport   = baseUrl ? null : await loadFile('api/csp-report.js').catch(() => null);
  } catch (err) {
    console.error('FATAL: could not load required files. ' + err.message);
    process.exit(1);
  }

  section('1. Hero credibility bugs (Tier 1.1-1.3)');
  check('hero corner TR says ALEX AI, not LEXAI',
    /hero-corner--tr[^>]*>\s*ALEX AI \/ 2026/.test(html),
    'verify index.html hero-corner--tr');
  check('hero corner BL starts with S, not N',
    /hero-corner--bl[^>]*>\s*S 18\.918/.test(html),
    'verify index.html hero-corner--bl');
  check('H1 targets WhatsApp outcome',
    /hero-title[\s\S]*?Atendimento[\s\S]*?WhatsApp[\s\S]*?fecha venda/.test(html),
    'verify .hero-title copy');

  section('2. Footer legal (Tier 1.4)');
  check('footer shows CNPJ line (em registro)',
    /CNPJ:\s*em registro/i.test(html),
    'verify .footer-legal extension');
  check('footer shows DPO email contact',
    /contato@alexai\.com\.br/.test(html),
    'verify mailto DPO');
  check('footer Politica link points to /privacidade.html',
    /href="\/privacidade\.html"/.test(html),
    'verify .footer-legal-links');
  check('footer Termos link points to /termos.html',
    /href="\/termos\.html"/.test(html),
    'verify .footer-legal-links');
  check('no placeholder # links in footer-legal-links',
    !/footer-legal-links[\s\S]{0,500}href="#"/.test(html),
    'found dead # link in footer');

  section('3. Marquee PT-BR (Tier 1.5)');
  check('marquee does not contain Natural Language Processing',
    !/Natural Language Processing/.test(html),
    'found English tech token in marquee');
  check('marquee has PT-BR benefit copy',
    /Atende no WhatsApp 24\/7/.test(html),
    'missing PT-BR marquee item');

  section('4. Social proof honesty (Tier 1.6-1.7)');
  check('fake logo wall is removed',
    !/class="logo-wall"/.test(html),
    'logo-wall still present');
  check('fabricated case-study numbers removed (1.9x, 54%, R$ 38k)',
    !/data-target="1\.9"/.test(html) && !/data-target="54"/.test(html),
    'invented case metrics still present');
  check('pilot-note block exists',
    /class="case-study pilot-note[^"]*"/.test(html),
    'pilot-note missing');
  check('social-proof--founder exists',
    /class="social-proof--founder/.test(html),
    'social-proof--founder missing');

  section('5. Scarcity dynamic (Tier 1.8)');
  check('no hardcoded "Apenas 3 vagas" string',
    !/Apenas 3 vagas/.test(html),
    'still hardcoded');
  check('no hardcoded "Apenas 1 vaga restante"',
    !/Apenas 1 vaga/.test(html),
    'still hardcoded');
  check('no hardcoded "Restam 2 vagas"',
    !/Restam 2 vagas/.test(html),
    'still hardcoded');
  check('data-slots attributes wired (urgency/essencial/pro)',
    /data-slots="urgency"/.test(html) && /data-slots="essencial"/.test(html) && /data-slots="pro"/.test(html),
    'missing data-slots hooks');
  check('main.js has initScarcitySlots',
    /function initScarcitySlots/.test(mainJs),
    'scarcity initializer missing');
  check('scarcity init hides urgency-count when no value',
    /closest\(['"]\.urgency-count['"]\)/.test(mainJs),
    'urgency-count hide logic missing');

  section('6. FAQ progressive disclosure (Tier 1.9)');
  check('FAQ has at least 2 <details class="faq-answer__expand">',
    (html.match(/faq-answer__expand/g) || []).length >= 2,
    'expected 2 progressive FAQ items');
  check('FAQ 1 has plain-language lead ("Resposta curta")',
    /Resposta curta:.{0,40}um chatbot comum/.test(html),
    'FAQ 1 plain lead missing');
  check('CSS for faq-answer__expand exists',
    /\.faq-answer__expand\s*\{/.test(css),
    'CSS rule missing');
  check('FAQPage JSON-LD uses simplified Q1 "chatbot" text',
    /"name":\s*"O que e Alex AI e por que e diferente de um chatbot\?"/.test(html),
    'JSON-LD not updated');

  section('7. Meta + OG (Tier 1.10)');
  check('meta description mentions WhatsApp 24/7',
    /<meta name="description"[^>]+WhatsApp[^>]+24\/7/.test(html),
    'meta description not updated');
  check('<title> uses new headline',
    /<title>Alex AI -- Assistente de IA que fecha venda no WhatsApp<\/title>/.test(html),
    'title not updated');
  check('og:image points to .png primary',
    /<meta property="og:image" content="https:\/\/alexai\.com\.br\/og-image\.png"/.test(html),
    'og:image.png missing');
  check('twitter:image points to .png',
    /<meta name="twitter:image" content="https:\/\/alexai\.com\.br\/og-image\.png"/.test(html),
    'twitter:image.png missing');

  section('8. TL;DR section (Tier 2.1)');
  check('#tldr section exists',
    /id="tldr"/.test(html),
    'TL;DR section missing');
  check('TL;DR eyebrow says "Em 60 segundos"',
    /class="tldr__eyebrow">Em 60 segundos/.test(html),
    'TL;DR eyebrow wrong');
  check('TL;DR has 3 bullets',
    (html.match(/class="tldr__bullet"/g) || []).length >= 3,
    'TL;DR bullets missing');
  check('TL;DR CSS exists',
    /\.tldr__headline/.test(css),
    'TL;DR CSS missing');

  section('9. og-image.png (Tier 2.3)');
  const og = await loadFile('og-image.png').catch(() => null);
  check('og-image.png exists',
    og !== null,
    'run: npx --yes svgexport og-image.svg og-image.png 1200:630');
  if (og && og.__binary) {
    check('og-image.png is not empty',
      og.length > 1000,
      'suspiciously small PNG');
    check('og-image.png is under 500KB (Twitter limit 1MB)',
      og.length < 500 * 1024,
      'PNG is ' + Math.round(og.length / 1024) + 'KB');
  }

  section('10. Analytics + Sentry + CSP (Tier 2.4, 2.8)');
  check('Vercel Analytics script tag present',
    /_vercel\/insights\/script\.js/.test(html),
    'Vercel Analytics missing');
  check('Sentry gated loader present',
    /ALEX_AI_SENTRY_DSN/.test(html),
    'Sentry loader missing');
  check('CSP allows vercel-scripts',
    /va\.vercel-scripts\.com/.test(vercelJson),
    'CSP script-src missing Vercel');
  check('CSP allows sentry ingest',
    /sentry\.io/.test(vercelJson),
    'CSP connect-src missing Sentry');
  check('CSP has report-uri /api/csp-report',
    /report-uri \/api\/csp-report/.test(vercelJson),
    'CSP report-uri missing');
  check('vercel.json has Report-To header',
    /"Report-To"/.test(vercelJson),
    'Report-To missing');
  check('vercel.json has Reporting-Endpoints header',
    /"Reporting-Endpoints"/.test(vercelJson),
    'Reporting-Endpoints missing');
  if (cspReport !== undefined && cspReport !== null) {
    check('api/csp-report.js exports handler',
      /module\.exports\s*=\s*async function handler/.test(cspReport) ||
      /export default/.test(cspReport),
      'CSP endpoint handler missing');
  }

  section('11. Founder numbers (Tier 2.5)');
  check('.founder-numbers block exists',
    /class="founder-numbers"/.test(html),
    'founder-numbers missing');
  check('founder-numbers CSS exists',
    /\.founder-numbers__value/.test(css),
    'founder-numbers CSS missing');

  section('12. Legal pages');
  check('privacidade.html has Politica de Privacidade title',
    /Politica de Privacidade/.test(privacidade),
    'privacidade title missing');
  check('privacidade.html mentions LGPD',
    /LGPD/.test(privacidade),
    'LGPD missing');
  check('privacidade.html has DPO email',
    /contato@alexai\.com\.br/.test(privacidade),
    'DPO email missing');
  check('termos.html has Termos de Uso title',
    /Termos de Uso/.test(termos),
    'termos title missing');
  check('termos.html links to privacidade',
    /\/privacidade\.html/.test(termos),
    'cross-link missing');

  section('13. Sitemap');
  check('sitemap includes home',
    /<loc>https:\/\/alexai\.com\.br\/<\/loc>/.test(sitemap),
    'home missing from sitemap');
  check('sitemap includes privacidade.html',
    /privacidade\.html/.test(sitemap),
    'privacidade missing from sitemap');
  check('sitemap includes termos.html',
    /termos\.html/.test(sitemap),
    'termos missing from sitemap');

  section('14. Defensive: no fabricated content reintroduced');
  check('no "680 leads" fake metric',
    !/680 leads/.test(html),
    'fabricated metric returned');
  check('no "Diretor Comercial" fake author',
    !/case-author-name">Diretor Comercial/.test(html),
    'fake testimonial returned');
  check('no "Logotipos representativos" disclaimer',
    !/Logotipos representativos/.test(html),
    'fake-logo disclaimer returned');

  /* ---------- summary ---------- */
  console.log('\n' + '-'.repeat(60));
  const total = passed + failed;
  console.log('Total: ' + total + '  passed: ' + passed + '  failed: ' + failed);
  if (failed > 0) {
    console.log('\nFailures:');
    failures.forEach(function (f) { console.log('  - ' + f.label); });
    console.log('\nQA smoke test FAILED. Deploy blocked.');
    process.exit(1);
  }
  console.log('\nQA smoke test PASSED. Safe to deploy.');
  process.exit(0);
}

main().catch(function (err) {
  console.error('FATAL:', err && err.stack || err);
  process.exit(1);
});
