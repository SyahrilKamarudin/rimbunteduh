import { useEffect, useMemo, useState } from 'react';
import { translations, type Lang } from '../i18n/translations';

const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_MS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];

const CABIN_RATE = 680;

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    const stored = (typeof window !== 'undefined' && (localStorage.getItem('rt_lang') as Lang)) || 'en';
    setLang(stored);
    const handler = (e: Event) => setLang((e as CustomEvent).detail.lang);
    window.addEventListener('rt-lang-change', handler);
    return () => window.removeEventListener('rt-lang-change', handler);
  }, []);
  return lang;
}

function buildMonth(
  year: number,
  monthIndex: number,
  monthNames: string[],
  checkIn: number | null,
  checkOut: number | null,
  onSelect: (ts: number) => void
) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const startWeekday = (firstDay.getUTCDay() + 6) % 7;

  const dayNums: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) dayNums.push(null);
  for (let d = 1; d <= daysInMonth; d++) dayNums.push(d);
  while (dayNums.length % 7 !== 0) dayNums.push(null);

  const cells = dayNums.map((d) => {
    if (d === null) return { label: '', style: { visibility: 'hidden' as const }, onClick: () => {} };
    const ts = Date.UTC(year, monthIndex, d);
    const selected = ts === checkIn || ts === checkOut;
    const inRange = !!checkIn && !!checkOut && ts > checkIn && ts < checkOut;
    let bg = 'transparent';
    let color = '#26301F';
    let weight = 400;
    if (selected) {
      bg = '#1E3A2B';
      color = '#fff';
      weight = 700;
    } else if (inRange) {
      bg = '#D7E4D3';
    }
    return {
      label: String(d),
      onClick: () => onSelect(ts),
      style: { textAlign: 'center' as const, padding: '8px 0', borderRadius: '6px', background: bg, color, fontSize: '13px', fontWeight: weight, cursor: 'pointer' },
    };
  });

  return { label: `${monthNames[monthIndex]} ${year}`, dow: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], cells };
}

function fmtDate(ts: number | null, monthNames: string[], selectLabel: string) {
  if (!ts) return selectLabel;
  const d = new Date(ts);
  return `${d.getUTCDate()} ${monthNames[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}`;
}

export interface BookingData {
  checkInLabel: string;
  checkOutLabel: string;
  nights: number;
  adults: number;
  children: number;
  guestsSummary: string;
  bbq: boolean;
  foraging: boolean;
  breakfast: boolean;
  name: string;
  phone: string;
  email: string;
  total: number;
  cabinSubtotal: number;
  foragingCost: number;
  breakfastCost: number;
  bbqCost: number;
  reference: string;
}

