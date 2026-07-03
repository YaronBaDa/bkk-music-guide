# Bangkok Live Music Guide — Product Spec

## 1. Vision
A **visually-rich, mobile-first** Bangkok concert & live music guide for **expats and English-speaking locals**. Think "LiveIn.city's data depth + Songkick's visual polish + RA's scene credibility."

**Core differentiator:** We don't just list events. We help people *decide* which shows to attend through rich visuals, venue context, and a sense of scene/community.

---

## 2. Data Model

### 2.1 Core Entities

```
Event
├── id (string, canonical slug)
├── title (string, EN + optional TH)
├── subtitle / tagline (string, short — e.g., "Album release show")
├── description (string, rich text, EN)
├── date
│   ├── startDate (ISO 8601)
│   ├── endDate (ISO 8601, optional for multi-day)
│   ├── doorTime (ISO 8601)
│   ├── dateStatus (confirmed | tba | rumour)
│   └── recurrence (null | weekly | monthly)
├── venueId (string → Venue)
├── artists[] (string[] → Artist, ordered by billing)
├── lineup[]
│   ├── artistId
│   ├── billing (headline | support | opener | dj)
│   └── setTime (ISO 8601, optional)
├── genres[] (string[], normalized taxonomy)
├── sceneTags[] (string[] — "Thai", "K-pop", "International", "Underground")
├── pricing
│   ├── currency (THB)
│   ├── fromPrice (number)
│   ├── toPrice (number, optional)
│   ├── tiers[]
│   │   ├── name (Early Bird / GA / VIP)
│   │   ├── price
│   │   └── availability (available | limited | sold_out)
│   └── notes (string, e.g., "+1 drink included")
├── ticketUrl (string, official source)
├── ticketSource (ttm | ticketmelon | eventpop | venue_direct | other)
├── images
│   ├── poster (url, 2:3, required)
│   ├── banner (url, 16:9, optional)
│   ├── gallery[] (url[], optional)
│   └── dominantColor (hex, for skeleton/placeholder theming)
├── status (upcoming | on_sale | few_tickets | sold_out | cancelled | postponed)
├── sourceIds[] (object, for deduplication)
│   ├── source (ttm | ticketmelon | eventpop | lnt | allevents | manual)
│   └── id (string, source-native ID)
├── metadata
│   ├── createdAt (ISO 8601)
│   ├── updatedAt (ISO 8601)
│   ├── scrapedAt (ISO 8601)
│   └── isInternational (boolean)
└── relatedGuides[] (string[] → Guide)

Venue
├── id (string, canonical slug)
├── name (string, EN + optional TH)
├── type (arena | theatre | livehouse | club | bar | outdoor | other)
├── address
│   ├── street (string)
│   ├── district (string, e.g., "Sukhumvit", "Silom")
│   ├── city (Bangkok)
│   └── mapsUrl (string, Google Maps)
├── transport
│   ├── bts[] { station, line, walkingMinutes }
│   ├── mrt[] { station, line, walkingMinutes }
│   └── notes (string, e.g., "Motorbai taxi from BTS recommended")
├── description (string, prose — vibe, history, capacity note)
├── capacity (number, approximate, optional)
├── amenities[] (sound_system | stage | bar | food | seating | ac | parking | smoking_area)
├── images
│   ├── hero (url, 16:9)
│   ├── gallery[] (url[])
│   └── mapEmbed (iframe src)
├── rating
│   ├── score (number, 0–5, optional)
│   ├── reviewCount (number)
│   └── source (string)
├── contact
│   ├── website (url)
│   ├── phone (string)
│   ├── instagram (string)
│   └── facebook (string)
├── upcomingEventsCount (number, computed)
├── pastEventsCount (number, computed)
└── tags[] (string[] — "intimate", "loud", "lgbtq-friendly", etc.)

Artist
├── id (string, canonical slug)
├── name (string)
├── aliases[] (string[])
├── bio (string, 2–3 sentences max)
├── origin (string, e.g., "Bangkok, TH" / "Paris, FR")
├── genres[] (string[])
├── isThai (boolean)
├── images
│   ├── avatar (url, 1:1)
│   └── hero (url, 16:9, optional)
├── links
│   ├── spotify (url)
│   ├── instagram (url)
│   ├── youtube (url)
│   └── bandcamp (url, optional)
├── stats
│   ├── spotifyFollowers (number, optional)
│   └── monthlyListeners (number, optional)
├── upcomingEvents[] (string[] → Event, computed)
├── pastEvents[] (string[] → Event, computed)
└── tags[] (string[] — "rising", "established", "underground", "international")

Guide
├── id (string)
├── title (string)
├── slug (string)
├── excerpt (string, 1 sentence)
├── body (string, markdown)
├── heroImage (url)
├── category (first_timer | venue_guide | scene_profile | how_to)
├── relatedVenues[] (string[])
├── relatedEvents[] (string[])
├── author (string)
├── publishedAt (ISO 8601)
└── updatedAt (ISO 8601)
```

