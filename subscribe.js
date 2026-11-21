module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { subscription } = req.body || {};
    if (!subscription || !subscription.endpoint) return res.status(400).json({ error: 'A valid subscription is required.' });
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return res.status(500).json({ error: 'Upstash environment variables are missing.' });
    const key = 'vx:push:subscriptions';
    const r = await fetch(url + '/rpush/' + encodeURIComponent(key) + '/' + encodeURIComponent(JSON.stringify(subscription)), {
      headers: { Authorization: 'Bearer ' + token }
    });
    const d = await r.json();
    if (!r.ok || d.error) return res.status(502).json({ error: d.error || 'Upstash save failed.' });
    return res.status(200).json({ ok: true });
  } catch (e) { return res.status(500).json({ error: e.message || 'Subscription save failed.' }); }
};
