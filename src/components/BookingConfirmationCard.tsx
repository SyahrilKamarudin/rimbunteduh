import { useEffect, useState } from 'react';
import { translations, type Lang } from '../i18n/translations';
import type { BookingData } from './BookingWizard';

const WHATSAPP_NUMBER = '60123856967';

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

const FALLBACK: BookingData = {
  checkInLabel: '24 Aug 2026',
  checkOutLabel: '26 Aug 2026',
  nights: 2,
  adults: 2,
  children: 1,
  guestsSummary: '2 Adults, 1 Child',
  bbq: true,
  foraging: false,
  breakfast: false,
  name: 'Ahmad Hafiz bin Rahman',
  phone: '+60 12-345 6789',
  email: '',
  total: 1440,
  cabinSubtotal: 1360,
  foragingCost: 0,
  breakfastCost: 0,
  bbqCost: 80,
  reference: 'RT-2026-08241',
};

export default function BookingConfirmationCard() {
  const lang = useLang();
  const t = translations[lang].bookingConfirmation;
  const tBooking = translations[lang].booking;
  const [data, setData] = useState<BookingData>(FALLBACK);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('rt_booking');
      if (raw) setData(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const addonLabels: string[] = [];
  if (data.bbq) addonLabels.push(tBooking.step2.bbqTitle);
  if (data.foraging) addonLabels.push(tBooking.step2.foragingTitle);
  if (data.breakfast) addonLabels.push(tBooking.step2.breakfastTitle);
  const addonsText = addonLabels.length ? addonLabels.join(', ') : '—';

  const firstName = data.name.split(' ')[0] || data.name;
  const subtitle = t.confirmed.subtitle.replace('{name}', firstName);

  const whatsappMessage = [
    `Hi, I've just confirmed a booking (Ref: ${data.reference}).`,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Dates: ${data.checkInLabel} – ${data.checkOutLabel}`,
    `Guests: ${data.guestsSummary}`,
    `Add-ons: ${addonsText}`,
    `Total: RM ${data.total.toLocaleString()}`,
  ].join('\n');
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <section className="mx-auto mt-16 max-w-[640px] px-6 text-center">
        <div className="mx-auto mb-7 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-gold">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4"><polyline points="4 12 9 18 20 6"></polyline></svg>
        </div>
        <div className="mb-3 font-serif text-3xl text-ink md:text-[36px]">{t.confirmed.title}</div>
        <div className="mb-2 text-[15px] leading-[1.7] text-muted">{subtitle}</div>
        <div className="mb-12 font-serif text-[15px] italic text-gold">Alam Menyambutmu — see you soon.</div>
      </section>

      <section className="mx-auto mb-10 max-w-[640px] px-6">
        <div className="overflow-hidden rounded-card-lg bg-white shadow-card">
          <div className="flex h-[180px] w-full items-end overflow-hidden bg-[#DDD6C4]">
            <span className="p-2 text-[10px] text-[#5c5745]/80">Seri Teduh Cabin exterior</span>
          </div>
          <div className="p-7">
            <div className="mb-5 flex items-center justify-between">
              <div className="font-serif text-xl text-ink">Seri Teduh Cabin</div>
              <div className="rounded-full bg-[#F0EADB] px-3 py-1.5 text-xs font-semibold text-ink">Ref: {data.reference}</div>
            </div>
            <div className="mb-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between"><span className="text-muted">{t.summary.checkIn}</span><span className="font-semibold text-ink">{data.checkInLabel}</span></div>
              <div className="flex justify-between"><span className="text-muted">{t.summary.checkOut}</span><span className="font-semibold text-ink">{data.checkOutLabel}</span></div>
              <div className="flex justify-between"><span className="text-muted">{t.summary.guests}</span><span className="font-semibold text-ink">{data.guestsSummary}</span></div>
              <div className="flex justify-between"><span className="text-muted">{t.summary.addons}</span><span className="font-semibold text-ink">{addonsText}</span></div>
            </div>
            <div className="flex items-center justify-between border-t border-forest/[0.12] pt-4">
              <span className="text-[15px] font-semibold text-ink">{t.summary.totalPaid}</span>
              <div className="flex items-center gap-3">
                <span className="text-[22px] font-bold text-ink">RM {data.total.toLocaleString()}</span>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener"
                  aria-label="Notify us via WhatsApp"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white no-underline hover:text-white"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5.1-1.3A10 10 0 1 0 12 2z"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-24 max-w-[640px] px-6">
        <div className="mb-5 font-serif text-xl text-ink">{t.next.heading}</div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_6px_18px_rgba(30,40,25,0.06)]">
            <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-forest">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5.1-1.3A10 10 0 1 0 12 2z"></path></svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-ink">{t.next.whatsappTitle}</div>
              <div className="text-[13px] text-muted">{t.next.whatsappDesc}</div>
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white no-underline hover:text-white"
              aria-label="Chat with us on WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5.1-1.3A10 10 0 1 0 12 2z"></path></svg>
            </a>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_6px_18px_rgba(30,40,25,0.06)]">
            <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-forest">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M12 21 C7 15 4 11.5 4 8 A8 8 0 0 1 20 8 C20 11.5 17 15 12 21 Z"></path><circle cx="12" cy="8" r="2.5"></circle></svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-ink">{t.next.directionsTitle}</div>
              <div className="text-[13px] text-muted">Lot 1234, Kampung Sungai Kerau, 26600 Karak, Pahang.</div>
            </div>
            <a href="https://maps.app.goo.gl/6tpBYuTFR3yercit9" target="_blank" rel="noopener" className="text-[13px] font-semibold text-gold no-underline">{t.next.viewMap}</a>
          </div>
          <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-[0_6px_18px_rgba(30,40,25,0.06)]">
            <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-forest">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"></rect><polyline points="3 7 12 13 21 7"></polyline></svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-ink">{t.next.contactTitle}</div>
              <div className="text-[13px] text-muted">{t.next.contactDesc}</div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a href="/" className="inline-flex items-center gap-2 rounded-lg bg-forest px-7 py-3.5 text-sm font-semibold text-white no-underline hover:text-white">{t.next.backHome}</a>
        </div>
      </section>
    </>
  );
}
