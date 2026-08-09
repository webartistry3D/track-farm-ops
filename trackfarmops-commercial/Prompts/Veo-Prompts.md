# TRACKFARMOPS — VEO PROMPTS
"The Land Remembers" — AI Video Pre-Visualization

These prompts generate motion pre-vis (and, where quality allows, potential final generative plates) for the highest-risk, highest-cost sequences identified in `07-Production-Workflow.md`. Each prompt is written for Google Veo-class text-to-video models. Adjust duration/aspect-ratio parameters to the specific model version available.

**General settings for all prompts:** 16:9 aspect ratio, cinematic film grain, 24fps motion cadence, no on-screen text/watermarks.

---

## 1. FINAL ASCENDING AERIAL SHOT (A3-04) — Highest Priority

### 1.1 Master prompt (full sequence attempt)
```
Continuous ascending drone shot at golden hour, starting at human eye-level on a ridge overlooking a single African farm, then climbing steadily and smoothly higher and higher. As altitude increases, reveal: first the full extent of one farm with crop fields and a farmhouse, then neighboring farms coming into view, then dozens and eventually hundreds of varied agricultural landscapes stretching to the horizon — crop farms, cattle pastures, grain warehouses, dirt road networks connecting them. Warm golden-hour sunlight, soft lens flare, subtle atmospheric haze at higher altitudes. Cinematic, slow, continuous camera movement — no cuts, no jitter. Photorealistic, shot on high-end cinema drone camera, anamorphic lens character. Color grade: warm, hopeful, expansive. No people visible at higher altitudes, just the transforming landscape.
```

### 1.2 Segment prompt — low altitude (0–200m, ridge to single farm)
```
Slow drone ascent from human eye-level, golden hour lighting, rising above a lone farmer standing on a grassy ridge overlooking crop fields below. Warm sun flare, soft haze, cinematic 24fps motion, photorealistic. Reveal the full boundary of one African farm as the drone climbs — fields, a farmhouse, a dirt access road. Smooth, continuous, unhurried camera movement.
```

### 1.3 Segment prompt — mid altitude (200–800m, farm cluster)
```
Continuing drone ascent over African agricultural land at golden hour, now revealing a cluster of a dozen neighboring farms of varied types — crop fields, grazing cattle pastures, small grain warehouses, connected by winding dirt roads. Warm, glowing light, soft atmospheric haze increasing slightly with altitude. Cinematic aerial cinematography, smooth continuous ascent, no cuts.
```

### 1.4 Segment prompt — high altitude (800m+, continental scale)
```
High-altitude aerial drone/satellite-style view at golden hour, looking down on hundreds of scattered farms across a vast African landscape — a patchwork of crop fields, livestock pastures, warehouses, and road networks stretching to the horizon under warm, hazy light. Extremely wide, epic scale, subtle warm color grade, cinematic quality, photorealistic satellite-adjacent aerial photography style.
```

### 1.5 Post-production note
Generate all three segments (1.2–1.4) separately for maximum control, then blend/composite in post per `07-Production-Workflow.md` §2.3. Reserve the master prompt (1.1) purely for early creative-direction pre-vis, not final plates — continuous single-model generations at this duration/complexity are unlikely to hold consistency across the full altitude range.

---

## 2. NOTEBOOK-TO-LIGHT TRANSFORMATION (A2-03, A2-05, A2-07, A2-09)

### 2.1 Master transformation recipe prompt (template — swap [OBJECT] and [DATA])
```
Extreme close-up, [OBJECT] catches a single point of warm emerald-green light at its edge. The light spreads rapidly along the object's contours in a thin glowing line, like a circuit tracing itself across the surface. The object's surface briefly becomes semi-transparent, glass-like, as digital information dissolves into view: [DATA] resolves out of the light, sharp, legible, glowing softly, hovering just above the object's real surface. The object then returns to full solid opacity, now carrying a subtle permanent thin glowing line along its edge. Photorealistic, macro lens, shallow depth of field, warm cinematic lighting, seamless one-take transformation, no cuts.
```

### 2.2 Applied — Income/Expenses (A2-03)
```
Extreme close-up, a worn leather notebook page catches a single point of warm emerald-green light at its edge. The light spreads rapidly along the page's torn, curled contours in a thin glowing line, tracing like a circuit. The paper briefly becomes semi-transparent, glass-like, as glowing digital ledger numbers and currency figures resolve into view above the page surface, organizing themselves into neat rows in real time. The notebook then fades away as the numbers remain, floating cleanly above a wooden desk, sharp and legible. Photorealistic, macro lens, shallow depth of field, warm cinematic lighting, seamless one-take transformation.
```

### 2.3 Applied — Inventory (A2-05)
```
Extreme close-up, a burlap grain sack catches a single point of warm emerald-green light at its stitched seam. The light spreads along the seam in a thin glowing line. A small glass-like tag resolves out of the light on the sack's surface, displaying a glowing stock count number and a small box icon. Photorealistic, macro lens, warm cinematic lighting, seamless one-take transformation, shallow depth of field.
```

### 2.4 Applied — Assets (A2-07)
```
Extreme close-up, a mechanic's weathered hand runs along a tractor's dusty metal hood. As the hand passes, a thin emerald-green glowing line traces itself along a seam in the metal. A small glass-like digital tag resolves into view on the hood surface, displaying glowing text: service history, hours logged, a green checkmark condition status. Photorealistic, macro-to-medium lens, warm late-afternoon sunlight, seamless one-take transformation.
```

### 2.5 Applied — Livestock Health (A2-09)
```
Extreme close-up, a veterinarian's hand holds a small tablet near a calf's ear tag. The tag catches a single point of warm emerald-green light. A thin glowing line traces the tag's edge, and a small glass-like panel resolves into view above the tablet screen, showing a vaccination history timeline and a soft pulsing heart-health icon. Photorealistic, macro lens, warm natural daylight, shallow depth of field, seamless one-take transformation.
```

---

## 3. ECOSYSTEM CROSS-CUT LOOK DEVELOPMENT (A2-11)

Use these prompts to pre-visualize the unifying lighting/UI treatment across all 8 roles before scheduling live shoots (see `07-Production-Workflow.md` §1.2).

### 3.1 Investor — Lagos boardroom
```
Medium shot, a confident African businessman in a tailored suit, no tie, stands in a modern Lagos boardroom with floor-to-ceiling windows overlooking a city skyline at golden hour. He looks calmly at a large wall display showing a soft glassmorphic dashboard interface glowing in emerald green and white, showing a single large financial metric. Warm, sophisticated lighting, photorealistic, cinematic color grade, quiet confident mood, no dialogue.
```

### 3.2 Cooperative leader — under a tree
```
Medium shot, an African cooperative leader in traditional dress with modern touches stands under a large shade tree with two other community members, all looking calmly at a smartphone screen displaying a soft glassmorphic emerald-green dashboard interface. Warm natural daylight filtering through leaves, photorealistic, quiet confident mood, communal atmosphere, no dialogue.
```

### 3.3 Government/agricultural analyst — office
```
Medium shot, an African agricultural analyst in formal understated attire sits at a desk in a modest government office, a wall map of farmland visible softly out of focus behind them, looking at a computer monitor displaying a soft glassmorphic emerald-green regional data dashboard. Warm interior lighting, photorealistic, calm and informed mood, no dialogue.
```

---

## 4. USAGE NOTES

- Always render at the highest available resolution/duration setting even for pre-vis — cheap pre-vis at low quality makes lighting/color decisions harder to evaluate accurately.
- Cross-check every generated clip against `03-Visual-Bible.md` §2 Color Script for the correct saturation/warmth level for that beat before approving as final pre-vis reference.
- Do not use generative output as final broadcast-ready footage for any shot involving The Farmer or named ecosystem characters (Character Bible casting requires real actors) — Veo generations in this document are for pre-visualization, background/atmosphere plates, and the final aerial sequence only, per the production model in `07-Production-Workflow.md` §0.
