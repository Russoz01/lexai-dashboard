import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'

/* ════════════════════════════════════════════════════════════════════
 * crypto-tokens · v1.0 (2026-05-02)
 * ────────────────────────────────────────────────────────────────────
 * AES-256-GCM encryption pra OAuth tokens (Google, Microsoft, etc)
 * armazenados no Supabase. LGPD Art. 46 exige medida técnica de
 * proteção; tokens em texto plano = sequestro de calendar de TODOS
 * users se DB vazar.
 *
 * Audit Wave R1 fix SEC-04 — antes refresh_token + access_token Google
 * eram armazenados em texto plano em oauth_tokens table.
 *
 * Implementação:
 * - AES-256-GCM (auth + encryption)
 * - IV 12 bytes random por encrypt (NIST recommendation)
 * - Auth tag 16 bytes
 * - Key derivada via SHA-256 de OAUTH_ENCRYPTION_KEY env var
 * - Output: base64(iv || authTag || ciphertext)
 *
 * Compat: tokens existentes sem prefixo "enc:" tratados como plain
 * (backward-compat). Toda escrita nova vai com prefixo "enc:".
 *
 * Setup: precisa OAUTH_ENCRYPTION_KEY env var (32+ chars random).
 * Gere com: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 * ═══════════════════════════════════════════════════════════════════ */

const ALGO = 'aes-256-gcm'
const IV_LEN = 12
const AUTH_TAG_LEN = 16
const ENCRYPTED_PREFIX = 'enc:'

/**
 * Deriva chave AES-256 de string env var via SHA-256.
 * Permite key de qualquer comprimento (mais seguro que truncar).
 */
function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest()
}

function getKey(): Buffer {
  const secret = process.env.OAUTH_ENCRYPTION_KEY
  if (!secret || secret.length < 16) {
    throw new Error('OAUTH_ENCRYPTION_KEY env var ausente ou < 16 chars')
  }
  return deriveKey(secret)
}

/**
 * Encripta string com AES-256-GCM. Retorna "enc:base64payload".
 * Idempotente: se já tem prefixo enc:, retorna sem re-encryptar.
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext) return plaintext
  if (plaintext.startsWith(ENCRYPTED_PREFIX)) return plaintext

  const key = getKey()
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  // Format: iv (12 bytes) || authTag (16 bytes) || ciphertext
  const payload = Buffer.concat([iv, authTag, encrypted])
  return ENCRYPTED_PREFIX + payload.toString('base64')
}

/**
 * Decripta string. Aceita formatos:
 * - "enc:base64..." → decripta
 * - texto plano → retorna como está (backward-compat com tokens antigos)
 *
 * Throws se OAUTH_ENCRYPTION_KEY ausente OU auth tag inválido (tamper).
 */
export function decryptToken(value: string): string {
  if (!value) return value
  if (!value.startsWith(ENCRYPTED_PREFIX)) {
    // Token sem prefixo = legacy plain text (antes de SEC-04 fix)
    return value
  }

  const key = getKey()
  const payload = Buffer.from(value.slice(ENCRYPTED_PREFIX.length), 'base64')

  const iv = payload.subarray(0, IV_LEN)
  const authTag = payload.subarray(IV_LEN, IV_LEN + AUTH_TAG_LEN)
  const ciphertext = payload.subarray(IV_LEN + AUTH_TAG_LEN)

  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

/**
 * Helper: verifica se string já está encriptada.
 */
export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(ENCRYPTED_PREFIX)
}

/**
 * Helper: verifica se OAUTH_ENCRYPTION_KEY está configurado.
 * Routes podem usar pra detectar se devem encryptar ou skipar (graceful degrade).
 */
export function isCryptoConfigured(): boolean {
  const secret = process.env.OAUTH_ENCRYPTION_KEY
  return typeof secret === 'string' && secret.length >= 16
}
