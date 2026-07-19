import { useEffect, useMemo, useState } from 'react';

type Status = 'Confirmed' | 'Pending' | 'Cancelled';

interface ApiBooking {
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
  status: Status;
  created_at: string;
}

interface Booking {
  ref: string;
  name: string;
  phone: string;
  dates: string;
  guests: string;
  addons: string;
  total: number;
  status: Status;
}

const STATUS_COLORS: Record<Status, { bg: string; color: string }> = {
  Confirmed: { bg: '#E4EFE2', color: '#1E3A2B' },
  Pending: { bg: '#F7EBD3', color: '#93691C' },
  Cancelled: { bg: '#F5E4E1', color: '#a8402f' },
};

const STATUS_OPTIONS: (Status | 'All')[] = ['All', 'Confirmed', 'Pending', 'Cancelled'];

const NAV_ITEMS = [
  { label: 'Dashboard', active: true },
  { label: 'Bookings', active: false },
];

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateRange(checkIn: string, checkOut: string): string {
  const a = new Date(checkIn + 'T00:00:00Z');
  const b = new Date(checkOut + 'T00:00:00Z');
  const sameMonth = a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear();
  if (sameMonth) {
    return `${a.getUTCDate()}–${b.getUTCDate()} ${MONTH_ABBR[b.getUTCMonth()]} ${b.getUTCFullYear()}`;
  }
  return `${a.getUTCDate()} ${MONTH_ABBR[a.getUTCMonth()]}–${b.getUTCDate()} ${MONTH_ABBR[b.getUTCMonth()]} ${b.getUTCFullYear()}`;
}

function formatGuests(adults: number, children: number): string {
  let s = `${adults} Adult${adults === 1 ? '' : 's'}`;
  if (children > 0) s += `, ${children} Child${children === 1 ? '' : 'ren'}`;
  return s;
}

function formatAddons(b: ApiBooking): string {
  const labels: string[] = [];
  if (b.bbq) labels.push('BBQ Set');
  if (b.foraging) labels.push('Foraging Session');
  if (b.breakfast) labels.push('Breakfast');
  return labels.length ? labels.join(', ') : '—';
}

function toDisplayBooking(b: ApiBooking): Booking {
  return {
    ref: b.reference,
    name: b.name,
    phone: b.phone,
    dates: formatDateRange(b.check_in, b.check_out),
    guests: formatGuests(b.adults, b.children),
    addons: formatAddons(b),
    total: b.total,
    status: b.status,
  };
}

