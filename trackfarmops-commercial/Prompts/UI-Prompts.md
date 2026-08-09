# TRACKFARMOPS — UI PROMPTS
"The Land Remembers" — AI-Assisted Screen Graphics Generation

These prompts generate reference mockups for every screen-within-screen UI moment in the film. All prompts are written to enforce strict adherence to the real TrackFarmOps design system (`04-UI-Bible.md`). Use outputs as reference/starting layers for the motion graphics team — final on-screen UI should be built as clean vector/motion graphics matching these specs exactly, not shipped as raw AI output.

**Non-negotiable design tokens for every prompt (do not omit):**
- Color: emerald green (`#10b981` primary glow, `#059669` accent, `#34d399` highlight), white glass cards, slate text, red reserved only for expense figures.
- Typography: `JetBrains Mono` for all numerals/data, `Inter` for labels.
- Card style: glassmorphic, frosted, rounded-2xl corners, soft emerald-tinted shadow.
- Icon set: Lucide icons only (exact glyphs specified per prompt).

---

## 1. DASHBOARD FINANCIAL OVERVIEW (A2-03 — Income/Expenses)
```
UI mockup, glassmorphic dashboard interface, dark wood desk background softly blurred behind frosted white glass cards. A 2x2 grid of cards showing: "Income" with a Wallet icon and a large JetBrains Mono bold currency figure in emerald green; "Expenses" with a Wallet icon and a currency figure in muted red; "VAT" with a currency figure in emerald green; "Net Profit" with a large currency figure in bold emerald green. Each card has a soft emerald-tinted shadow, rounded corners, subtle white border at 20% opacity. Clean, minimal, one metric per card, Inter font for labels beneath each JetBrains Mono numeral. Soft ambient glow overall.
```

## 2. INVENTORY STOCK-LEVEL CARD (A2-05 — Inventory)
```
UI mockup, single glassmorphic card floating above a blurred warehouse background of grain sacks. Card shows a Boxes icon in emerald green, a large JetBrains Mono bold stock count number, an Inter label reading "In Stock", and a small pill-shaped badge in amber reading "Low Stock Alert" only if under threshold — otherwise a small emerald checkmark badge reading "Well Stocked". Rounded-2xl corners, frosted glass background, soft emerald-tinted shadow, thin white border.
```

## 3. ASSET / MAINTENANCE CARD (A2-07 — Assets)
```
UI mockup, single glassmorphic card anchored beside a blurred tractor hood background. Card shows a Tractor icon and a Wrench icon in emerald green, a JetBrains Mono bold "Hours Logged" number, an Inter label "Service Status", and a small emerald checkmark badge reading "Condition: Good". Rounded-2xl corners, frosted white glass, soft emerald-tinted shadow, thin white border at 20% opacity.
```

## 4. LIVESTOCK HEALTH CARD (A2-09 — Livestock)
```
UI mockup, single glassmorphic card floating above a blurred pasture background. Card shows a Stethoscope icon in emerald green, an Inter label "Vaccination History", a horizontal timeline of small emerald dots each representing a past checkup, and a HeartPulse icon gently pulsing in emerald green in the corner indicating active health monitoring. Rounded-2xl corners, frosted glass, soft emerald-tinted shadow.
```

## 5. ANALYTICS CONTROL ROOM DISPLAY (A2-10, A2-11 — Analytics/Ecosystem)
```
UI mockup, large wall-display dashboard interface, glassmorphic dark-mode variant with deep emerald-950 background and glowing emerald-500 accents. Central large card shows a BarChart3 line chart comparing "Income" (emerald green line) vs "Expenses" (muted red line) over months, JetBrains Mono axis labels, a bold JetBrains Mono summary metric top-right labeled "Net Profit" in large emerald text. Surrounding smaller glass cards show module summaries: Inventory (Boxes icon), Assets (Tractor icon), Livestock (Stethoscope icon), Workforce (Users icon) — each a single glowing metric. Premium, spacious, command-center aesthetic, soft ambient emerald glow throughout.
```

## 6. MOBILE/TABLET UI FOR ECOSYSTEM CUTAWAYS (A2-11 — all 8 roles)
```
UI mockup, mobile app dashboard interface on a smartphone screen, glassmorphic emerald-green and white design, TrackFarmOps wordmark and small hexagonal sprout-leaf logo mark in top-left corner of the nav bar. Below: a single hero glass card showing one large JetBrains Mono metric relevant to a [ROLE] (e.g., "Total Revenue" for an owner, "Tasks Completed" for a manager, "Reconciled" for an accountant), Inter label beneath. Bottom navigation bar with 4-5 Lucide icons (Home, Wallet, Boxes, BarChart3, Settings) in emerald green, active tab highlighted in emerald-400. Clean, premium mobile UI, soft shadows, rounded corners throughout.
```
*(Swap `[ROLE]` per the 8 ecosystem characters in `02-Character-Bible.md` §2 to generate role-specific variants.)*

## 7. FINAL LOGO CARD ANIMATION REFERENCE (A3-05)
```
UI mockup, pure black background, centered hexagonal outline logo mark with a small sprout leaf icon inside and three small glowing circular nodes at alternating hexagon vertices connected by thin lines, rendered in solid emerald green (#10b981) with a soft outer glow. Below the mark, bold JetBrains Mono text reading "TrackFarmOps — See Everything. Miss nothing." in white, letter-spacing slightly wide. Minimal, premium, Apple-keynote-style product card composition, generous negative space.
```

## 8. NOTEBOOK-TO-UI DISSOLVE FRAME (transformation midpoint reference)
```
UI mockup, a semi-transparent glass-like overlay resolving out of a worn paper notebook page, showing glowing JetBrains Mono numerals and a thin emerald circuit-line tracing the page's torn edge. The real paper texture is still faintly visible beneath the digital numerals, selling a true dissolve rather than a hard cut between analog and digital. Macro composition, warm practical light source from the glow itself, cinematic depth of field.
```

---

## 9. UI-TO-CODE CROSS-CHECK

Before finalizing any generated UI mockup, verify against the live product source for exact geometry/spacing conventions:
- `frontend/src/index.css` — `.btn-primary` / `.btn-secondary` color tokens.
- `frontend/src/components/Dashboard.tsx` — card grid layout, financial overview structure.
- `frontend/src/components/Analytics.tsx`, `Reports.tsx` — chart color conventions (emerald for positive/income, red for expense).
- `frontend/src/components/BottomNav.tsx` — mobile navigation icon set and active-state styling.
- `frontend/public/icon.svg` — logo mark geometry.

Any mockup that visually diverges from these files (wrong corner radius, wrong icon, wrong color family) should be regenerated or manually corrected by the design team before entering the VFX pipeline — see `07-Production-Workflow.md` §3.2.