### 2.2 Genre Taxonomy (Normalized)

```
alternative
electronic (sub: techno, house, dnb, ambient, edm)
hip-hop (sub: rap, trap, r&b)
indie
jazz (sub: fusion, soul, blues)
metal (sub: heavy, death, black, screamo)
pop (sub: t-pop, j-pop, k-pop)
rock (sub: punk, post-rock, prog)
classical (sub: orchestral, chamber, opera)
world (sub: traditional, folk)
other
```

### 2.3 Scene Tags

```
thai
k-pop-and-korean
international
japan
chinese
underground
mainstream
expat-friendly
family-friendly
```

---

## 3. Information Architecture

### 3.1 Pages

| Route | Purpose | Key Content |
|-------|---------|-------------|
| `/` | Home | Hero, search, Tonight/Weekend/Month shortcuts, This Week list, Featured Festival, Top Venues, Coming Up |
| `/concerts` | Full listings | Filter bar (date + genre + scene + price), month-grouped list, load-more |
| `/concerts/:slug` | Event detail | Poster, title, date/venue, artists, price tiers, ticket CTA, description, related shows |
| `/venues` | Venue directory | Search, type filters, map toggle, grid of venue cards |
| `/venues/:slug` | Venue detail | Hero, address/transport, description, amenities, map, upcoming events timeline |
| `/artists` | Artist directory | Search, genre filters, alphabetical or popularity sort |
| `/artists/:slug` | Artist detail | Avatar, bio, stats, upcoming shows in BKK, past shows |
| `/festivals` | Festival overview | Multi-day events, lineup status, ticket links |
| `/guides` | Editorial hub | Guides list: first-timer, venue guides, scene profiles |
| `/guides/:slug` | Guide article | Long-form with inline venue/event links |

### 3.2 Navigation

```
Logo (Live / BKK)
├── Concerts
├── Venues
├── Artists
├── Festivals
├── Guides
└── Language: EN | ไทย
```

Mobile: hamburger with collapsible sections.

---

## 4. Feature Spec

### 4.1 Discovery

**Quick Filters (Home)**
- Tonight (count badge)
- This Weekend (count badge)
- This Month (count badge)
- Full Calendar →

**Filter Bar (/concerts)**
- **When**: Any Date | Today | This Weekend | This Week | Next Week | This Month | Pick a Date
- **Genre**: All | [genre pills]
- **Scene**: All | Thai | K-pop & Korean | International | Underground
- **Price**: All | Free | Under ฿500 | ฿500–฿1,500 | ฿1,500+
- **More**: Recently Added

**Sort Options**
- Date (default)
- Recently Added
- Price: Low to High
- Price: High to Low

### 4.2 Event Cards

```
┌─────────────────────────────┐
│  [POSTER IMAGE  2:3]        │
│                             │
├─────────────────────────────┤
│  GENRE • SCENE              │
│  Event Title (2 lines max)  │
│  Artist Names (1 line)      │
│  📅 Thu, Jul 9  ·  8PM      │
│  📍 Venue Name              │
│  ฿450  ·  Early Bird        │
└─────────────────────────────┘
```

**Rules:**
- Image must be actual event poster (not generic venue photo)
- Title: max 2 lines, ellipsis
- Date: human-readable, relative when close ("Tonight", "Tomorrow")
- Price: show lowest tier, status label if limited/sold out
- Entire card is tappable

### 4.3 Event Detail Page

```
[POSTER / BANNER IMAGE — full width]

Genre Tags
EVENT TITLE
Subtitle / tagline

┌──────────┐
│ Jul      │
│ 09       │
│ Thu 8PM  │
└──────────┘

📍 Venue Name  →  (links to venue)
🚇 BTS Asok + 5 min walk

[LINEUP]
Headline: Artist A
Support: Artist B, Artist C

[PRICE TIERS]
Early Bird — ฿350 — Sold Out
General — ฿450 — Available
VIP — ฿800 — Limited

[SEE TICKETS — primary CTA]
(links to official ticket source)

[ABOUT]
2–3 sentences description

[RELATED SHOWS]
"More at this venue" / "More this week"
```

### 4.4 Venue Detail Page

