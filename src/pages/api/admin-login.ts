import type { APIRoute } from 'astro';
import { checkPassword, sessionCookieValue, ADMIN_COOKIE_NAME } from '../../lib/adminAuth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  if (!body.password || !checkPassword(body.password)) {
    return new Response(JSON.stringify({ error: 'Incorrect password' }), { status: 401 });
  }

  const cookieValue = sessionCookieValue();
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${ADMIN_COOKIE_NAME}=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Secure`,
    },
  });
};
