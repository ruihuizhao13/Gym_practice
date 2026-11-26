/**
 * Practice Gym · AI connector (Cloudflare Worker)
 *
 * Sits between the Practice Gym website and the Claude API so testers can use the AI
 * without an API key. Your key is stored as a secret in Cloudflare, never in GitHub.
 *
 * Settings (Cloudflare → your Worker → Settings → Variables and Secrets):
 *   ANTHROPIC_API_KEY  (Secret, required)  your Claude API key, sk-ant-...
 *   ALLOWED_ORIGINS    (Text, required)    your site, e.g. https://yourname.github.io
 *                                          (several: separate with commas)
 *   ACCESS_CODE        (Secret, optional)  if set, testers need a link ending in #code=<this>
 *   MODELS             (Text, optional)    allowed model IDs, comma-separated
 *                                          default: claude-sonnet-5-5,claude-haiku-5-5
 */

const DEFAULT_MODELS = ['claude-sonnet-5-5', 'claude-haiku-5-5'];
const MAX_TOKENS = 4096;          // cap per reply
const MAX_MESSAGES = 80;          // cap per request
const MAX_CHARS = 120000;         // cap on total text sent per request

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);
    const originOk = allowed.includes(origin);

    const cors = {
      'Access-Control-Allow-Origin': originOk ? origin : (allowed[0] || 'null'),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, x-pg-code',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    const reply = (status, type, message) =>
      new Response(JSON.stringify({ type: 'error', error: { type, message } }), {
        status, headers: { ...cors, 'content-type': 'application/json' },
      });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method === 'GET') return reply(200, 'ok', 'Practice Gym AI connector is running. The website sends POST requests here.');
    if (request.method !== 'POST') return reply(405, 'method', 'Use POST.');
    if (!env.ANTHROPIC_API_KEY) return reply(500, 'setup', 'ANTHROPIC_API_KEY is not set on the Worker.');
    if (!originOk) return reply(403, 'origin', 'This website is not in ALLOWED_ORIGINS.');
    if (env.ACCESS_CODE && request.headers.get('x-pg-code') !== env.ACCESS_CODE) {
      return reply(401, 'access_code', 'Missing or wrong access code.');
    }

    let body;
    try { body = await request.json(); } catch { return reply(400, 'bad_request', 'Body must be JSON.'); }

    const models = env.MODELS ? env.MODELS.split(',').map(s => s.trim()).filter(Boolean) : DEFAULT_MODELS;
    const model = models.includes(body.model) ? body.model : models[0];
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const chars = messages.reduce((n, m) => n + String(m && m.content || '').length, 0);
    if (!messages.length || messages.length > MAX_MESSAGES || chars > MAX_CHARS) {
      return reply(400, 'bad_request', 'The conversation is empty or too long.');
    }
    const clean = {
      model,
      max_tokens: Math.min(Number(body.max_tokens) || 1024, MAX_TOKENS),
      messages: messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content) })),
      stream: !!body.stream,
    };

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(clean),
    });

    const headers = new Headers(cors);
    headers.set('content-type', upstream.headers.get('content-type') || 'application/json');
    headers.set('cache-control', 'no-store');
    return new Response(upstream.body, { status: upstream.status, headers });
  },
};