```
[HERO IMAGE]

Venue Name
Type: Livehouse  ·  Capacity: ~200
⭐ 4.7 (202 reviews)

📍 Full Address
🚇 Nearest: Queen Sirikit MRT — 8 min walk

[PHOTO GALLERY — horizontal scroll]

[ABOUT]
3–4 sentences prose

[AMENITIES]
Sound System  ·  Stage  ·  Bar  ·  AC

[MAP — embedded]

[UPCOMING EVENTS — timeline]
Jul 09 — Event A — ฿450
Jul 12 — Event B — ฿350
...
```

### 4.5 Search

- Global search in header
- Searches across: event titles, artist names, venue names
- Instant results dropdown with sections: Events | Artists | Venues
- Mobile: full-screen search overlay

### 4.6 Editorial (Guides)

**Categories:**
- **First-Timer**: "How to buy tickets in Bangkok", "What to expect at a Thai livehouse"
- **Venue Guide**: "Blueprint vs Melt vs Speakerbox"
- **Scene Profile**: "Bangkok techno: 5 crews to know"
- **Practical**: "BTS/MRT to every major venue"

**Style:**
- 1st person, conversational
- Inline venue/event cards that link to detail pages
- 3–5 min read max

---

## 5. Design System

### 5.1 Principles
- **Mobile-first**: 70%+ of traffic will be mobile
- **Image-forward**: Every event needs a poster; every venue needs a hero
- **Dark mode default**: Music/culture audiences expect it; add light mode toggle
- **High contrast**: WCAG AA minimum
- **Generous touch targets**: 44×44pt minimum

### 5.2 Color Palette (Dark Mode Default)

```
Background Primary:   #0A0A0F  (near-black)
Background Secondary: #14141A  (card surface)
Background Elevated:  #1E1E26  (hover state)
Border:               #2A2A35  (subtle dividers)
Text Primary:         #F0F0F5
Text Secondary:       #8A8A99
Text Tertiary:        #5A5A6A
Accent:               #FF3366  (hot pink — music/energy)
Accent Hover:         #FF5588
Success:              #00E676  (available)
Warning:              #FFAA00  (limited)
Danger:               #FF4444  (sold out)
```

### 5.3 Typography

```
Headings:   Inter or Geist (sans-serif), bold
Body:       Inter, 16px/1.6
Captions:   Inter, 13px, secondary color
Mono:       JetBrains Mono (for dates, prices)
```

### 5.4 Spacing

```
Base unit: 4px
Card padding: 16px (mobile) / 24px (desktop)
Card gap: 12px (mobile) / 20px (desktop)
Section gap: 48px
Max content width: 1200px
```

### 5.5 Components

**Buttons**
- Primary: Accent bg, white text, rounded-full, 48px height
- Secondary: Transparent + border, white text
- Ghost: No border, text only + icon

**Pills / Chips**
- Genre tags: subtle bg, small rounded, non-interactive
- Filters: outlined, toggleable, active state filled

**Cards**
- Rounded-xl (16px)
- Subtle border or no border
- Hover: slight scale (1.02) + elevated shadow
- No heavy drop shadows — use border or bg elevation

**Skeleton Loading**
- Use dominantColor from event data as placeholder
- Shimmer animation

---

## 6. Tech Stack

### 6.1 Recommended: Static Site + JSON Data

**Frontend:**
- Framework: Next.js 14 (App Router) or Astro
- Styling: Tailwind CSS
- UI: shadcn/ui components
- Icons: Lucide React
- Fonts: Inter (Google Fonts)

**Why Next.js/Astro:**
- Static generation at build time = fast, CDN-friendly
- ISR (Incremental Static Regeneration) for daily data updates
- OG image generation per event/venue
- Image optimization (WebP, responsive sizes)

**Data Pipeline:**
- Python scripts (see `bangkok-concert-data-pipeline` skill)
- Sources: Ticketmelon, Thai Ticket Major, Eventpop, Live Nation Tero, AllEvents.in
- Merge + deduplication (see skill for details)
- Output: `concerts.json`, `venues.json`, `artists.json`

**Deployment:**
- Vercel (Next.js) or Cloudflare Pages (Astro)
- GitHub Actions: daily scrape at 6 AM Bangkok time
- Data committed to repo → triggers rebuild

### 6.2 Alternative: Fullstack with Database

If real-time features (favorites, user accounts, notifications) are needed:
- **DB:** Supabase PostgreSQL or Cloudflare D1
- **API:** Next.js API routes or Cloudflare Workers
- **Auth:** Supabase Auth or Clerk
- **Storage:** Cloudflare R2 or Supabase Storage (for images)

---

## 7. Content Strategy

### 7.1 Data Sources (Priority Order)

