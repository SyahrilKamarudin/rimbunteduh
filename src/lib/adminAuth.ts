import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'rt_admin_session';

function getSecret(): string {
  const secret = import.meta.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('Missing ADMIN_SESSION_SECRET environment variable');
  return secret;
}

function computeToken(): string {
  return createHmac('sha256', getSecret()).update('rimbun-teduh-admin').digest('hex');
}

export function checkPassword(password: string): boolean {
  const expected = import.meta.env.ADMIN_PASSWORD;
  if (!expected) throw new Error('Missing ADMIN_PASSWORD environment variable');
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function sessionCookieValue(): string {
  return computeToken();
}

export function isRequestAuthed(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  const provided = Buffer.from(match[1]);
  const expected = Buffer.from(computeToken());
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
