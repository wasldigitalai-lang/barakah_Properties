// Barakah AI — lead capture endpoint
// Saves callback requests into your Supabase database.
// Needs two environment variables on Vercel:
//   SUPABASE_URL          e.g. https://abcdxyz.supabase.co
//   SUPABASE_SERVICE_KEY  the "service_role" secret key (server-only, never in frontend)

const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5; // max 5 lead submissions per IP per 10 min

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, start: now };
  if (now - rec.start > WINDOW_MS) { rec.count = 0; rec.start = now; }
  rec.count += 1;
  hits.set(ip, rec);
  if (hits.size > 5000) hits.clear();
  return rec.count > MAX_HITS;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Lead storage not configured' });
  }

  const { name, phone, requirement, source } = req.body || {};

  // Validation
  const cleanName = String(name || '').trim().slice(0, 100);
  const cleanPhone = String(phone || '').replace(/[^\d]/g, '').replace(/^91/, '').slice(-10);
  const cleanReq = String(requirement || '').trim().slice(0, 1000);
  const cleanSource = String(source || 'website').trim().slice(0, 50);

  if (cleanName.length < 2) {
    return res.status(400).json({ error: 'Please enter your name' });
  }
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
  }

  try {
    const r = await fetch(process.env.SUPABASE_URL + '/rest/v1/leads', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        name: cleanName,
        phone: cleanPhone,
        requirement: cleanReq,
        source: cleanSource,
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error('Supabase insert failed:', r.status, t);
      return res.status(502).json({ error: 'Could not save right now' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Lead endpoint error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
