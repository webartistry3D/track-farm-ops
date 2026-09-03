# TrackFarmOps — Scroll-Triggered Hero Storyboard (v2, Production Spec)

> Replaces the `track-farm-ops-bg.mp4` video background in `landing/Hero.tsx` with a 5-scene, scroll-scrubbed scrollytelling sequence. Every value below is a build target, not a suggestion — deviations should be deliberate and logged.

---

## 0. Global Contract

### 0.1 Source of Truth
| Item | Value |
|---|---|
| **Master reference** | `frontend/public/trackfarmops-bg.png` (1024×585, aerial, golden hour) |
| **Farm identity** | The *same* farm in every scene. Landmarks that must persist: long white poultry barn (top-left), gravel access road running diagonally bottom-left → centre, solar-roofed shed with 3 black water tanks (centre-right), cattle paddock behind the barns, maize rows (bottom-left), leafy vegetable rows (bottom-centre), red harrow + yellow sprayer (bottom-right). |
| **Geography** | Southern Nigerian savanna-forest transition. Flat to gently rolling. Scattered palms and shrub trees on the horizon. Red-brown laterite soil where exposed. |
| **Time-of-day arc** | Golden hour → pre-storm afternoon → first light dawn → mid-afternoon → sunset. Light direction always **from the top-right of frame** (camera faces north-west) so crossfades don't flip shadows. |

### 0.2 Visual Grammar (applies to every generated frame)
| Attribute | Spec |
|---|---|
| **Aspect** | 16:9 native. Safe area for text: left 55% of frame, vertically 20%–80%. Keep visual focal points in the **right 45%**. |
| **Resolution** | Generate at model max → upscale to 3840×2160 → export WebP q82 + JPEG fallback q85. |
| **Lens language** | Scenes 1, 2, 5: 24–28mm full-frame equivalent, deep focus. Scene 3: 50mm, f/2.8, subject-focused. Scene 4: 85mm macro, f/2, hands + phone only. |
| **Colour palette (hex anchors)** | Field green `#3F7A3A` · Deep foliage `#1F4D2B` · Golden light `#F2B75B` · Laterite soil `#9C5B2E` · Sky warm `#F7DCA4` · Sky storm `#4B5563` · Brand emerald `#34D399` (UI only, never in landscape) |
| **Grade** | Filmic S-curve, lifted blacks (≈ RGB 18,20,18), soft highlight roll-off, no crushed shadows. Subtle 2–3% grain. No HDR halos. No vignette baked in (applied in CSS). |
| **Forbidden** | Text/logos/watermarks in image · Non-Nigerian architecture (no red barns, no silos) · Snow, pine trees, temperate crops · Lens flares stronger than subtle · Cartoon/illustrative style · Empty-frame centre (needs depth cues) |

### 0.3 Scroll Architecture
| Parameter | Value |
|---|---|
| **Pinned container height** | `500vh` (100vh per scene). Hero pins for the full 500vh; `ScrollTrigger` scrub with `scrub: 0.8` (slight lag for weight). |
| **Scene ownership** | Scene *n* owns scroll progress `[(n-1)×0.20, n×0.20)`. |
| **Crossfade window** | Last 25% of each scene's range (i.e. `0.15–0.20`, `0.35–0.40`, …). Outgoing image opacity 1 → 0 with `power2.inOut`; incoming image 0 → 1 with `power2.out`. Images are stacked, incoming always **above** outgoing. |
| **Text lifecycle per scene** | Enter: `0.00–0.20` of scene range (`y: 40 → 0`, `opacity: 0 → 1`, `power3.out`). Hold: `0.20–0.70`. Exit: `0.70–1.00` (`y: 0 → -30`, `opacity: 1 → 0`, `power2.in`). |
| **Background parallax** | Each image `scale` animates across its scene per the table in §1. Additionally `y` drifts `0 → -3vh` across the scene for depth. |
| **Reduced motion** | `prefers-reduced-motion: reduce` → no pin, Scene 1 image static, all 5 text blocks rendered stacked as normal sections. |
| **Mobile (<1024px)** | Pin retained but `scrub: 0.5`; scenes collapse to `100svh` each; text safe area becomes full width, bottom-anchored with a gradient scrim `rgba(2,6,23,0.72) → transparent` from bottom 60%. |

