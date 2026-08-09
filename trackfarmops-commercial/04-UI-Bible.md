# TRACKFARMOPS — UI BIBLE
"The Land Remembers" — 90-Second Commercial

Every on-screen digital element in this film — tablet dashboards, glowing tags, control-room displays, boardroom screens — must be **visually consistent with the real TrackFarmOps product**. This is not a fictional sci-fi interface invented for the ad; it is a cinematic, idealized rendering of the actual app design system. Treat this document as the bridge between `frontend/src/` and the screen graphics team.

---

## 1. SOURCE OF TRUTH

All UI graphics assets must derive from the live product's design tokens:
- Brand palette: **Emerald green** system (`emerald-400` through `emerald-950`, Tailwind CSS scale).
- Typography: `JetBrains Mono` for numerals, headings, and data displays (gives the "precision instrument" feel); `Inter` for body/supporting text.
- Iconography: [Lucide](https://lucide.dev) icon set — the exact icons already used in-product (see §4).
- Card style: Glassmorphic — soft white/frosted panels with subtle border, rounded-2xl corners, soft shadow, on both light and dark backgrounds.

Screen graphics artists should treat the actual web app (`frontend/`) as their style reference frame-by-frame, not a moodboard approximation.

---

## 2. COLOR TOKENS

| Token | Hex | Usage in film |
|---|---|---|
| `emerald-950` | `#022c22` | Deepest shadow tones inside UI glow, control room ambient dark |
| `emerald-600` | `#059669` | Primary action color — buttons, active states, icon fills |
| `emerald-500` | `#10b981` | **The signature glow color** — used for every notebook-to-light transformation, tag illumination, data pulse |
| `emerald-400` | `#34d399` | Highlight/active accent — sign-up button green, brightest state on hover/active UI elements |
| `emerald-300` | `#6ee7b7` | Icon accents, satellite/orbit dot elements in ecosystem visualizations |
| `white` / `white/80` | — | Glass card backgrounds, text on dark UI |
| `slate-900` / `gray-900` | — | Primary UI text on light backgrounds |
| Red gradient | `red-500`→`red-600` | **Reserved exclusively for expense/negative data** — must never appear in aspirational Act 2/3 UI shots unless showing a "cost" figure, per product convention (Expenses module uses red, not orange, in the live app) |

**Rule:** No other saturated color families (blue, purple, amber) should appear in hero UI shots. The live product uses blue/amber/purple as secondary accents in specific contexts (e.g., landing page feature chips), but the *commercial's* UI language should stay disciplined to emerald + white + slate, with red reserved only for expense figures, to keep the brand color story singular and legible at speed.

---

## 3. TYPOGRAPHY IN FRAME

- **Numerals (currency, counts, stats):** Always `JetBrains Mono`, bold, tabular. This is what should read as "precision" on screen — every number in the film (yields, currency figures, stock counts, vaccination dates) uses this face.
- **Labels/captions:** `Inter`, medium weight, slightly muted (slate-500/slate-400) — secondary to the numerals, never competing for attention.
- **On-screen tagline card (01:28–01:30):** Large `JetBrains Mono` bold, letter-by-letter reveal animation, pure white or emerald-gradient text on black.

---

## 4. ICONOGRAPHY MAP (Lucide, matches live product exactly)

Use these exact icons when rendering each module's UI moment — do not substitute similar-looking icons, as these are the actual glyphs used in the shipped product and should be recognizable to existing users.

| Script Beat | Module | Icon | Notes |
|---|---|---|---|
| 00:30–00:38 | Income & Expenses | `Wallet` | Ledger UI — glowing wallet icon resolves alongside currency figures |
| 00:38–00:46 | Inventory | `Boxes` | Stock-tag illumination on warehouse sacks |
| 00:46–00:54 | Assets | `Tractor` / `Wrench` | Tractor hood tag; wrench icon for maintenance status |
| 00:54–01:02 | Livestock Health | `Stethoscope` / `HeartPulse` | Vet tablet UI; ear-tag glow |
| 01:02–01:10 | Analytics & Reports | `BarChart3` / `LineChart` | Control room central display |
| 01:02–01:10 | Ecosystem (Workforce) | `Users` / `UsersRound` | Manager/owner mobile UI |
| Throughout | Brand mark | `Sprout` (inside hexagon) | See §6 Logo Usage |

---

## 5. UI COMPONENT STYLE GUIDE (for on-screen graphics)

### 5.1 Glass Cards (dashboard tiles, floating data panels)
- Background: white at 10–20% opacity over the live footage, with backdrop blur (glassmorphism) — never a solid opaque card, the environment must remain visible through the UI, reinforcing "woven into the landscape."
- Border: 1px, white at ~20% opacity, rounded-2xl corners.
- Drop shadow: soft, emerald-tinted at very low opacity (`shadow-emerald-600/10`) rather than neutral black — a subtle brand signature invisible at a glance but felt.
- Padding: generous — data should never feel cramped. Each card displays ONE primary metric maximum in hero shots (one number, one label, one icon).

### 5.2 Data Pulse / Glow Animation
- A single point of emerald light travels along a thin line (1–2px) tracing the edge of an object or connecting two UI elements.
- Pulse timing: slow, deliberate — roughly 1.5–2 seconds per traversal. Never a fast "loading spinner" energy; this is confidence, not urgency.
- Opacity breathing: glow elements should have a gentle pulse (scale 100%→104%, opacity 80%→100%) on a 2–3 second loop, matching the "living dashboard" language from the script.

### 5.3 Dotted Connection Lines (ecosystem / control room / final aerial)
- Thin (1–1.5px), emerald at 60–75% opacity, dashed (6px dash / 8px gap pattern) — matches the product's own connector-line styling used in its landing page network diagrams.
- Used to visually link: notebooks→dashboard, ecosystem cast members to the central "one truth" display, and farm locations to each other in the final aerial pull-back.
- Must curve gently (bezier, not straight rulers) to feel organic rather than technical/schematic.

### 5.4 Tag / Chip Elements (livestock ear tags, inventory stock tags, asset tags)
- Small glass pill shape, emerald glow outline, single icon + single short label (e.g., "Vaccinated ✓", "142 in stock", "1,240 hrs").
- Always anchored physically to the real-world object via a short connector line or direct overlay — never floating disconnected in space (see Visual Bible §5, §6).

---

## 6. LOGO USAGE

- **Mark:** Hexagonal outline with a `Sprout` leaf icon centered, small circular nodes at three hexagon vertices (representing the "connected data points" concept) — matches `frontend/public/icon.svg`.
- **Color (screen-within-screen / product UI):** Emerald (`#10b981`) mark on transparent/black or white-on-emerald inverse treatment for all in-app moments — boardroom displays, tablets, control room, every screen-within-screen shot throughout Acts 1–3. This must always match the live product exactly.
- **Color (final logo card only):** **Resolved to a warm gold-to-emerald gradient** (`#f59e0b`–`#fbbf24` transitioning into `#10b981`), gold dominant at top/left resolving to emerald at the base — see `05-Shot-Bible.md` Production Note for full rationale and spec. This gradient treatment is a one-time cinematic brand moment reserved exclusively for the A3-05 end card and derived campaign lockups (cutdowns, social versions); it must never appear on any in-film product UI, which stays pure emerald.
- **Final card (01:28–01:30):** Logo fades in first (0.4s) in the gold-green gradient treatment, centered on black, followed by letter-by-letter tagline reveal beneath it. Do not animate the logo itself beyond a simple fade + very subtle scale-in (98%→100%) — restraint per brand guidelines.
- **Screen-within-screen appearances:** Whenever a character's tablet/phone/monitor is visible with the app open, the TrackFarmOps wordmark + hexagon mark should appear in the top-left corner exactly as it does in the live product's navigation bar.

---

## 7. LIVE-PRODUCT UI MOMENTS TO RECREATE ON SCREEN

For maximum authenticity, the following actual in-app screens/components should be lightly re-skinned for cinematic use (higher contrast, larger touch targets, simplified for legibility at a glance) rather than invented from scratch:

| Film Moment | Recreate this app view |
|---|---|
| Income/Expenses ledger reveal | Dashboard financial overview cards (income, expenses, VAT, net profit — 2×2 grid) |
| Inventory tag scan | Inventory module stock-level card with low-stock alert badge |
| Asset tractor tag | Assets module detail card — maintenance status, hours logged |
| Livestock vet scan | Livestock Health record card — vaccination history timeline |
| Control room central display | Analytics & Reports module — income vs. expense trend chart |
| Ecosystem cross-cut (all 8 roles) | Each role sees a role-appropriate simplified dashboard view, consistent chrome |

Reference the live app directly for exact card geometry, spacing, and corner radius before final asset production — see `Prompts/UI-Prompts.md` for AI-assisted UI mockup generation prompts built on these exact specs.

---

## 8. WHAT TO AVOID

- No skeuomorphic UI (no fake bezels, no glossy Web-2.0 buttons).
- No dense data-table dumps in hero shots — one metric per glass card, always.
- No color outside the emerald/white/slate/red(expense-only) system in any screen-within-screen shot.
- No generic stock-dashboard graphics (avoid anything that looks like a default Bootstrap admin template) — everything must trace back to the actual TrackFarmOps design system.
- No UI element without a clear physical anchor point in the real world (per Visual Bible transformation recipe).
