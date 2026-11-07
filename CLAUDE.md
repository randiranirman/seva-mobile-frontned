# CLAUDE.md — Seva (working name)

Appointment and service-status app for Sri Lankan vehicle service centers.
Customers search a store by name, book a slot, pay a LKR 1,000 booking fee in the app, and follow their vehicle's progress. Service centers create a store, check vehicles in, and update progress. Customers get a local SMS at key steps.

## Stack

- Mobile: React Native (Expo) + TypeScript, styled with **NativeWind v4**
- Backend: Spring Boot (REST, JWT auth)
- Database: PostgreSQL
- Outside services: local payment gateway (webhook confirms payment), local SMS gateway (OTP + status texts), FCM push, object storage for photos
- One app, two roles (CUSTOMER, OWNER). The role chosen at login decides which navigator loads.

## Design direction: "Signboard"

Inspired by Sri Lankan road signs and bank queue tickets. High contrast, readable in daylight, utilitarian but sleek.
The approved visual design lives in the Design artifact "Seva — vehicle service booking" (customer screens 1–6b, owner screens 7–12, SMS 13). When a screen is built, match the artboard. Do not invent a new look.

### Hard rules

- No emoji. No gradients. No drop shadows. Depth comes from 2px ink borders.
- No left-border accent cards. No generic soft rounded-card look.
- Yellow is the only accent. Never use it as text color on a light background.
- Status is never shown by color alone. Use shape and label too (filled box = done, yellow box = now, outline = todo).
- Every touch target is at least 44x44.
- Text contrast at least 4.5:1. Gray text is `gray` (#5C5A50) on paper, never lighter.
- Icons are stroke icons, 2.2–2.6 stroke width, rounded caps. Use `lucide-react-native`.
- Labels, plates, times, references and prices-in-tables use the mono font in uppercase with letter spacing.
- Currency is written `LKR 1,000`. Phones are shown as `+94 77 123 4567`. Vehicle numbers are uppercase, like `CAB-1234`.

## Tokens

| Token | Value | Use |
|---|---|---|
| ink | #0E0E0C | text, borders, dark surfaces |
| paper | #F3F1E8 | screen background |
| card | #FFFFFF | inputs, cards, plates |
| signal | #FFC20E | primary button, selected state, "now" |
| gray | #5C5A50 | secondary text |
| line | #CFCCBC | hairline row dividers |
| hold | #BDBAA8 | disabled borders, todo outlines |
| muted-fill | #DCD9CA | disabled button background |
| ink-soft | #2A2A26 | inputs on dark screens |

Radius: 8 (chips, small buttons), 10 (buttons, inputs), 12 (cards), 14 (ticket).
Borders: 2px ink for controls and cards, 1.5px `line` for list dividers.
Spacing: screen side padding 20, section gap 22–30, control height 56–58, chip height 44.

### tailwind.config.js

```js
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#0E0E0C',
        paper: '#F3F1E8',
        card: '#FFFFFF',
        signal: '#FFC20E',
        gray: '#5C5A50',
        line: '#CFCCBC',
        hold: '#BDBAA8',
        'muted-fill': '#DCD9CA',
        'ink-soft': '#2A2A26',
      },
      borderRadius: { chip: '8px', ctl: '10px', card: '12px', ticket: '14px' },
      fontFamily: {
        display: ['ArchivoNarrow_700Bold'],
        body: ['Archivo_500Medium'],
        'body-bold': ['Archivo_700Bold'],
        'body-black': ['Archivo_800ExtraBold'],
        mono: ['JetBrainsMono_600SemiBold'],
        'mono-bold': ['JetBrainsMono_700Bold'],
      },
    },
  },
};
```

## Typography

React Native cannot use the variable width axis of Archivo, so headlines use **Archivo Narrow Bold** (closest static match to the condensed headline in the design).
Load with `@expo-google-fonts/archivo`, `@expo-google-fonts/archivo-narrow`, `@expo-google-fonts/jetbrains-mono`. In RN each weight is its own family name, so never rely on `font-bold` with a custom font. Use the family classes above.
Sinhala text (the "ආයුබෝවන්" greeting) uses `@expo-google-fonts/noto-sans-sinhala`.

| Role | Classes |
|---|---|
| Headline (screen titles, status word) | `font-display uppercase text-[52px] leading-[52px] text-ink` |
| Section heading | `font-display uppercase text-2xl text-ink` |
| Body | `font-body text-base text-ink` |
| Strong body (names, prices) | `font-body-black text-lg` |
| Micro label | `font-mono uppercase text-xs tracking-wider text-gray` |
| Plate | `font-mono-bold uppercase text-2xl tracking-widest` |

Use `allowFontScaling` normally, but test at 130% font size. Headlines may wrap, buttons must not clip.

## Class recipes

- Primary button: `h-[58px] rounded-ctl border-2 border-ink bg-signal items-center justify-center` + label `font-body-black text-lg text-ink`
- Disabled button: `bg-muted-fill border-hold` + label `text-gray`
- Secondary button: `h-[54px] rounded-ctl border-2 border-ink bg-transparent`
- Input: `h-[58px] rounded-ctl border-2 border-ink bg-card px-4 font-body-bold text-[17px]`
- Chip off / on: `h-11 px-4 rounded-chip border-2 border-ink` / add `bg-ink` with white text
- Selected row (service, payment method): `bg-signal border-2 border-ink rounded-ctl`; unselected `bg-card`
- Screen: `flex-1 bg-paper`; footer bar: `border-t-2 border-ink bg-paper px-5 pt-3 pb-5`

## Shared components to build first (src/components)

1. `Plate` — white box, 2px ink border, radius 8, mono bold, tracking wide. Sizes sm (list rows), md (ticket), lg (job header).
2. `StageBar` — 5 segments. Done = ink fill, current = signal fill with ink border, todo = transparent with `hold` border. Used on home strip, track, owner list.
3. `Ticket` — dark card with perforation row (two paper-colored circles at the sides, dashed divider) and QR block. Booking reference shown in mono.
4. `SlotButton` — time on top, capacity pips and "2 left" below. Full slot: gray fill, disabled, text "Full". For the hatch pattern use `react-native-svg`, or a flat `bg-[#E4E1D3]` if you want to skip it.
5. `PriceRow` — name and duration on the left, dotted leader, price on the right. `borderStyle: 'dotted'` is unreliable on Android, so draw the leader with a row of small views or an SVG line.
6. `Segmented` — 2x2 grid of equal buttons for vehicle type.
7. `StatCounter`, `Toast` (signal background, mono text), `SectionLabel` (mono uppercase with a 2px ink bottom border).
8. `TabBar` — ink background, 4px top border in signal for the active tab.

## Screens and where they live

Customer (`app/(customer)`): `index` (find) → `store/[id]` → `book/[id]` → `pay` → `ticket` → `track` → `approve`.
Owner (`app/(owner)`): `login` (dark theme) → `create-store` (3-step wizard with live preview) → `board` (counters, scan to check in, filter chips) → `job/[id]`.
Owner screens that sit on a dark header: login, board header, job header. Use `bg-ink` with white text and signal for emphasis.

## Domain rules the UI must respect

- Job stages, in order: BOOKED, RECEIVED, IN_SERVICE, QUALITY_CHECK, READY. Only move forward one step at a time. Each change is stored as a status event with a timestamp and triggers a customer notification.
- Booking fee is LKR 1,000, paid in the app, and only the payment gateway callback may mark it PAID. The app never decides payment success on its own.
- Service charges and any approved extra work are paid at the center.
- Slot capacity is per store (vehicles per slot). The "N left" number comes from the server. Never compute availability on the phone.
- Search is by store name (case-insensitive, contains), with optional district filter.
- Continue button on the booking screen stays disabled until vehicle number, service, slot and mobile number are valid.
- SMS texts are plain English and short. Keep each message under 160 characters. Format: `Seva: <what happened>. <what to do next>.`
- Extra work approval: owner sends a request (item, price, photo). Customer approves or declines. Declining never blocks the original service.

## Data model (Postgres)

User(id, mobile unique, role, name) · Store(id, owner_id → User, name, area, district, address, phone, opens_at, closes_at, slot_capacity) · ServiceOffering(id, store_id, name, price_lkr, duration_min) · Booking(id, ref unique, customer_id, store_id, service_id, plate, vehicle_type, slot_start, sms_mobile, stage) · BookingStatusEvent(id, booking_id, stage, at, by_user_id) · Payment(id, booking_id, amount, status, gateway_order_id unique) · OtpCode(mobile, code_hash, expires_at, attempts) · ExtraWorkRequest(id, booking_id, item, price_lkr, photo_url, decision).
Slot booking must be transaction-safe (lock the slot or use a constraint). Do not rely on a Java-side count.

## Conventions

- TypeScript strict. No `any`. API types generated from or mirrored against the Spring Boot DTOs.
- Data fetching with TanStack Query. Forms with react-hook-form + zod.
- Money is an integer in LKR. Format it in one helper, `formatLkr(1000) → "LKR 1,000"`.
- Dates shown as `Sat 7 Nov · 10:00 AM` (Asia/Colombo). Store UTC on the server.
- Every icon-only button has `accessibilityLabel`. Every input has a visible or accessible label.
- Do not add libraries for things NativeWind and the components above already cover.
- When unsure about a visual detail, open the Design artifact and copy the artboard. Ask before adding new screens, copy or decoration.
