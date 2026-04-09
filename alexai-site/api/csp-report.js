/**
 * CSP violation reporter.
 *
 * The Content-Security-Policy header in vercel.json declares this URL as
 * `report-uri` and `report-to`. Browsers POST a JSON body describing any
 * directive that was blocked. This function accepts the report, logs it
 * to stdout (picked up by Vercel logs / Sentry if configured), and
 * returns 204 so the browser does not retry.
 *
 * Intentionally minimal: no database, no fan-out, no auth. The goal is
 * to close the loop on CSP reports without introducing new infra.
 *
 * Runtime: Node.js (Vercel default).
 */
module.exports = async function handler(req, res) {
  // CORS: browsers send from same origin, but CSP reports can include
  // cross-origin navigations. Accept any origin but only the POST verb.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  try {
    var body = req.body;

    // Vercel parses JSON by default, but CSP reports use two MIME types:
    //   - "application/csp-report"       (legacy report-uri)
    //   - "application/reports+json"     (Reporting API)
    // If the parser did not handle it, try to parse manually.
    if (!body || typeof body === 'string') {
      try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; }
    }

    // Normalize: legacy wraps under "csp-report", Reporting API sends an
    // array of events. We log both shapes verbatim so downstream tooling
    // can distinguish.
    var report = {
      ts: new Date().toISOString(),
      ua: req.headers['user-agent'] || null,
      shape: Array.isArray(body) ? 'reporting-api' : 'legacy',
      payload: body
    };

    // Single-line JSON so it plays nice with Vercel log aggregation.
    console.log('[csp-report]', JSON.stringify(report));
  } catch (err) {
    console.error('[csp-report] parse failure', err && err.message);
  }

  // 204 No Content — browsers will not retry.
  res.status(204).end();
};
