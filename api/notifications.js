async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Missing Upstash environment variables');
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  });
  if (!response.ok) throw new Error(`Upstash error: ${response.status}`);
  const result = await response.json();
  if (result.error) throw new Error(result.error);
  return result.result;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const rows = await redis(['LRANGE', 'veer:notifications', '0', '29']);
    const notifications = (rows || []).map(row => {
      try { return JSON.parse(row); } catch (_) { return null; }
    }).filter(Boolean);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ notifications: [], error: 'Could not load notifications' });
  }
};
