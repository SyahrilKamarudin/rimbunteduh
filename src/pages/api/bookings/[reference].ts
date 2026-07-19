import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { isRequestAuthed } from '../../../lib/adminAuth';

export const prerender = false;

export const PATCH: APIRoute = async ({ request, params }) => {
  if (!isRequestAuthed(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const reference = params.reference;
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  if (body.status !== 'Confirmed' && body.status !== 'Cancelled' && body.status !== 'Pending') {
    return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: body.status })
    .eq('reference', reference)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ booking: data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