### 0.4 Layer Stack (z-index, bottom → top)
```
z-0   <section bg="#020617">                      solid fallback
z-10  <img scene-1> … <img scene-5>               position:fixed; object-fit:cover; opacity driven
z-20  Cinematic vignette                          radial-gradient(ellipse at center, transparent 55%, rgba(2,6,23,0.55) 100%)
z-25  Directional scrim (per-scene tint, see §1)  linear-gradient(105deg, …)
z-30  Grid texture (.bg-grid, opacity .12, mask to bottom)
z-35  Emerald orbs (Scene 1 & 5 only)
z-40  Text + UI layer (one absolutely-positioned block per scene)
z-50  Persistent chrome: scroll cue, progress rail (5 dots, left edge, lg+ only)
```

---

## 1. Scene Specifications

### Scene 1 — "The Land"
**Scroll range** `0.00 → 0.20` · **Duration feel** ~1 viewport of scroll · **Emotion** Grounded pride

| Field | Spec |
|---|---|
| **Narrative beat** | *This is where it starts. The land. The work. The potential.* |
| **Camera** | Aerial, ~35 m altitude, 28mm eq., pitched −28°. Horizon at 18% from top. Identical framing to master reference — this frame *is* the reference, regenerated at higher fidelity. |
| **Lighting** | Golden hour, sun 8° above horizon at top-centre-right, light haze in the far field, long soft shadows cast toward bottom-left. Colour temp ≈ 3400K. |
| **Subjects** | 3–4 workers in field (small scale), cattle in paddock, tractor by the shed. No one looking at camera. |
| **Background motion** | `scale: 1.00 → 1.06`, origin `60% 40%` (pushes toward the buildings cluster). |
| **Scrim** | `linear-gradient(105deg, rgba(2,44,34,0.78) 0%, rgba(4,78,54,0.42) 45%, rgba(15,23,42,0.30) 100%)` |
| **Orbs** | `orb-one` emerald `rgba(52,211,153,0.20)` 320px blur-3xl at top-right; `orb-two` lime `rgba(190,242,100,0.15)` 288px at bottom-left. Both idle-loop (existing GSAP yoyo). |
| **Text — H1** | Line 1 `Run your farm` (white, `clamp(2.25rem,8vw,5.5rem)`). Line 2 `from your smartphone.` (gradient `emerald-200 → lime-100 → amber-100`, `clamp(1.4rem,6vw,4rem)`). Font `JetBrains Mono` 700, tracking −0.02em, leading 1.05. |
| **Text — Body** | Existing description copy. `slate-200`, max-w 2xl, `text-lg/8`. |
| **Chips** | 3 existing `heroChips`. **Opaque** styling: `bg-slate-900/90 border border-white/15` (no backdrop-blur — matches app-wide glassmorphism removal). |
| **CTAs** | Primary `Start managing for free` (emerald-400 → hover emerald-300). Secondary `See how it works` → scrolls to progress `0.20` (Scene 2), not to `#challenges`. |
| **Social proof row** | Retained as-is. |
| **Stats bar** | 4 stats, `CountUp` triggers on mount. Opaque: `bg-slate-900/85 border-white/15`. **Exits at scene progress 0.70** with the rest of the text block. |
| **Persistent** | Scroll cue "Explore ↓" visible only while global progress `< 0.05`. |

---

### Scene 2 — "The Challenge"
**Scroll range** `0.20 → 0.40` · **Emotion** Pressure, fragmentation

