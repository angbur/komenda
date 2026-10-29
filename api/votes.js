const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const MAX_VOTES = 3;

async function redis(commands) {
  const r = await fetch(URL_ + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).map(x => x.result);
}

function readBody(req) {
  return new Promise(resolve => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let s = '';
    req.on('data', c => { s += c; });
    req.on('end', () => { try { resolve(JSON.parse(s || '{}')); } catch (e) { resolve({}); } });
  });
}

async function counts() {
  const [flat] = await redis([['HGETALL', 'votes']]);
  const out = {};
  for (let i = 0; i < flat.length; i += 2) out[flat[i]] = Number(flat[i + 1]);
  return out;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(200).json({ configured: false });
  try {
    if (req.method === 'GET') {
      const voter = String(req.query.voter || '');
      const mine = voter ? (await redis([['SMEMBERS', 'voter:' + voter]]))[0].map(Number) : [];
      return res.status(200).json({ configured: true, counts: await counts(), mine, max: MAX_VOTES });
    }
    if (req.method === 'POST') {
      const body = await readBody(req);
      const id = Number(body.id), voter = String(body.voter || '').slice(0, 64);
      if (!Number.isInteger(id) || !/^[a-z0-9-]{8,64}$/.test(voter)) return res.status(400).json({ error: 'bad request' });
      const key = 'voter:' + voter;
      const [has, size] = await redis([['SISMEMBER', key, id], ['SCARD', key]]);
      if (has) {
        await redis([['SREM', key, id], ['HINCRBY', 'votes', id, -1]]);
      } else {
        if (size >= MAX_VOTES) return res.status(409).json({ error: 'limit', max: MAX_VOTES });
        await redis([['SADD', key, id], ['HINCRBY', 'votes', id, 1]]);
      }
      const mine = (await redis([['SMEMBERS', key]]))[0].map(Number);
      return res.status(200).json({ configured: true, counts: await counts(), mine, max: MAX_VOTES });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  } catch (e) {
    return res.status(502).json({ error: 'storage', detail: String(e.message || e) });
  }
};
