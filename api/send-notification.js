const webpush = require('web-push');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.ADMIN_NOTIFICATION_KEY || req.headers['x-admin-key'] !== process.env.ADMIN_NOTIFICATION_KEY)
    return res.status(401).json({ error: 'Unauthorized' });
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token, VAPID_PUBLIC_KEY: pub, VAPID_PRIVATE_KEY: priv, VAPID_SUBJECT: subject } = process.env;
  if (!url || !token || !pub || !priv || !subject) return res.status(500).json({ error: 'Missing server environment variables.' });
  try {
    webpush.setVapidDetails(subject, pub, priv);
    const key = 'vx:push:subscriptions';
    const read = await fetch(url + '/lrange/' + encodeURIComponent(key) + '/0/-1', { headers: { Authorization: 'Bearer ' + token } });
    const result = await read.json();
    if (!read.ok || result.error) throw new Error(result.error || 'Could not read subscriptions.');
    const subscriptions = result.result || [];
    const payload = JSON.stringify({ title: req.body?.title || 'VEER EXPLORER', body: req.body?.body || 'A new update is available.', url: req.body?.url || '/' });
    let sent = 0, failed = 0;
    for (const raw of subscriptions) {
      try { await webpush.sendNotification(typeof raw === 'string' ? JSON.parse(raw) : raw, payload); sent++; }
      catch (e) { failed++; }
    }
    return res.status(200).json({ ok: true, sent, failed, total: subscriptions.length });
  } catch (e) { return res.status(500).json({ error: e.message || 'Push send failed.' }); }
};