| Field | Spec |
|---|---|
| **Narrative beat** | *But running a farm is hard. Money leaks. Inventory vanishes. Health risks go unnoticed.* |
| **Camera** | Same farm, camera lowered to ~12 m, 24mm eq., pitched −12°, panned 20° left so the road leads diagonally into frame from bottom-right. Horizon at 30% from top. Barn and water tanks still identifiable at mid-right. |
| **Lighting** | Late afternoon under a fast-building cumulonimbus wall. Sun occluded; a single break in cloud throws one hard shaft of light onto the paddock (top-right) — the only warm element. Everything else cool, flat, ~6000K. Wind evident: maize leaning, dust lifting off the road. |
| **Subjects** | One worker mid-frame-left carrying a sack, hunched. A second figure at the shed door checking a paper ledger. Cattle bunched together. |
| **Background motion** | `scale: 1.04 → 1.00` (settling, heavy). `y: 0 → -3vh`. |
| **Scrim** | `linear-gradient(105deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.55) 50%, rgba(15,23,42,0.35) 100%)` |
| **Text — Eyebrow** | `THE REALITY` — `text-xs tracking-[0.2em] text-rose-300 font-semibold`. |
| **Text — H2** | `Running a farm shouldn't feel like guesswork.` — white, `clamp(1.75rem,5vw,3.5rem)`, JetBrains Mono 700. |
| **Text — Body** | `Money leaks between WhatsApp, exercise books and Excel. Feed disappears. A sick animal goes unnoticed until it's too late.` — `slate-300`, max-w xl. |
| **Problem list** | 6 `problems` from `content.ts` rendered as a 2×3 grid of compact rows: rose icon disc + title only. Stagger `0.06s`, enter from `x: -20`. |
| **Micro-detail** | A thin rose progress line (`h-px bg-rose-400/60`) draws left→right under the H2 across the scene's hold phase. |

---

### Scene 3 — "The Shift"
**Scroll range** `0.40 → 0.60` · **Emotion** Relief, clarity

| Field | Spec |
|---|---|
| **Narrative beat** | *What if you could see everything — every naira, every bag of feed, every animal — in one place?* |
| **Camera** | Ground level, eye height (~1.6 m), 50mm eq., f/2.8. Farmer stands three-quarter profile at frame-right (x ≈ 68%), facing frame-left, looking down at phone. The maize rows recede behind him toward the barn cluster (soft-focus, still recognisable). Horizon at 40%. |
| **Lighting** | Dawn, 15 min after sunrise. Low sun at top-right behind the farmer's shoulder → rim light on head/shoulders, soft fill from sky. Mist hugging the ground in the mid-field. Phone screen casts a faint cool glow onto the farmer's face and hands (`#A7F3D0` tint, subtle). ~4200K ambient. |
| **Subject** | Nigerian man, 35–45, dark skin, close-cropped hair, wearing a faded olive work shirt with sleeves rolled and a wide-brim straw hat pushed back. Holding a modern black Android phone in right hand, left hand loosely at side. Expression: calm, focused, slight relief. **Face fully visible, no sunglasses.** |
| **Background motion** | `scale: 1.00 → 1.05`, origin `68% 45%` (drifts toward the farmer). |
| **Scrim** | `linear-gradient(105deg, rgba(2,44,34,0.80) 0%, rgba(6,78,59,0.40) 45%, transparent 100%)` — leaves the farmer clean. |
| **Text — Eyebrow** | `THE SHIFT` — `text-emerald-300`. |
| **Text — H2** | `One app. Total clarity.` |
| **Text — Body** | `Every naira, every bag of feed, every animal — recorded in seconds, visible from anywhere.` |
| **Solution list** | 6 `solutions` as pills (`bg-emerald-500/15 border-emerald-400/30 text-emerald-100`), wrap in 2 rows, stagger `0.05s`, enter from `scale: 0.9`. |
| **Transition emphasis** | The crossfade Scene 2 → 3 is the emotional hinge. Extend this crossfade to **35%** of the scene window (`0.33 → 0.40`) instead of 25%, and add a `brightness(0.85) → brightness(1.0)` filter ramp on the incoming image. |

---

### Scene 4 — "The Operation"
**Scroll range** `0.60 → 0.80` · **Emotion** Control, competence

