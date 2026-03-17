import { createHash } from 'crypto';
import { cookies } from 'next/headers';

const SALT = 'sf2024';
const COOKIE = 'sf_uid';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password + SALT).digest('hex');
}

export async function getSessionUserId(): Promise<number | null> {
  const store = await cookies();
  const val = store.get(COOKIE)?.value;
  if (!val) return null;
  const n = parseInt(val);
  return isNaN(n) ? null : n;
}

export function setSessionCookie(userId: number): Record<string, string | boolean | number> {
  return {
    name: COOKIE,
    value: String(userId),
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}
