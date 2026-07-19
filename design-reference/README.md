# Handoff: Rimbun Teduh Homestead Farm — Website & Booking Prototype

## Overview
Marketing + booking website for Rimbun Teduh Homestead Farm, a nature farmstay in Sungai Kerau, Karak, Pahang. The site combines SEO/content pages (Home, About, Experiences, Location, Gallery) with a functional booking flow (multi-step reservation + confirmation) and a simple admin panel for managing bookings. Brand line: "Alam Menyambutmu / Nature Welcomes You" — philosophy: Rest, Reconnect, Renew.

## About the Design Files
The original design files (`*.dc.html`) were self-contained HTML prototypes showing intended look, layout, copy, and interaction behavior — design references, not production code to copy directly. The task is to recreate these designs in the target codebase's environment, using its established patterns/component library.

**Planned rendering approach (per original brief):** Astro hybrid — content/SEO pages (Home, About, Experiences, Location, Gallery) should ship as static HTML for SEO; the Booking flow and Admin Dashboard should hydrate as interactive islands (e.g. React) since they need client-side state. If no framework exists yet in the target repo, Astro + React islands is the recommended fit given this brief.

## Fidelity
High-fidelity. Colors, typography, spacing, and component styling below should be recreated pixel-accurately. Photography is currently drag-and-drop placeholder slots — real photos need to be sourced and dropped in before/at launch. Use a simple `<ImageSlot>` component that renders a styled placeholder div with a caption describing what photo belongs there.

## Design Tokens

**Colors**
- Deep forest green (primary/nav text, footer bg, secondary buttons): `#1E3A2B` (footer uses slightly darker `#1B3324`)
- Warm gold/mustard (primary CTA, accents, active states): `#C89A44` (hover/darker: `#B08429`)
- Cream/off-white background: `#F6F1E7`
- Body text (dark): `#26301F`; muted/secondary text: `#71705f` / `#8a8570`
- Footer text on green: `#EDE7D8` (headings), `#D9DFCF` / `#B9C4B4` (body), `#9CB09E` (muted)
- Status colors (admin): Confirmed `#E4EFE2`/`#1E3A2B`, Pending `#F7EBD3`/`#93691C`, Cancelled `#F5E4E1`/`#a8402f`
- Borders/dividers: `rgba(30,58,43,0.12)` typical

**Typography**
- Headings: `Lora` (serif), weights 400/500/600, italic used for tagline accents. Sizes range ~19px (nav) to 54px (hero H1).
- Body/UI: `Work Sans` (sans-serif), weights 400–700. Body copy ~14–15px, labels/eyebrows ~11–12px with letter-spacing 1–2px uppercase.
- Google Fonts import: `Lora:ital,wght@0,400;0,500;0,600;1,500` and `Work+Sans:wght@400;500;600;700`

**Spacing / Shape**
- Section max-width: 1200–1300px, horizontal padding 64px (48px on nav)
- Card border-radius: 14–16px; buttons 8px; pills/badges 20–24px
- Card shadow: `0 6px 20px rgba(30,40,25,0.08)` (light) up to `0 20px 50px rgba(30,40,25,0.18)` (hero-adjacent elevated cards)

## Screens / Views

### 1. Homepage
- Sticky nav: logo (emblem + wordmark "RIMBUN TEDUH / HOMESTEAD FARM"), center links (Home/About/Experiences/Gallery/Location), EN/BM language pill toggle, gold "Book Now" button.
- Full-bleed hero (640px) background photo with dark gradient scrim, heading "Alam Menyambutmu" (serif 54px) + italic gold subtitle "Nature Welcomes You", two CTA buttons (solid gold "Book Your Stay", outline "Explore Experiences"). A floating white booking-summary bar (check-in/check-out/guests/Check Availability) overlaps the bottom edge of the hero by -42px.
- 3-column philosophy strip: Rest / Reconnect / Renew, each with a line-icon, title, one-line description, divided by vertical rules.
- Experiences grid: 6 cards (photo, circular icon badge overlapping top, title, description) — Mindful Fishing, Natural Farming Workshop, Nature Wellness, Food Foraging, Cabin Stay, BBQ & Gatherings.
- Testimonial band (tinted cream-dark bg `#EFE9DA`): photo + italic quote + attribution, flanked by circular prev/next controls.
- Gallery preview: 4 photos in a row + "View Full Gallery" button linking to Gallery page.
- Location teaser: 2-column (copy + CTA "Get Directions" | map placeholder).
- Footer (green `#1B3324`): 4 columns — brand blurb, quick links, contact, address — bottom bar with copyright + Privacy/Terms.