| Field | Spec |
|---|---|
| **Narrative beat** | *Every record. Every report. Every decision — from anywhere, at any time.* |
| **Camera** | 85mm macro eq., f/2. Over-the-shoulder, slightly high angle (−20°). Two hands hold a phone in landscape-ish portrait at frame-right (phone centre x ≈ 66%, y ≈ 52%). Background: the vegetable rows and the solar-roofed shed as soft bokeh discs. |
| **Lighting** | Mid-afternoon, 3 pm. Open shade — the phone and hands lit by soft skylight, no direct sun on the screen (avoid glare). Warm bounce from the soil onto the underside of the hands. ~5200K. |
| **Subject** | Same farmer's hands (dark skin, working hands, short nails, faint soil in creases; a simple steel wristwatch on left wrist). Phone: black, thin bezels, **screen intentionally rendered as a soft, near-uniform dark-green glow with faint indistinct chart shapes** — the real dashboard UI is composited in code (see below), so the generated screen must be *clean and low-detail*. |
| **UI composite (code, not generated)** | An `<img>`/`<div>` of a mock TrackFarmOps dashboard is absolutely positioned over the phone screen region using a 4-point CSS `perspective` + `rotate3d` to match the phone plane. Assets: `/hero/ui/dash-income.svg`, `dash-inventory-alert.svg`, `dash-livestock.svg`. They slide in sequentially at scene progress `0.15 / 0.30 / 0.45`. |
| **Background motion** | `scale: 1.08 → 1.00` (pulling back to reveal the hands). `rotateZ: 0.6deg → 0deg` for subtle handheld feel. |
| **Scrim** | `linear-gradient(105deg, rgba(2,6,23,0.82) 0%, rgba(2,6,23,0.45) 45%, transparent 100%)` |
| **Text — Eyebrow** | `THE OPERATION` |
| **Text — H2** | `Built for the business of farming.` |
| **Text — Body** | `Bank-level security. Works on low-end Android and patchy networks. Backed by a Nigerian support team that knows your season.` |
| **Feature list** | 4 items with lucide icons: `Smartphone` Mobile-first · `ShieldCheck` AES-256 encrypted · `LineChart` Smart analytics · `Globe` Local support. Vertical list, stagger `0.08s`. |

---

### Scene 5 — "The Future"
**Scroll range** `0.80 → 1.00` · **Emotion** Scale, momentum

| Field | Spec |
|---|---|
| **Narrative beat** | *This is the future of farming. And it's already here.* |
| **Camera** | High aerial, ~120 m, 24mm eq., pitched −35°. **Our farm** occupies the bottom-left third (barn, road, tanks still readable); beyond it, 6–10 similar farms tile the landscape to a hazy horizon. Horizon at 22%. A river or irrigation canal catches the light as a bright S-curve through the mid-ground. |
| **Lighting** | Sunset, sun 3° above horizon at top-right, saturated amber-to-peach sky, long violet shadows, ground haze glowing. ~2800K. |
| **Subjects** | Two small agricultural drones in flight (specks with faint nav lights), centre-pivot irrigation arcs on two distant farms, a pickup on the far road. No people readable at this altitude. |
| **Background motion** | `scale: 1.10 → 1.00` (grand pull-back), origin `50% 60%`. `y: 0 → -4vh`. |
| **Scrim** | `linear-gradient(180deg, rgba(2,6,23,0.35) 0%, rgba(2,6,23,0.15) 40%, rgba(2,6,23,0.85) 100%)` — bottom-heavy to seat the CTA. |
| **Orbs** | `orb-one` returns at `rgba(52,211,153,0.16)`, centre-bottom, slow pulse. |
| **Text — Eyebrow** | `THE FUTURE` |
| **Text — H2** | `This is the future of farming.` — **centred**, `clamp(2rem,6vw,4.5rem)`. |
| **Text — Body** | `Join the farms already running on TrackFarmOps — and stay in control from anywhere.` — centred, `slate-200`. |
| **Final CTA** | `Start managing for free` — centred, `px-8 py-4 text-lg`, soft emerald glow `shadow-[0_0_40px_rgba(52,211,153,0.35)]`, gentle `scale 1 → 1.03` idle pulse (2.4s). |
| **Testimonial** | John Akpoborie quote, avatar `/Uche.jpg`, centred, max-w lg, `border-t border-white/10 pt-6 mt-8`. |
| **Hand-off** | At global progress `1.00` the pin releases; `ProblemsSection` (`#challenges`) begins immediately below with a `bg-white` top edge. Scene 5's bottom scrim ensures no harsh cut. |

---

## 2. Generation Plan (Higgsfield)

