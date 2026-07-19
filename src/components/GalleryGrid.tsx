import { useEffect, useState } from 'react';
import { translations, type Lang } from '../i18n/translations';

type Category = 'All' | 'Farm' | 'Stay' | 'Activities' | 'Food';

const PHOTOS: { id: string; placeholder: string; height: number; cat: Exclude<Category, 'All'> }[] = [
  { id: 'g-cabin-int', placeholder: 'Cabin interior with bed', height: 260, cat: 'Stay' },
  { id: 'g-garden-path', placeholder: 'Stone garden path', height: 200, cat: 'Farm' },
  { id: 'g-river-1', placeholder: 'River flowing through jungle', height: 300, cat: 'Farm' },
  { id: 'g-dining-deck', placeholder: 'Evening dining deck with lights', height: 220, cat: 'Stay' },
  { id: 'g-harvest', placeholder: 'Harvesting vegetables', height: 240, cat: 'Farm' },
  { id: 'g-ducks', placeholder: 'Ducks on river deck', height: 200, cat: 'Farm' },
  { id: 'g-meal', placeholder: 'Communal farm meal spread', height: 260, cat: 'Food' },
  { id: 'g-treehouse', placeholder: 'Treehouse in forest canopy', height: 320, cat: 'Stay' },
  { id: 'g-stream', placeholder: 'River stones and stream', height: 200, cat: 'Farm' },
  { id: 'g-farmer', placeholder: 'Farmer tending crops', height: 260, cat: 'Farm' },
  { id: 'g-chickens', placeholder: 'Chickens in coop', height: 220, cat: 'Farm' },
  { id: 'g-fishing', placeholder: 'Guest fishing at river', height: 280, cat: 'Activities' },
  { id: 'g-yoga', placeholder: 'Morning yoga session', height: 240, cat: 'Activities' },
  { id: 'g-bbq', placeholder: 'BBQ grill with skewers', height: 200, cat: 'Food' },
  { id: 'g-patin', placeholder: 'River Patin curry dish', height: 220, cat: 'Food' },
  { id: 'g-cabin-ext', placeholder: 'Cabin exterior at dusk', height: 300, cat: 'Stay' },
  { id: 'g-foraging', placeholder: 'Foraging basket of herbs', height: 240, cat: 'Activities' },
  { id: 'g-sunrise', placeholder: 'Sunrise over the valley', height: 260, cat: 'Farm' },
];

const CATEGORIES: Category[] = ['All', 'Farm', 'Stay', 'Activities', 'Food'];

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

export default function GalleryGrid() {
  const [active, setActive] = useState<Category>('All');
  const lang = useLang();
  const t = translations[lang].gallery;

  const visible = active === 'All' ? PHOTOS : PHOTOS.filter((p) => p.cat === active);

  return (
    <>
      <div className="mb-12 flex flex-wrap justify-center gap-2.5">
        {CATEGORIES.map((cat) => {
          const isActive = cat === active;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={
                'rounded-full border-[1.5px] px-5 py-2.5 text-sm font-semibold ' +
                (isActive ? 'border-forest bg-forest text-white' : 'border-forest/25 bg-transparent text-[#3d4a37]')
              }
            >
              {t.categories[cat]}
            </button>
          );
        })}
      </div>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-4">
        {visible.map((photo) => (
          <div
            key={photo.id}
            className="mb-4 flex items-end overflow-hidden rounded-card bg-[#DDD6C4] break-inside-avoid"
            style={{ height: `${photo.height}px` }}
            role="img"
            aria-label={photo.placeholder}
          >
            <div className="relative h-full w-full">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,58,43,0.12),rgba(200,154,68,0.12))]"></div>
              <span className="absolute bottom-0 left-0 p-2 text-[10px] leading-snug text-[#5c5745]/80">{photo.placeholder}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