### 2. About
- Same nav pattern. Hero (420px) "Our Story" + subtitle, full-bleed photo + scrim, same treatment as Home hero.
- Elevated white quote card overlapping hero bottom (-48px): pull-quote + body copy | photo (2-col).
- Philosophy 3-column repeat of Rest/Reconnect/Renew with fuller descriptions.
- "Five Senses Journey" 5-column: See / Hear / Smell / Taste / Feel, icon + title + description each.
- Dark green "brand promise" callout band with oversized quote-mark glyph, pull-quote, supporting body copy, and italic "Alam Menyambutmu. / Nature Welcomes You." lockup.
- "Moments From Our Farm" gallery — asymmetric grid (2 tall side images spanning 2 rows + 4 standard tiles).
- Footer — identical to Homepage.

### 3. Experiences
- Hero (340px, centered text over photo + scrim): "Experiences" + italic subtitle.
- 3×2 grid of 6 experience cards (Mindful Fishing, Natural Farming Workshop, Nature Wellness, Food Foraging, Pop-Up Café, BBQ & Gatherings): photo, icon badge, title, description, duration + "From RM x" price row, and a green "Enquire via WhatsApp" button that opens `https://wa.me/60123456789?text=...` with a pre-filled, experience-specific message (no on-site form).
- Bottom CTA band (dark green): "Ready to slow down?" + "Book Your Stay" gold button.
- Footer — identical.

### 4. Location
- Hero (340px) "Discover the Heart of Sungai Kerau, Karak" + "Pahang, Malaysia".
- Full-width map placeholder (420px tall — to become a real embedded map).
- 4-column "Nearby Attractions" cards: Kuala Gandah Elephant Centre, Waterfalls & Rivers, Vanilla Farm, Seasonal Durian (with a gold "SEASONAL" badge on the photo).
- 2-column "Fresh River Patin Cuisine" highlight (photo | copy + "Book Your Stay" button).
- Footer — identical.

### 5. Gallery
- Header + filter tabs: All / Farm / Stay / Activities / Food — pill buttons, active = filled dark green, others outlined. Clicking a tab filters the photo set (state-driven, no page reload).
- Masonry-style grid (CSS `columns:4`) of photo placeholders with varied heights per category (~18 photos total, tagged by category in the data).
- Footer — identical.

### 6. Booking flow — the interactive core
4-step wizard with a step indicator (numbered circles + connecting arrow chevrons; current/completed = filled dark green, upcoming = outlined) above a 2-column layout: step content (left, white card) + sticky booking-summary sidebar (right).
- **Step 1 – Dates & Guests**: check-in/check-out display fields; a 2-month calendar (hardcoded to Aug/Sep 2026, Monday-first week) where clicking a day sets check-in, clicking a later day sets check-out (in-range days shaded light green `#D7E4D3`, endpoints filled dark green); adult/children steppers (+/- buttons, adults 1–6, children 0–4); "Max 6 guests per cabin" note.
- **Step 2 – Add-ons**: 3 selectable option rows (BBQ Set & Charcoal RM80/stay, Food Foraging Session RM45/person, Farm Breakfast RM25/person) — each is a clickable card with icon, title, description, price, and a checkbox indicator; toggling recalculates the sidebar total live.
- **Step 3 – Your Details**: Full Name, Phone Number, Email (all controlled inputs) + optional Special Requests textarea.
- **Step 4 – Confirm**: read-only summary of guest name/phone/email/dates/guests pulled from prior steps.
- Footer nav: Back button (steps 2–4) + Next button (steps 1–3) or "Confirm Booking" (step 4, navigates to booking-confirmation).
- Sidebar (sticky): cabin photo + name ("Seri Teduh Cabin", 2 Bedrooms / Up to 6 guests / Riverside View), live Stay Summary (check-in/out, nights, guests), itemized Price Breakdown (cabin rate × nights + any selected add-ons, computed live), bold Total (MYR), and a "Need Help?" contact callout.
- Bottom bar: WhatsApp/phone/email help links + "Secure booking" reassurance text.
- EN/BM language toggle in the nav.