### 2.1 Pipeline
1. `media_upload` → PUT `trackfarmops-bg.png` → `media_confirm` (type `image`). Record `REF_ID`.
2. Inspect `models_explore(get)` for the chosen model's `medias[].roles` and pass `REF_ID` with the image-reference role on **every** scene for landmark/palette continuity.
3. Generate **Scene 1 first**. Approve it. Then pass **both** `REF_ID` and the approved Scene-1 `job_id` as references for Scenes 2 & 5 (aerial family). For Scenes 3 & 4 pass `REF_ID` only (ground level; the aerial would fight composition).
4. Generate `count: 2` per scene, pick one, discard the other.
5. `upscale_image` winner → 4K. `remove_background` is **not** used.
6. Export WebP + JPEG to `frontend/public/hero/`.

### 2.2 Model
Primary: `soul_location` (environment specialist, supports 16:9).
Fallback if reference roles are unsupported: `nano_banana_pro` (strong reference adherence, 4K native).

### 2.3 Prompts

**Shared style suffix (append to every prompt):**
> `Photorealistic, cinematic editorial photography, filmic colour grade with soft highlight roll-off and lifted blacks, natural skin and foliage tones, fine 35mm grain, no text, no logos, no watermark, no lens flare artefacts, no vignette.`

| # | Prompt (before suffix) |
|---|---|
| **1** | `Aerial drone photograph of a mixed Nigerian farm at golden hour, 35 metres altitude, wide 28mm lens tilted down. A long white-roofed poultry barn at top-left, a gravel access road running diagonally from bottom-left toward the centre, a shed with blue solar panels and three black water tanks at centre-right, a cattle paddock with brown-and-white cattle behind the buildings, tall maize rows bottom-left and leafy vegetable beds bottom-centre, a red disc harrow and yellow sprayer parked bottom-right. Three farm workers small in frame. Low sun at top-right, warm haze on the far fields, long soft shadows falling bottom-left, scattered palm trees on a flat green horizon.` |
| **2** | `Same Nigerian farm as reference, photographed from 12 metres altitude with a wide 24mm lens tilted slightly down and panned left so the gravel road enters from bottom-right. A towering dark cumulonimbus storm wall fills the sky; the sun is hidden except for one hard shaft of warm light striking the cattle paddock at top-right. Everything else is cool, flat, desaturated late-afternoon light. Strong wind: maize leaves lean, red dust lifts off the road. One worker mid-left carries a heavy sack, shoulders hunched; another stands at the shed door reading a paper ledger. The white barn and black water tanks remain visible mid-right. Tense, heavy atmosphere.` |
| **3** | `Ground-level eye-height photograph on the same Nigerian farm at dawn, 50mm lens at f/2.8. A Nigerian farmer aged about forty, dark skin, close-cropped hair, faded olive work shirt with rolled sleeves, straw wide-brim hat pushed back, stands in three-quarter profile on the right side of the frame looking down at a black smartphone held in his right hand; the screen casts a faint soft mint glow on his face and fingers. Behind him tall maize rows recede in soft focus toward a white barn and black water tanks. Low sun just above the horizon at top-right rim-lights his head and shoulders; thin ground mist glows in the mid-field. Calm, hopeful expression.` |
| **4** | `Close-up over-the-shoulder photograph, 85mm macro lens at f/2, slightly high angle. Two dark-skinned working hands with a faint trace of soil in the skin creases and a simple steel wristwatch on the left wrist hold a thin-bezel black Android smartphone upright, positioned right of centre. The phone screen is a clean, soft, near-uniform dark green glow with only faint indistinct chart shapes, no readable text. Behind the hands, leafy vegetable rows and a shed with blue solar panels dissolve into warm circular bokeh. Open shade, soft skylight, mid-afternoon, warm bounce from red-brown soil.` |
| **5** | `High aerial drone photograph at sunset from 120 metres, wide 24mm lens tilted down. In the bottom-left third the same Nigerian farm is recognisable — white barn, diagonal gravel road, black water tanks. Beyond it, eight similar farms tile the flat landscape to a hazy horizon; an irrigation canal catches the light as a bright S-curve through the mid-ground; two distant farms have centre-pivot irrigation arcs; two small agricultural drones hover with faint navigation lights; a pickup truck travels a far road. Sun three degrees above the horizon at top-right, saturated amber-to-peach sky, long violet shadows, glowing ground haze. Vast, optimistic scale, sense of a connected agricultural future.` |

