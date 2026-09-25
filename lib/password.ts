// Hash de senha com PBKDF2-SHA256 via WebCrypto (disponível no Workers e no Node 22).
// 100.000 iterações é o máximo aceito pelo runtime da Cloudflare.
export const PBKDF2_ITERATIONS = 100_000;

const encoder = new TextEncoder();

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  if (!/^(?:[0-9a-f]{2})*$/i.test(hex)) throw new Error('Hex inválido');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function randomHex(byteLength = 32): string {
  return toHex(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export async function hashPassword(password: string, saltHex: string, iterations = PBKDF2_ITERATIONS): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex) as BufferSource, iterations },
    key,
    256,
  );
  return `pbkdf2_sha256$${iterations}$${toHex(new Uint8Array(bits))}`;
}

// Comparação em tempo constante para não vazar informação pelo tempo de resposta.
export function safeEqual(a: string, b: string): boolean {
  const x = encoder.encode(a), y = encoder.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export async function verifyPassword(password: string, saltHex: string, stored: string): Promise<boolean> {
  const [scheme, rounds] = stored.split('$');
  const iterations = Number(rounds);
  if (scheme !== 'pbkdf2_sha256' || !Number.isInteger(iterations) || iterations < 1) return false;
  return safeEqual(await hashPassword(password, saltHex, iterations), stored);
}

export async function sha256Hex(value: string): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
}

export function normalizeEmail(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().slice(0, 254);
}

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Regras mínimas: 8+ caracteres, com letra e número.
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (password.length > 200) return 'A senha é longa demais.';
  if (!/[A-Za-zÀ-ÿ]/.test(password) || !/\d/.test(password)) return 'Use letras e números na senha.';
  return null;
}

// Normaliza respostas para a correção literal (sem acentos, caixa e pontuação).
export function normalizeAnswer(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\u2212\u2013\u2014]/g, '-') // sinais de menos tipográficos
    .replace(/-(?=\d)/g, ' NEG') // preserva o sinal de números negativos
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}