export default function AdminDashboard({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [search, setSearch] = useState('');
  const [selectedRef, setSelectedRef] = useState<string | null>(null);

  async function loadBookings() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/bookings', { credentials: 'include' });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      setBookings((data.bookings as ApiBooking[]).map(toDisplayBooking));
    } catch (e) {
      setLoadError('Could not load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const filtered = useMemo(
    () =>
      bookings.filter(
        (b) => (statusFilter === 'All' || b.status === statusFilter) && b.name.toLowerCase().includes(search.toLowerCase())
      ),
    [bookings, statusFilter, search]
  );

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'Pending').length,
      upcoming: bookings.filter((b) => b.status !== 'Cancelled').length,
      revenue: bookings.filter((b) => b.status !== 'Cancelled').reduce((sum, b) => sum + b.total, 0).toLocaleString(),
    }),
    [bookings]
  );

  const selected = bookings.find((b) => b.ref === selectedRef) || null;

  async function updateStatus(ref: string, status: Status) {
    try {
      const res = await fetch(`/api/bookings/${ref}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      if (!res.ok) throw new Error('Update failed');
      setBookings((prev) => prev.map((b) => (b.ref === ref ? { ...b, status } : b)));
      setSelectedRef(null);
    } catch (e) {
      alert('Could not update booking. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="flex w-60 flex-shrink-0 flex-col bg-forest-dark py-6 text-footer-heading">
        <div className="mb-5 flex items-center gap-2.5 border-b border-white/10 px-6 pb-6">
          <div
            className="h-9 w-9 flex-shrink-0 rounded-full bg-cover bg-no-repeat"
            style={{ backgroundImage: "url('/logo.png')", backgroundSize: '220% auto', backgroundPosition: 'center 18%' }}
          ></div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-[15px] font-semibold text-white">RIMBUN TEDUH</span>
            <span className="text-[9px] tracking-[1.5px] text-footer-muted">ADMIN PANEL</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 px-3">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ' +
                (item.active ? 'bg-white/[0.08] font-semibold text-white' : 'text-[#C7D2C0]')
              }
            >
              {item.label}
            </div>
          ))}
        </div>
        <div className="mt-auto px-6">
          <a href="/" className="flex items-center gap-2 text-[13px] text-footer-muted no-underline">← Back to Site</a>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-9">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="font-serif text-[28px] text-ink">Bookings</div>
            <div className="mt-1 text-sm text-muted">Manage cabin stay reservations and requests.</div>
          </div>
          <div className="flex items-center gap-2.5 rounded-[10px] bg-white py-2 pl-3.5 pr-2 shadow-[0_4px_14px_rgba(30,40,25,0.06)]">
            <div className="h-8 w-8 rounded-full bg-gold"></div>
            <div className="flex flex-col pr-2 leading-tight">
              <span className="text-[13px] font-semibold text-ink">Siti (Host)</span>
              <span className="text-[11px] text-muted-2">Admin</span>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-[0_6px_18px_rgba(30,40,25,0.06)]">
            <div className="mb-2 text-xs text-muted-2">Total Bookings</div>
            <div className="font-serif text-[28px] text-ink">{stats.total}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_6px_18px_rgba(30,40,25,0.06)]">
            <div className="mb-2 text-xs text-muted-2">Pending Review</div>
            <div className="font-serif text-[28px] text-gold">{stats.pending}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_6px_18px_rgba(30,40,25,0.06)]">
            <div className="mb-2 text-xs text-muted-2">Upcoming Stays</div>
            <div className="font-serif text-[28px] text-ink">{stats.upcoming}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[0_6px_18px_rgba(30,40,25,0.06)]">
            <div className="mb-2 text-xs text-muted-2">Revenue (MYR)</div>
            <div className="font-serif text-[28px] text-ink">RM {stats.revenue}</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-card-lg bg-white shadow-[0_6px_18px_rgba(30,40,25,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-forest/[0.08] p-5">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatusFilter(opt)}
                  className={
                    'rounded-lg border-[1.5px] px-4 py-2 text-[13px] font-semibold ' +
                    (opt === statusFilter ? 'border-forest bg-forest text-white' : 'border-forest/15 bg-transparent text-[#3d4a37]')
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest name..."
              className="w-[220px] rounded-lg border-[1.5px] border-forest/15 px-3.5 py-2.5 text-[13px] text-ink"
            />
          </div>

          {loading && <div className="p-8 text-center text-sm text-muted">Loading bookings…</div>}
          {loadError && (
            <div className="p-8 text-center text-sm text-[#a8402f]">
              {loadError} <button type="button" onClick={loadBookings} className="ml-2 underline">Retry</button>
            </div>
          )}

          {!loading && !loadError && (
            <>
              <div className="hidden grid-cols-[1.6fr_1.3fr_0.9fr_1.1fr_0.9fr_0.9fr] border-b border-forest/[0.06] px-6 py-3.5 text-[11px] font-semibold tracking-[0.8px] text-muted-2 md:grid">
                <div>GUEST</div><div>DATES</div><div>GUESTS</div><div>ADD-ONS</div><div>TOTAL</div><div>STATUS</div>
              </div>

              {filtered.map((b) => (
                <div
                  key={b.ref}
                  onClick={() => setSelectedRef(b.ref)}
                  className="grid cursor-pointer grid-cols-2 gap-2 border-b border-forest/[0.06] px-6 py-4 md:grid-cols-[1.6fr_1.3fr_0.9fr_1.1fr_0.9fr_0.9fr] md:items-center md:gap-0"
                >
                  <div>
                    <div className="text-sm font-semibold text-ink">{b.name}</div>
                    <div className="text-xs text-muted-2">{b.ref}</div>
                  </div>
                  <div className="text-[13px] text-[#3d4a37]">{b.dates}</div>
                  <div className="text-[13px] text-[#3d4a37]">{b.guests}</div>
                  <div className="text-[13px] text-[#3d4a37]">{b.addons}</div>
                  <div className="text-sm font-semibold text-ink">RM {b.total}</div>
                  <div>
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: STATUS_COLORS[b.status].bg, color: STATUS_COLORS[b.status].color }}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="p-8 text-center text-sm text-muted">No bookings match your filters.</div>}
            </>
          )}
        </div>
      </main>

      {selected && (
        <>
          <div onClick={() => setSelectedRef(null)} className="fixed inset-0 z-[60] bg-[rgba(20,30,20,0.35)]"></div>
          <div className="fixed bottom-0 right-0 top-0 z-[61] w-full max-w-[420px] overflow-y-auto bg-white p-8 shadow-[-10px_0_40px_rgba(0,0,0,0.15)]">
            <div className="mb-6 flex items-center justify-between">
              <div className="font-serif text-xl text-ink">Booking Details</div>
              <button type="button" onClick={() => setSelectedRef(null)} className="text-xl text-muted">×</button>
            </div>
            <div className="flex flex-col gap-3.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Reference</span><span className="font-semibold text-ink">{selected.ref}</span></div>
              <div className="flex justify-between"><span className="text-muted">Guest Name</span><span className="font-semibold text-ink">{selected.name}</span></div>
              <div className="flex justify-between"><span className="text-muted">Phone</span><span className="font-semibold text-ink">{selected.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted">Dates</span><span className="font-semibold text-ink">{selected.dates}</span></div>
              <div className="flex justify-between"><span className="text-muted">Guests</span><span className="font-semibold text-ink">{selected.guests}</span></div>
              <div className="flex justify-between"><span className="text-muted">Add-ons</span><span className="font-semibold text-ink">{selected.addons}</span></div>
              <div className="flex justify-between border-t border-forest/10 pt-3.5"><span className="text-muted">Total</span><span className="text-lg font-bold text-ink">RM {selected.total}</span></div>
            </div>
            <div className="mt-7 flex flex-col gap-2.5">
              <button type="button" onClick={() => updateStatus(selected.ref, 'Confirmed')} className="rounded-lg bg-forest py-3 text-sm font-semibold text-white">Confirm Booking</button>
              <button type="button" onClick={() => updateStatus(selected.ref, 'Cancelled')} className="rounded-lg border-[1.5px] border-[#e0b3a8] bg-white py-3 text-sm font-semibold text-[#a8402f]">Cancel Booking</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
