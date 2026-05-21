// Edge Middleware — gates the demo with an expiry.
//
// Expiry is controlled by DEMO_EXPIRES_AT (set in Vercel → Settings →
// Environment Variables) as an ISO timestamp, e.g.
// "2026-05-28T20:00:00+08:00". If unset, the demo has no expiry and
// stays open. Redeploy after changing the env var.

export const config = {
  matcher: '/((?!.*\\.(?:css|js|mjs|jpg|jpeg|png|svg|ico|webp|gif|woff|woff2|ttf|map|txt|json)).*)',
};

export default function middleware() {
  const expiresAt = process.env.DEMO_EXPIRES_AT;
  if (!expiresAt) return;
  const expiresMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresMs)) return;
  if (Date.now() <= expiresMs) return;

  return new Response(EXPIRED_HTML, {
    status: 403,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Demo-Expired': '1',
    },
  });
}

const EXPIRED_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Demo Expired — Discovery Kuta Festival</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --emerald-deep: #0b3a2e;
    --emerald: #14533f;
    --gold: #c9a961;
    --ivory: #f8f4ec;
    --cream: #f0e9d8;
    --muted: #6b6358;
    --line: #d9cfb8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    font-family: 'Outfit', sans-serif;
    background: var(--ivory);
    color: var(--emerald-deep);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    line-height: 1.5;
  }
  .wrap {
    max-width: 560px;
    text-align: center;
  }
  .brand {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    letter-spacing: 0.18em;
    color: var(--emerald);
    margin-bottom: 56px;
    text-transform: uppercase;
  }
  .brand i {
    font-style: italic;
    text-transform: none;
    letter-spacing: 0.02em;
    color: var(--gold);
  }
  .status {
    display: inline-block;
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gold);
    border: 1px solid var(--line);
    padding: 8px 16px;
    margin-bottom: 32px;
  }
  h1 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 500;
    font-size: 56px;
    line-height: 1.05;
    margin-bottom: 24px;
    color: var(--emerald-deep);
  }
  h1 em {
    font-style: italic;
    color: var(--gold);
  }
  p {
    font-size: 16px;
    color: var(--muted);
    max-width: 420px;
    margin: 0 auto 12px;
  }
  .meta {
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid var(--line);
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }
  .meta strong {
    color: var(--emerald);
    font-weight: 500;
  }
  @media (max-width: 600px) {
    h1 { font-size: 40px; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="brand">DISCOVERY <i>Kuta</i> FESTIVAL</div>
    <div class="status">403 · Demo Window Closed</div>
    <h1>This preview has <em>concluded.</em></h1>
    <p>Thank you for reviewing the Discovery Kuta Festival prototype.</p>
    <p>The demonstration window has elapsed — access to this link is no longer available.</p>
    <div class="meta">
      For an extended preview, please contact the Discovery Mall team.<br/>
      <strong>Prototype · v0.9</strong>
    </div>
  </div>
</body>
</html>`;
