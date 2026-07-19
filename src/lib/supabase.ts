import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

// Service-role client — server-side only (API routes). Never import this in client components.
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export interface BookingRow {
  id: string;
  reference: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  bbq: boolean;
  foraging: boolean;
  breakfast: boolean;
  name: string;
  phone: string;
  email: string | null;
  requests: string | null;
  cabin_subtotal: number;
  bbq_cost: number;
  foraging_cost: number;
  breakfast_cost: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  created_at: string;
}
