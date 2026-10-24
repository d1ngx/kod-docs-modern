import { isIP } from 'node:net';
const normalize = ip => ip?.replace(/^::ffff:/, '') || '';
export function clientIP(req, trusted = process.env.DOCS_TRUSTED_PROXIES || '') {
  const peer = normalize(req.socket.remoteAddress);
  const proxies = trusted.split(',').map(ip => normalize(ip.trim())).filter(Boolean);
  const forwarded = req.headers['x-real-ip'];
  return proxies.includes(peer) && typeof forwarded === 'string' && isIP(forwarded)
    ? normalize(forwarded) : peer;
}