### 2.4 Acceptance Criteria (per image)
- [ ] Barn, road and water tanks identifiable (Scenes 1, 2, 5) or plausibly present in bokeh (3, 4)
- [ ] Light source from top-right; shadows fall bottom-left
- [ ] Focal mass in right 45%; left 55% has low-contrast area suitable for text
- [ ] No text, logos, or extra limbs/fingers (Scenes 3, 4: count fingers)
- [ ] Palette within ±10% of hex anchors after grade
- [ ] Horizon within ±4% of spec
- [ ] Scene 4 phone screen is low-detail (compositable)

### 2.5 Budget
| Step | Qty | Est. credits |
|---|---|---|
| Generations (`count: 2` × 5) | 10 | ~100 |
| Upscales to 4K | 5 | ~25 |
| **Total** | | **~125** |

> Current balance: **10 credits (free plan)**. Generation requires Basic or higher. Trial (100 credits) covers Scenes 1–4 at `count: 1` plus upscales; a Plus plan is needed for the full `count: 2` pass.

---

## 3. Code Plan

### 3.1 Files
```
frontend/src/components/landing/
├── Hero.tsx                 REWRITE — pinned scrollytelling container
├── hero/
│   ├── scenes.ts            NEW — scene config (image paths, scrims, transforms, copy)
│   ├── HeroScene.tsx        NEW — one scene's text/UI block, receives progress
│   ├── HeroBackdrop.tsx     NEW — 5 stacked <img>, scrub-driven opacity/scale
│   ├── PhoneComposite.tsx   NEW — Scene 4 dashboard overlay with 3D plane match
│   └── ProgressRail.tsx     NEW — 5-dot rail, lg+ only
├── content.ts               EXTEND — add heroScenes copy arrays

frontend/public/hero/
├── scene-1-the-land.webp / .jpg
├── scene-2-the-challenge.webp / .jpg
├── scene-3-the-shift.webp / .jpg
├── scene-4-the-operation.webp / .jpg
├── scene-5-the-future.webp / .jpg
└── ui/
    ├── dash-income.svg
    ├── dash-inventory-alert.svg
    └── dash-livestock.svg
```

### 3.2 Scroll Engine
- `gsap.registerPlugin(ScrollTrigger)` in `lib/gsap`.
- One master `ScrollTrigger` on `#hero`: `pin: true, start: 'top top', end: '+=400%', scrub: 0.8, anticipatePin: 1`.
- One master `gsap.timeline()` of normalised duration `5`. Scene *n* occupies `[n-1, n)`. All image/text tweens are placed by absolute position on this timeline; **no nested ScrollTriggers**.
- `ScrollTrigger.matchMedia` splits desktop / mobile / reduced-motion behaviours.
- Preload: Scene 1 eager (`<link rel="preload" as="image">`); Scenes 2–5 `loading="eager"` but `fetchpriority="low"`, decoded via `img.decode()` before first crossfade.

### 3.3 Interactions
- `See how it works` → `gsap.to(window, { scrollTo: heroTop + 1 * vh })` (Scene 2 start).
- Progress rail dots → jump to scene start; active dot tracks `Math.floor(progress * 5)`.
- Nav: the existing `Navigation` stays fixed above the pinned hero (`z-[60]`).

### 3.4 Performance Targets
| Metric | Target |
|---|---|
| LCP (Scene 1 image) | < 2.5 s on 4G |
| Scroll jank | 0 long tasks > 50 ms during scrub |
| Image payload (all 5 WebP @ 1920w) | < 1.4 MB |
| CLS | 0 (fixed heights, pinned) |

---

## 4. Decisions (locked)

| # | Decision | Choice | Impact |
|---|---|---|---|
| 1 | Scene 3 & 4 farmer | **One-off generation** | No Soul training. Face may differ slightly between scenes 3 & 4 — acceptable for hero scroll. |
| 2 | Scene 4 dashboard | **Stylised SVG mocks** | Purpose-built SVGs (`dash-income.svg`, `dash-inventory-alert.svg`, `dash-livestock.svg`) composited over the phone screen. No real screenshots needed. |
| 3 | Scene 5 copy | **Keep product copy** | Landing hero stays product-focused. Scene 5 H2 changed from "From 2 farms to 200" to product messaging. The "2 to 200" copy lives only on the campaign page. |
| 4 | Billing | **Pending** | 10 credits on free plan. Need at least Basic to generate. Trial or upgrade — user to decide before generation step. |
