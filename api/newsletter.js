import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email || '').trim());
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};

  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    // Same-origin requests don't need CORS, but this keeps preflights happy if they occur.
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ ok: false, error: 'Server not configured' });
  }

  const body = await readJsonBody(req);
  const email = String(body?.email || '').trim();
  const source = String(body?.source || '').trim() || null;

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email' });
  }

  try {
    await sql`
      insert into newsletter_signups (email, source)
      values (${email}, ${source})
      on conflict (email) do nothing
    `;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('newsletter insert failed', err);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
}