export default function BookingWizard() {
  const lang = useLang();
  const t = translations[lang].booking;
  const monthNames = lang === 'ms' ? MONTH_NAMES_MS : MONTH_NAMES_EN;

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState<number | null>(Date.UTC(2026, 7, 24));
  const [checkOut, setCheckOut] = useState<number | null>(Date.UTC(2026, 7, 26));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [bbq, setBbq] = useState(true);
  const [foraging, setForaging] = useState(false);
  const [breakfast, setBreakfast] = useState(false);
  const [name, setName] = useState('Ahmad Hafiz bin Rahman');
  const [phone, setPhone] = useState('+60 12-345 6789');
  const [email, setEmail] = useState('');
  const [requests, setRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  function selectDate(ts: number) {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(ts);
      setCheckOut(null);
    } else if (ts > checkIn) {
      setCheckOut(ts);
    } else {
      setCheckIn(ts);
      setCheckOut(null);
    }
  }

  const nights = checkIn && checkOut ? Math.round((checkOut - checkIn) / 86400000) : 0;
  const cabinSubtotal = CABIN_RATE * nights;
  const foragingCost = foraging ? 45 * adults : 0;
  const breakfastCost = breakfast ? 25 * (adults + children) : 0;
  const bbqCost = bbq ? 80 : 0;
  const total = cabinSubtotal + bbqCost + foragingCost + breakfastCost;

  const checkInLabel = fmtDate(checkIn, monthNames, t.selectDate);
  const checkOutLabel = fmtDate(checkOut, monthNames, t.selectDate);
  const guestsSummary =
    lang === 'ms'
      ? `${adults} Dewasa${children > 0 ? `, ${children} Kanak-kanak` : ''}`
      : `${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}`;

  const months = useMemo(
    () => [buildMonth(2026, 7, monthNames, checkIn, checkOut, selectDate), buildMonth(2026, 8, monthNames, checkIn, checkOut, selectDate)],
    [checkIn, checkOut, lang]
  );

  const steps = t.stepLabels.map((label, i) => {
    const n = i + 1;
    const isCurrent = n === step;
    const isDone = n < step;
    const filled = isCurrent || isDone;
    return { n, label, showArrow: n < 4, filled };
  });

  function isoDate(ts: number | null): string {
    if (!ts) return '';
    return new Date(ts).toISOString().slice(0, 10);
  }

  async function goNext() {
    if (step === 4) {
      setSubmitting(true);
      setSubmitError(false);
      let reference: string;
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkIn: isoDate(checkIn),
            checkOut: isoDate(checkOut),
            adults, children, bbq, foraging, breakfast, name, phone, email, requests,
            cabinSubtotal, bbqCost, foragingCost, breakfastCost, total,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          reference = data.booking.reference;
        } else {
          setSubmitError(true);
          setSubmitting(false);
          return;
        }
      } catch (e) {
        setSubmitError(true);
        setSubmitting(false);
        return;
      }

      const data: BookingData = {
        checkInLabel, checkOutLabel, nights, adults, children, guestsSummary,
        bbq, foraging, breakfast, name, phone, email, total, cabinSubtotal, foragingCost, breakfastCost, bbqCost, reference,
      };
      try {
        sessionStorage.setItem('rt_booking', JSON.stringify(data));
      } catch (e) {}
      window.location.href = '/booking-confirmation';
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  }

  const stepperCircle = (filled: boolean) =>
    'flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] text-sm font-bold ' +
    (filled ? 'border-forest bg-forest text-white' : 'border-forest/25 bg-white text-muted-2');

  const addonRow = (
    selected: boolean,
    icon: JSX.Element,
    title: string,
    desc: string,
    price: string,
    onToggle: () => void
  ) => (
    <div
      onClick={onToggle}
      className={'flex cursor-pointer items-center gap-4 rounded-xl border-[1.5px] p-5 ' + (selected ? 'border-gold' : 'border-forest/[0.15]')}
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[10px] bg-cream">{icon}</div>
      <div className="flex-1">
        <div className="text-[15px] font-semibold text-ink">{title}</div>
        <div className="text-[13px] text-muted">{desc}</div>
      </div>
      <div className="mr-2 text-sm font-semibold text-ink">{price}</div>
      <div className={'h-[22px] w-[22px] flex-shrink-0 rounded-md border-[1.5px] ' + (selected ? 'border-gold bg-gold' : 'border-forest/25 bg-white')}></div>
    </div>
  );

  return (
    <>
      <div className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-3.5 px-6 py-8 md:px-16">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-3.5">
            <div className="flex items-center gap-2.5">
              <div className={stepperCircle(s.filled)}>{s.n}</div>
              <span className={'text-sm ' + (s.n === step ? 'font-bold text-ink' : 'font-medium text-muted-2')}>{s.label}</span>
            </div>
            {s.showArrow && (
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="#c4bfa8" strokeWidth="1.5">
                <line x1="0" y1="6" x2="18" y2="6"></line>
                <polyline points="13 1 18 6 13 11"></polyline>
              </svg>
            )}
          </div>
        ))}
      </div>

      <div className="mx-auto mb-24 grid max-w-content-lg grid-cols-1 gap-8 px-6 md:grid-cols-[1.6fr_1fr] md:px-16">
        <div className="min-h-[520px] rounded-card-lg bg-white p-6 shadow-card md:p-10">
          {step === 1 && (
            <div>
              <div className="mb-1.5 font-serif text-2xl text-ink">{t.step1.title}</div>
              <div className="mb-7 text-sm text-muted">{t.step1.subtitle}</div>

              <div className="mb-7 grid grid-cols-2 gap-5">
                <div>
                  <div className="mb-2 text-[11px] tracking-[1px] text-muted-2">{t.step1.checkIn}</div>
                  <div className="rounded-lg border-[1.5px] border-gold px-3.5 py-3 text-[15px] font-semibold text-ink">{checkInLabel}</div>
                </div>
                <div>
                  <div className="mb-2 text-[11px] tracking-[1px] text-muted-2">{t.step1.checkOut}</div>
                  <div className="rounded-lg border-[1.5px] border-forest/20 px-3.5 py-3 text-[15px] font-semibold text-ink">{checkOutLabel}</div>
                </div>
              </div>

              <div className="mb-7 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {months.map((month, mi) => (
                  <div key={mi}>
                    <div className="mb-3 text-center text-sm font-semibold text-ink">{month.label}</div>
                    <div className="mb-1.5 grid grid-cols-7 gap-1">
                      {month.dow.map((d, di) => (
                        <div key={di} className="text-center text-[11px] font-semibold text-muted-2">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {month.cells.map((cell, ci) => (
                        <div key={ci} onClick={cell.onClick} style={cell.style as any}>{cell.label}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-8 flex gap-5 text-xs text-muted">
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-[3px] bg-forest"></div>{t.step1.selected}</div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-[3px] bg-[#D7E4D3]"></div>{t.step1.inRange}</div>
              </div>

              <div className="grid grid-cols-1 gap-8 border-t border-forest/[0.12] pt-7 sm:grid-cols-2">
                <div>
                  <div className="mb-2.5 text-[13px] font-semibold text-ink">{t.step1.adults}</div>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setAdults((a) => Math.max(1, a - 1))} className="h-[34px] w-[34px] rounded-lg border-[1.5px] border-forest/20 bg-white text-lg text-ink">−</button>
                    <span className="min-w-[16px] text-center text-base font-semibold text-ink">{adults}</span>
                    <button type="button" onClick={() => setAdults((a) => Math.min(6, a + 1))} className="h-[34px] w-[34px] rounded-lg border-[1.5px] border-forest/20 bg-white text-lg text-ink">+</button>
                  </div>
                </div>
                <div>
                  <div className="mb-2.5 text-[13px] font-semibold text-ink">{t.step1.children}</div>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setChildren((c) => Math.max(0, c - 1))} className="h-[34px] w-[34px] rounded-lg border-[1.5px] border-forest/20 bg-white text-lg text-ink">−</button>
                    <span className="min-w-[16px] text-center text-base font-semibold text-ink">{children}</span>
                    <button type="button" onClick={() => setChildren((c) => Math.min(4, c + 1))} className="h-[34px] w-[34px] rounded-lg border-[1.5px] border-forest/20 bg-white text-lg text-ink">+</button>
                  </div>
                </div>
              </div>
              <div className="mt-3.5 text-xs text-muted-2">{t.step1.maxNote}</div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-1.5 font-serif text-2xl text-ink">{t.step2.title}</div>
              <div className="mb-7 text-sm text-muted">{t.step2.subtitle}</div>
              <div className="flex flex-col gap-4">
                {addonRow(
                  bbq,
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A2B" strokeWidth="1.6"><path d="M12 3 C10 6 14 7 12 10 C10 12 12 14 12 14"></path><path d="M6 21 C6 16 9 14 12 14 C15 14 18 16 18 21"></path></svg>,
                  t.step2.bbqTitle, t.step2.bbqDesc, t.step2.bbqPrice,
                  () => setBbq((v) => !v)
                )}
                {addonRow(
                  foraging,
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A2B" strokeWidth="1.6"><path d="M12 20 C12 12 6 10 4 4 C11 5 15 9 15 16"></path><path d="M15 16 C15 11 19 8 20 5 C17 8 15 12 15 20"></path></svg>,
                  t.step2.foragingTitle, t.step2.foragingDesc, t.step2.foragingPrice,
                  () => setForaging((v) => !v)
                )}
                {addonRow(
                  breakfast,
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E3A2B" strokeWidth="1.6"><path d="M12 20 C12 14 6 12 6 7 C6 4.5 8 3 12 3 C16 3 18 4.5 18 7 C18 12 12 14 12 20 Z"></path></svg>,
                  t.step2.breakfastTitle, t.step2.breakfastDesc, t.step2.breakfastPrice,
                  () => setBreakfast((v) => !v)
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-1.5 font-serif text-2xl text-ink">{t.step3.title}</div>
              <div className="mb-7 text-sm text-muted">{t.step3.subtitle}</div>
              <div className="flex max-w-[480px] flex-col gap-6">
                <div>
                  <div className="mb-2 text-[13px] font-semibold text-ink">{t.step3.fullName}</div>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmad Hafiz bin Rahman" className="w-full rounded-lg border-[1.5px] border-forest/20 px-3.5 py-3 text-sm text-ink" />
                </div>
                <div>
                  <div className="mb-2 text-[13px] font-semibold text-ink">{t.step3.phoneNumber}</div>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 12-345 6789" className="w-full rounded-lg border-[1.5px] border-forest/20 px-3.5 py-3 text-sm text-ink" />
                </div>
                <div>
                  <div className="mb-2 text-[13px] font-semibold text-ink">{t.step3.email}</div>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border-[1.5px] border-forest/20 px-3.5 py-3 text-sm text-ink" />
                </div>
                <div>
                  <div className="mb-2 text-[13px] font-semibold text-ink">{t.step3.requestsLabel}</div>
                  <textarea value={requests} onChange={(e) => setRequests(e.target.value)} placeholder={t.step3.requestsPlaceholder} className="min-h-[90px] w-full resize-y rounded-lg border-[1.5px] border-forest/20 px-3.5 py-3 text-sm text-ink" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="mb-1.5 font-serif text-2xl text-ink">{t.step4.title}</div>
              <div className="mb-7 text-sm text-muted">{t.step4.subtitle}</div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-forest/10 pb-4"><span className="text-sm text-muted">{t.step4.guestName}</span><span className="text-sm font-semibold text-ink">{name}</span></div>
                <div className="flex justify-between border-b border-forest/10 pb-4"><span className="text-sm text-muted">{t.step4.phone}</span><span className="text-sm font-semibold text-ink">{phone}</span></div>
                <div className="flex justify-between border-b border-forest/10 pb-4"><span className="text-sm text-muted">{t.step4.email}</span><span className="text-sm font-semibold text-ink">{email}</span></div>
                <div className="flex justify-between border-b border-forest/10 pb-4"><span className="text-sm text-muted">{t.step4.dates}</span><span className="text-sm font-semibold text-ink">{checkInLabel} – {checkOutLabel}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted">{t.step4.guests}</span><span className="text-sm font-semibold text-ink">{guestsSummary}</span></div>
              </div>
            </div>
          )}

          {submitError && (
            <div className="mt-4 rounded-lg bg-[#F5E4E1] px-4 py-3 text-sm text-[#a8402f]">
              Something went wrong submitting your booking. Please try again.
            </div>
          )}

          <div className="mt-9 flex justify-between border-t border-forest/10 pt-6">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} className="rounded-lg border-[1.5px] border-forest/20 bg-white px-6 py-3.5 text-sm font-semibold text-ink">{t.back}</button>
            ) : <div />}
            <button type="button" onClick={goNext} disabled={submitting} className="flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-sm font-semibold text-white disabled:opacity-60">
              {step === 4 ? (submitting ? 'Submitting…' : t.confirmBooking) : t.next}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5 md:sticky md:top-6 md:self-start">
          <div className="overflow-hidden rounded-card-lg bg-white shadow-card">
            <div className="flex h-[180px] w-full items-end overflow-hidden bg-[#DDD6C4]">
              <span className="p-2 text-[10px] text-[#5c5745]/80">Seri Teduh Cabin exterior</span>
            </div>
            <div className="p-6">
              <div className="mb-2.5 font-serif text-xl text-ink">Seri Teduh Cabin</div>
              <div className="mb-6 flex gap-4 text-[12.5px] text-muted">
                <span>{t.sidebar.bedrooms}</span><span>{t.sidebar.upTo}</span><span>{t.sidebar.riverside}</span>
              </div>

              <div className="mb-3 flex justify-between text-xs font-semibold tracking-[1px] text-muted-2">
                <span>{t.sidebar.staySummary}</span>
              </div>
              <div className="mb-5 flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between"><span className="text-muted">{t.sidebar.checkIn}</span><span className="font-semibold text-ink">{checkInLabel}</span></div>
                <div className="flex justify-between"><span className="text-muted">{t.sidebar.checkOut}</span><span className="font-semibold text-ink">{checkOutLabel}</span></div>
                <div className="flex justify-between"><span className="text-muted">{t.sidebar.nights}</span><span className="font-semibold text-ink">{nights}</span></div>
                <div className="flex justify-between"><span className="text-muted">{t.sidebar.guests}</span><span className="font-semibold text-ink">{guestsSummary}</span></div>
              </div>

              <div className="mb-4 flex flex-col gap-2.5 border-t border-forest/10 pt-4 text-sm">
                <div className="flex justify-between"><span className="text-muted">{t.sidebar.cabinRate} ({nights} {t.sidebar.nightsWord})</span><span className="text-ink">RM {cabinSubtotal}</span></div>
                {bbq && <div className="flex justify-between"><span className="text-muted">{t.step2.bbqTitle}</span><span className="text-ink">RM {bbqCost}</span></div>}
                {foraging && <div className="flex justify-between"><span className="text-muted">{t.step2.foragingTitle}</span><span className="text-ink">RM {foragingCost}</span></div>}
                {breakfast && <div className="flex justify-between"><span className="text-muted">{t.step2.breakfastTitle}</span><span className="text-ink">RM {breakfastCost}</span></div>}
              </div>

              <div className="flex items-center justify-between border-t border-forest/15 pt-4">
                <span className="text-[15px] font-semibold text-ink">{t.sidebar.total}</span>
                <span className="text-[22px] font-bold text-ink">RM {total}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl bg-[#F0EADB] p-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E3A2B" strokeWidth="1.6" className="flex-shrink-0"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="11" x2="12" y2="16"></line><circle cx="12" cy="8" r="0.6" fill="#1E3A2B"></circle></svg>
            <div>
              <div className="text-[13px] font-semibold text-ink">{t.sidebar.needHelp}</div>
              <div className="text-[12.5px] text-muted">{t.sidebar.helpDesc}</div>
            </div>
          </div>
        </div>
      </div>

      <footer className="flex flex-col items-center justify-between gap-3 bg-forest-dark px-6 py-6 text-footer-heading md:flex-row md:px-16">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] md:gap-6">
          <span>{t.footer.needHelp}</span>
          <span className="text-[#E8C878]">{t.footer.whatsappUs}</span>
          <span>+60 12-345 6789</span>
          <span>hello@rimbunteduh.com</span>
        </div>
        <div className="text-[12.5px] text-footer-muted">{t.footer.secure}</div>
      </footer>
    </>
  );
}
