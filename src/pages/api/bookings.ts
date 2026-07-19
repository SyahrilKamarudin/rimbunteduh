import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import { isRequestAuthed } from '../../lib/adminAuth';

export const prerender = false;

function generateReference(checkIn: string): string {
  const d = new Date(checkIn);
  const year = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RT-${year}-${mm}${dd}-${rand}`;
}

export const GET: APIRoute = async ({ request }) => {
  if (!isRequestAuthed(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ bookings: data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};

interface CreateBookingBody {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  bbq: boolean;
  foraging: boolean;
  breakfast: boolean;
  name: string;
  phone: string;
  email: string;
  requests: string;
  cabinSubtotal: number;
  bbqCost: number;
  foragingCost: number;
  breakfastCost: number;
  total: number;
}

export const POST: APIRoute = async ({ request }) => {
  let body: CreateBookingBody;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  if (!body.checkIn || !body.checkOut || !body.name || !body.phone) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = generateReference(body.checkIn);
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        reference,
        check_in: body.checkIn,
        check_out: body.checkOut,
        adults: body.adults,
        children: body.children,
        bbq: body.bbq,
        foraging: body.foraging,
        breakfast: body.breakfast,
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        requests: body.requests || null,
        cabin_subtotal: body.cabinSubtotal,
        bbq_cost: body.bbqCost,
        foraging_cost: body.foragingCost,
        breakfast_cost: body.breakfastCost,
        total: body.total,
        status: 'Pending',
      })
      .select()
      .single();

    if (!error) {
      return new Response(JSON.stringify({ booking: data }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }
    if (error.code !== '23505') {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    // 23505 = unique_violation on reference, retry with a new one
  }

  return new Response(JSON.stringify({ error: 'Could not generate a unique booking reference' }), { status: 500 });
};
