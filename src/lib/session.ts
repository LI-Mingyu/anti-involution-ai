/**
 * 轻量级 session 工具：基于 HMAC-SHA256 签名的 cookie，无需额外依赖。
 * 生产环境请设置 SESSION_SECRET 环境变量（至少 32 位随机字符串）。
 */

const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 天

/** 获取签名密钥（Node.js crypto 的 CryptoKey） */
async function getKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET ?? 'default-dev-secret-change-in-production'
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

/** 生成签名 token：payload.timestamp.signature（base64url） */
export async function createSessionToken(): Promise<string> {
  const payload = `admin:${Date.now()}`
  const key = await getKey()
  const enc = new TextEncoder()
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  const sigB64 = Buffer.from(sig).toString('base64url')
  return `${Buffer.from(payload).toString('base64url')}.${sigB64}`
}

/** 验证 token，返回 true/false */
export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [payloadB64, sigB64] = token.split('.')
    if (!payloadB64 || !sigB64) return false

    const payload = Buffer.from(payloadB64, 'base64url').toString()
    const key = await getKey()
    const enc = new TextEncoder()
    const sig = Buffer.from(sigB64, 'base64url')
    const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(payload))
    if (!valid) return false

    // 检查时效（7 天）
    const ts = parseInt(payload.split(':')[1] ?? '0', 10)
    return Date.now() - ts < SESSION_TTL_SECONDS * 1000
  } catch {
    return false
  }
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS }
