# TRACKFARMOPS — PRODUCTION WORKFLOW
"The Land Remembers" — 90-Second Commercial

This is a hybrid production: live-action principal photography + AI-assisted pre-visualization/VFX + composited UI graphics. This document sequences the entire pipeline from script lock to final delivery.

---

## 0. PRODUCTION MODEL

Given the sophistication of the notebook-to-light transformations, the ecosystem cross-cut, and the final ascending aerial shot, this production should run **three parallel tracks** that converge in post:

1. **Live-Action Track** — farmer, ecosystem cast, practical locations.
2. **AI Pre-Vis & Generative Plate Track** — Veo/Gemini-generated reference for VFX-heavy shots (final ascent, transformation dissolves) to lock creative before expensive drone/VFX days.
3. **UI/Screen Graphics Track** — motion graphics built directly from the live TrackFarmOps product design system (see `04-UI-Bible.md`).

---

## 1. PHASE 1 — PRE-PRODUCTION (Weeks 1–3)

### 1.1 Creative Lock
- [ ] Final script lock (`01-Script.md`) — signed off by client/brand.
- [ ] Character Bible casting brief approved (`02-Character-Bible.md`).
- [ ] Visual Bible color script and reference deck approved (`03-Visual-Bible.md`).
- [ ] **Decision required:** Logo color treatment for final card — gold-green (as scripted) vs. pure emerald (brand-accurate). See `05-Shot-Bible.md` Production Note. Must be resolved before UI asset production begins.

### 1.2 AI Pre-Visualization Pass
- Generate low-res pre-vis of all VFX-dependent shots using prompts from `Prompts/Veo-Prompts.md` (motion/video) and `Prompts/Gemini-Prompts.md` (stills/concept frames).
- Priority order for pre-vis:
  1. Final ascending aerial shot (A3-04) — highest risk, highest cost, needs earliest lock.
  2. Notebook-to-light transformation recipe (all 4 instances) — needs one approved "hero" version before shooting live-action plates it will composite onto.
  3. Ecosystem cross-cut unifying look (A2-11) — 8 locations, needs a consistent lighting/UI treatment locked before scheduling 8 separate location shoots.
- Pre-vis cut assembled to scratch VO (see `Prompts/Voiceover-Prompts.md`) and scratch score (temp track per `06-Sound-Bible.md` references) for full-film timing approval before any live shoot day is booked.

### 1.3 Location Scouting
| Location | Used in | Notes |
|---|---|---|
| Misty dawn farmland w/ dirt path | A1-01, A1-02 | Needs elevation for drone pull-back; scout for reliable morning mist or plan fog machine backup |
| Fence post / open field | A1-03, A1-04, A1-05 | Close to farmland location for schedule efficiency |
| Tree with shade cover | A1-06 | Should visually echo/be reusable for cooperative leader shot in A2-11 |
| Boardroom-adjacent interior | A1-07 | Neutral, cool-lit interior |
| Office w/ physical wall map | A1-08 | Practical map prop needed — see Asset Tracker |
| Small farm office | A2-02, A2-03 | Practical desk + tablet mount for screen VFX plate |
| Warehouse w/ grain sacks | A2-04, A2-05 | Needs wall display surface for VFX composite |
| Tractor + open field | A2-06, A2-07 | Practical tractor, needs clean hood surface for tag VFX |
| Pasture w/ herd | A2-08, A2-09 | Livestock handling — vet/animal welfare supervision required |
| Glass-walled control room | A2-10, A2-11 (owner cutaway) | Purpose-built or found architectural location; must allow exterior light bleed per Visual Bible §3 |
| Lagos boardroom | A2-11 (investor) | Skyline view essential |
| Field w/ workers (soft focus bg) | A2-11 (manager) | |
| Small office | A2-11 (accountant) | |
| Golden-hour ridge overlook | A3-01, A3-02, A3-03 | **Hero location** — needs unobstructed horizon, reliable golden hour access, drone flight clearance |
| Aerial-only (multiple farm types) | A3-04 | Requires drone/helicopter access across varied real locations OR generative composite — see §2.3 |

### 1.4 Casting
- Run casting per `02-Character-Bible.md` §4 priorities — hands/posture-first casting sessions, not headshot review.
- Livestock and vet scenes require animal handler + veterinary supervisor on set regardless of scripted vet character.

---

## 2. PHASE 2 — PRODUCTION (Weeks 4–5)

### 2.1 Shoot Day Grouping (by location proximity, per Shot Bible)
- **Day 1:** A1-01 through A1-05 (dawn call, weather-dependent — build in a weather cover day).
- **Day 2:** A1-06, A1-07, A1-08 (interior/exterior mixed, no weather dependency).
- **Day 3:** A2-02, A2-03 (farm office) + A2-04, A2-05 (warehouse).
- **Day 4:** A2-06, A2-07 (tractor/mechanic) + A2-08, A2-09 (livestock/vet) — coordinate with animal welfare supervisor.
- **Day 5:** A2-10, A2-11 control room + as many of the 8 ecosystem cutaways as location logistics allow (Lagos boardroom likely needs its own travel day).
- **Day 6 (golden hour, 2 units if needed):** A3-01, A3-02, A3-03 + first aerial passes toward A3-04.

### 2.2 On-Set UI/Screen Reference
- Bring printed/tablet reference boards from `04-UI-Bible.md` to every shoot day involving a screen-within-screen (farm office, warehouse wall display, control room, all 8 ecosystem cutaways) so actors interact with plausible, correctly-scaled UI even before final compositing.
- Tablets/monitors on set should display a **placeholder build of the actual TrackFarmOps interface** (styled per UI Bible) wherever possible, so eyelines and hand gestures are accurate — replace with final animated graphics in post only where necessary.

### 2.3 Aerial Strategy for A3-04 (Final Ascent)
Given the shot's complexity (single continuous reveal from human scale to continental scale), recommend a **plate + composite approach** rather than one physical continuous flight:
1. Practical drone plate: farmer's ridge location, low-to-mid altitude ascent (real).
2. Practical or licensed aerial/satellite plates: 3–5 additional real farm landscapes (crop, livestock, warehouse, road network) at varying scales.
3. AI-generated or CG transitional "connective tissue" to blend altitude jumps seamlessly (see `Prompts/Veo-Prompts.md` for the exact generative prompt used to pre-vis and potentially source transition plates).
4. Emerald connector-line VFX pass added uniformly across the whole sequence in post (UI Bible §5.3 spec).

---

## 3. PHASE 3 — POST-PRODUCTION (Weeks 6–9)

### 3.1 Offline Edit (Week 6)
- Cut to scratch VO + temp score first; lock picture timing before final VO/score recording (protects the two critical silences at 00:23–00:25 and 01:28–01:30 — see `06-Sound-Bible.md`).
- Confirm all 8 ecosystem cutaways read as unified before locking — this sequence is the highest risk for feeling like "separate ads stitched together."

### 3.2 VFX (Weeks 6–8, parallel to edit)
- Build and approve **one master version** of the Notebook-to-Light Transformation recipe (Visual Bible §5) before replicating across all 4 instances — consistency is graded, not improvised, per instance.
- UI graphics team builds all screen-within-screen animations per `04-UI-Bible.md` and `Prompts/UI-Prompts.md`, using live product component geometry as reference.
- Final ascent composite (A3-04) assembled from plates per §2.3.
- Emerald connector-line pass applied consistently across control room, ecosystem cutaways, and final ascent.

### 3.3 Color Grade (Week 8)
- Full color script pass per `03-Visual-Bible.md` §2 — Act 1 cool/desaturated → Act 2 progressive warm/saturate → Act 3 full golden hour.
- Grade the notebook macro inserts and the UI glow as two distinct passes (analog texture vs. digital clarity contrast, per Visual Bible §7).

### 3.4 Sound (Weeks 8–9)
- Record final VO with talent per `06-Sound-Bible.md` §2 direction; use `Prompts/Voiceover-Prompts.md` scratch track as the pacing reference for the session.
- Compose and record final score — prioritize nailing the thematic callback (§1.4 of Sound Bible) and the custom tablet power-on brand tone.
- Foley pass for notebook/paper textures — must be recorded fresh with aged paper stock, not stock library.
- Final mix + loudness masters (broadcast, streaming, muted-social cutdown).

---

## 4. APPROVALS

| Milestone | Approver | Deliverable reviewed |
|---|---|---|
| Script lock | Brand/Client | `01-Script.md` |
| Casting | Director + Client | Character Bible casting tapes |
| Pre-vis lock | Director + Client | AI pre-vis cut w/ scratch VO/score |
| Logo color decision | Brand/Client | Shot Bible §A3-05 Production Note |
| Offline picture lock | Director + Client | Full edit, scratch audio |
| VFX/UI final approval | Director + Product team | Final ascent, transformation recipe, all screen graphics |
| Color final | Director + DP | Full grade pass |
| Sound final | Director + Composer | Final mix, all masters |
| Master delivery | Client | All formats per §5 |

---

## 5. FINAL DELIVERABLES CHECKLIST

- [ ] 90-second broadcast master (16:9, -23 LUFS)
- [ ] 90-second streaming master (16:9, -14 LUFS)
- [ ] Muted/captioned social cutdown, square (1:1) and vertical (9:16), with burned-in captions for the full VO
- [ ] 30-second cutdown (Act 2 + Act 3 highlights, per client media plan)
- [ ] 15-second cutdown (hero shot + logo card only)
- [ ] Clean textless version (for international VO dubbing / localization)
- [ ] All UI/screen graphics as standalone assets (for reuse in product marketing, per `Prompts/UI-Prompts.md`)
- [ ] Behind-the-scenes / making-of package (optional, high value for investor/PR use given the ecosystem-cast authenticity angle)

---

## 6. RISK REGISTER

| Risk | Mitigation |
|---|---|
| Weather dependency on dawn mist (A1-01/02) | Build in 1 weather cover day; fog machine backup plan |
| Livestock handling safety/timing | Dedicated animal handler + vet on set, buffer time in schedule |
| 8-location ecosystem cutaway logistics (incl. Lagos travel) | Group by region where possible; consider partial studio/set-build for accountant/office scenes to reduce location count |
| Final ascent shot complexity/cost overrun | Lock via AI pre-vis early (§1.2) before committing to expensive aerial/VFX days |
| Logo color ambiguity (script vs. product) | Resolve explicitly in Phase 1 approvals before UI asset production begins |
| UI graphics drifting from real product | Screen graphics team works directly against `frontend/` design tokens (UI Bible §1), reviewed by product design lead before final render |