| Source | Yield | Effort | Status |
|--------|-------|--------|--------|
| Ticketmelon | ~75% of shows | Medium | Priority 1 |
| Thai Ticket Major | ~15% (arena/theatre) | Medium | Priority 1 |
| Eventpop | ~40 indie/smaller | Low | Priority 2 |
| Live Nation Tero | ~15 international | Low | Priority 2 |
| AllEvents.in RSS | ~15 mixed | Very Low | Priority 3 |
| Manual curation | Variable | High | Ongoing |

### 7.2 Enrichment Priorities

1. **Event posters**: Every event must have an image. Hotlink from source or self-host.
2. **Venue descriptions**: Write 2–3 sentences for top 30 venues.
3. **Artist bios**: Top 100 most frequent artists get a short bio.
4. **Transport directions**: BTS/MRT for top 20 venues.
5. **Price tiers**: Parse Early Bird / GA / VIP where available.

### 7.3 Editorial Calendar

- **Week 1**: First-Timer's Guide
- **Week 2**: Venue comparison (e.g., "Best livehouses in Bangkok")
- **Week 3**: Scene profile (e.g., "Bangkok's K-pop boom")
- **Week 4**: Practical guide (e.g., "How to get to every venue by BTS")

---

## 8. SEO & Performance

### 8.1 SEO Checklist

- [ ] Canonical URLs: `/concerts/:slug`, `/venues/:slug`
- [ ] OG tags per page: title, description, image
- [ ] Structured data: `Event`, `MusicVenue`, `PerformingGroup` (JSON-LD)
- [ ] Sitemap: auto-generated, submitted to Google Search Console
- [ ] H1/H2 hierarchy: one H1 per page, logical heading flow
- [ ] Internal linking: events link to venues and artists; guides link to entities
- [ ] Breadcrumbs: `Home > Venues > Blueprint Livehouse`

### 8.2 Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Lighthouse Performance | > 90 |
| Lighthouse Accessibility | > 95 (WCAG AA) |

**Optimizations:**
- Next.js `<Image>` with WebP, lazy loading, blur placeholder
- JSON data split: load current month first, rest on demand
- Font subsetting (Inter Latin + Thai glyphs)
- No layout shift: fixed aspect ratios on images

---

## 9. Accessibility (WCAG AA)

- [ ] Color contrast ≥ 4.5:1 for all text
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigable: Tab through filters, cards, pagination
- [ ] Screen reader labels: event cards read as "Event: [title]. Date: [date]. Venue: [venue]. Price: [price]."
- [ ] Skip to main content link
- [ ] Alt text on all images (event poster = event title; venue = venue name)
- [ ] Reduced motion support: disable hover animations if `prefers-reduced-motion`
- [ ] Touch targets: minimum 44×44 CSS pixels

---

## 10. Analytics & Success Metrics

**North Star:** Weekly active users who view ≥ 3 event detail pages.

**Tracking:**
- Page views per route
- Filter usage (which filters are most used?)
- Click-through rate on "See Tickets" (primary conversion)
- Search queries (what are people looking for?)
- Time on event detail page
- Bounce rate from homepage

---

## 11. Milestones

### Phase 1: MVP (Weeks 1–3)
- [ ] Scraper pipeline running (Ticketmelon + TTM minimum)
- [ ] Homepage: This Week list + quick filters
- [ ] Event detail page
- [ ] Venue detail page (top 10 venues)
- [ ] Search
- [ ] Mobile-first responsive
- [ ] Dark mode

### Phase 2: Depth (Weeks 4–6)
- [ ] All scrapers wired (Eventpop, LNT, AllEvents)
- [ ] Full /concerts with filters
- [ ] /venues directory
- [ ] /artists directory
- [ ] 3 editorial guides
- [ ] OG image generation
- [ ] SEO audit + sitemap

### Phase 3: Community (Weeks 7–10)
- [ ] User accounts (favorites, saved artists)
- [ ] Email digest: "This week in Bangkok"
- [ ] Push notifications for saved artists
- [ ] User-submitted events (moderated)
- [ ] Venue reviews / ratings

---

## 12. Open Questions

1. **Ticketing partnership?** Do we want to become an affiliate (get % of sales) or stay pure aggregator?
2. **User accounts?** Phase 3 features require auth. Is that in scope?
3. **Thai language depth?** Full bilingual (every field) or EN primary with TH summaries?
4. **Revenue model?** Ads, affiliate ticketing, sponsored venue listings, Patreon?
5. **Other Thai cities?** Chiang Mai, Pattaya, Phuket — same data model applies.

---

*Spec version 1.0 — July 2026*