### 7. Booking Confirmation
- Centered success state: gold circular checkmark icon, "Booking Confirmed!" (serif 36px), personalized thank-you line, italic "Alam Menyambutmu — see you soon."
- Booking summary card: cabin photo, name + reference badge (e.g. `RT-2026-08241`), check-in/out/guests/add-ons rows, bold Total Paid.
- "What's Next" list (3 rows): WhatsApp Confirmation, Get Directions (with "View Map" link to Location page), Contact Us.
- "Back to Home" button.
- Footer — identical.

### 8. Admin Dashboard
Internal tool, separate visual system from the guest site (sidebar layout instead of top nav), same brand colors/fonts.
- Left sidebar (dark green, fixed 240px): brand mark, nav items (Dashboard/Bookings active, Enquiries, Availability, Settings — icons only wired for Bookings in this prototype), "Back to Site" link at the bottom.
- Top bar: page title "Bookings" + subtitle, host avatar/name chip on the right.
- 4 stat cards: Total Bookings, Pending Review, Upcoming Stays, Revenue (MYR) — all computed from the bookings dataset.
- Bookings table: status filter pills (All/Confirmed/Pending/Cancelled), guest-name search input, column header row (Guest/Dates/Guests/Add-ons/Total/Status), and rows with a colored status pill; clicking a row opens a detail drawer.
- Detail drawer (slide-in from right, dark overlay behind): reference, guest name, phone, dates, guests, add-ons, total, and two actions — "Confirm Booking" / "Cancel Booking" — which update the row's status and dataset in place. Needs auth added — none exists in the prototype.

## Interactions & Behavior
- **Language toggle (EN/BM)**: present on every guest-facing page's nav. Selecting a language writes `localStorage['rt_lang']` and re-renders all copy from an in-file translation dictionary; the choice persists across page navigations since every page reads the same localStorage key on load. Admin dashboard is English-only.
- **Booking calendar**: date selection is a simple two-click range picker (first click = check-in, second later click = check-out; clicking an earlier date resets check-in). No unavailable-date logic implemented — all days selectable. A real implementation needs to fetch actual availability.
- **Price calculation**: `cabinSubtotal = 680 (MYR/night) × nights`; add-ons: BBQ flat RM80, Foraging RM45 × adults, Breakfast RM25 × (adults + children). Total is the sum, recalculated on every state change.
- **Gallery filter**: client-side array filter by `category` field, no network call.
- **WhatsApp enquiry links** (Experiences page): `https://wa.me/60123456789?text=<url-encoded, experience-specific message>` opened in a new tab — replace the phone number with the real business WhatsApp number.
- **Admin table filter + search**: combined status-equality and case-insensitive name-substring filter, both client-side.
- **Admin confirm/cancel**: currently mutates in-memory mock data only — needs to call a real booking-update API.

## State Management
- **Booking**: `step` (1–4), `checkIn`/`checkOut` (UTC timestamps), `adults`, `children`, `bbq`/`foraging`/`breakfast` (booleans), `name`/`phone`/`email`/`requests` (strings), `lang` (`'en'|'ms'`, persisted to localStorage).
- **Gallery**: `active` (current category filter).
- **AdminDashboard**: `statusFilter`, `search`, `selectedRef` (drawer open/closed + which booking), `bookings` (array, mutated on confirm/cancel).
- All other pages are stateless aside from the shared `lang` toggle.
- **Data fetching**: none of this is wired to a real backend — booking data, availability, and the admin dataset are all hardcoded mock arrays and need real API integration.

## Assets
All photography is currently drag-and-drop placeholder slots — each has a descriptive `placeholder` caption stating what real photo belongs there (e.g. "Hero: wooden cabin at dusk, river, forest", "Elephants at Kuala Gandah", "Communal farm meal"). Roughly 4–8 photo slots per marketing page, ~18 on the Gallery page (tagged Farm/Stay/Activities/Food), plus a small circular logo-emblem slot repeated in every nav and footer (botanical arch emblem — tree, kampung house, sun — green & gold).
