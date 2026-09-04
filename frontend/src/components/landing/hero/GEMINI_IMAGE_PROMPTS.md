# Gemini Image Generation Prompts — Hero Scrollytelling Scenes

## Overview

5 prompts for generating the hero section background images. Scene 1 already exists as `trackfarmops-bg.png` — use it as a **reference image** when generating Scenes 2–5 to maintain visual consistency.

## How to Use

1. Upload `trackfarmops-bg.png` as a reference image for each prompt (Scenes 2–5)
2. Copy-paste each prompt into Gemini's image generation
3. Generate 2–3 variants per scene, pick the best
4. Save as `hero-scene-1.jpg` through `hero-scene-5.jpg` in `frontend/public/hero/`
5. Update `scenes.ts` to replace the `PLACEHOLDER` constant with per-scene image paths

## Shared Style (already embedded in each prompt)

All prompts end with the same style suffix to ensure consistency:

> *Photorealistic, cinematic editorial photography, filmic colour grade with soft highlight roll-off and lifted blacks, natural skin and foliage tones, fine 35mm grain, no text, no logos, no watermark, no lens flare artefacts, no vignette.*

## Farm Identity (must persist across all scenes)

- **Location:** Southern Nigerian savanna-forest transition, flat to gently rolling terrain
- **Landmarks:** Long white-roofed poultry barn (top-left), gravel access road running diagonally, solar-roofed shed with 3 black water tanks (centre-right), cattle paddock behind buildings, maize rows, leafy vegetable rows, red harrow + yellow sprayer parked bottom-right
- **Light direction:** Always from top-right of frame, shadows fall bottom-left
- **Colour palette:** Field green `#3F7A3A`, deep foliage `#1F4D2B`, golden light `#F2B75B`, laterite soil `#9C5B2E`, sky warm `#F7DCA4`
- **Forbidden:** Text/logos in image, non-Nigerian architecture (no red barns, no silos), snow, pine trees, temperate crops, cartoon/illustrative style

---

## Prompt 1 — Scene 1: "The Land" (Reference Image — Already Exists)

> Aerial drone photograph of a mixed Nigerian farm at golden hour, 35 metres altitude, wide 28mm lens tilted down. A long white-roofed poultry barn at top-left, a gravel access road running diagonally from bottom-left toward the centre, a shed with blue solar panels and three black water tanks at centre-right, a cattle paddock with brown-and-white cattle behind the buildings, tall maize rows bottom-left and leafy vegetable beds bottom-centre, a red disc harrow and yellow sprayer parked bottom-right. Three farm workers small in frame. Low sun at top-right, warm haze on the far fields, long soft shadows falling bottom-left, scattered palm trees on a flat green horizon. Photorealistic, cinematic editorial photography, filmic colour grade with soft highlight roll-off and lifted blacks, natural skin and foliage tones, fine 35mm grain, no text, no logos, no watermark, no lens flare artefacts, no vignette.

**Note:** This is the existing placeholder image. Use it as the reference for all other scenes.

---

## Prompt 2 — Scene 2: "The Challenge"

**Reference image:** `trackfarmops-bg.png`

> Same Nigerian farm as the reference image, photographed from 12 metres altitude with a wide 24mm lens tilted slightly down and panned left so the gravel road enters from bottom-right. A towering dark cumulonimbus storm wall fills the sky; the sun is hidden except for one hard shaft of warm light striking the cattle paddock at top-right. Everything else is cool, flat, desaturated late-afternoon light. Strong wind: maize leaves lean, red dust lifts off the road. One worker mid-left carries a heavy sack, shoulders hunched; another stands at the shed door reading a paper ledger. The white barn and black water tanks remain visible mid-right. Tense, heavy atmosphere. Photorealistic, cinematic editorial photography, filmic colour grade with soft highlight roll-off and lifted blacks, natural skin and foliage tones, fine 35mm grain, no text, no logos, no watermark, no lens flare artefacts, no vignette.

**Emotion:** Pressure, fragmentation. The farm looks overwhelmed by weather and manual labour.

---

## Prompt 3 — Scene 3: "The Shift"

**Reference image:** `trackfarmops-bg.png`

> Ground-level eye-height photograph on the same Nigerian farm at dawn, 50mm lens at f/2.8. A Nigerian farmer aged about forty, dark skin, close-cropped hair, faded olive work shirt with rolled sleeves, straw wide-brim hat pushed back, stands in three-quarter profile on the right side of the frame looking down at a black smartphone held in his right hand; the screen casts a faint soft mint-green glow on his face and fingers. Behind him tall maize rows recede in soft focus toward a white barn and black water tanks. Low sun just above the horizon at top-right rim-lights his head and shoulders; thin ground mist glows in the mid-field. Calm, hopeful expression. Face fully visible, no sunglasses. Photorealistic, cinematic editorial photography, filmic colour grade with soft highlight roll-off and lifted blacks, natural skin and foliage tones, fine 35mm grain, no text, no logos, no watermark, no lens flare artefacts, no vignette.

**Emotion:** Relief, clarity. The transition from chaos to control. First light = new beginning.

---

## Prompt 4 — Scene 4: "The Operation"

**Reference image:** `trackfarmops-bg.png`

> Close-up over-the-shoulder photograph, 85mm macro lens at f/2, slightly high angle. Two dark-skinned working hands with a faint trace of soil in the skin creases and a simple steel wristwatch on the left wrist hold a thin-bezel black Android smartphone upright, positioned right of centre. The phone screen is a clean, soft, near-uniform dark green glow with only faint indistinct chart shapes, no readable text or UI elements. Behind the hands, leafy vegetable rows and a shed with blue solar panels dissolve into warm circular bokeh. Open shade, soft skylight, mid-afternoon, warm bounce from red-brown soil. Photorealistic, cinematic editorial photography, filmic colour grade with soft highlight roll-off and lifted blacks, natural skin and foliage tones, fine 35mm grain, no text, no logos, no watermark, no lens flare artefacts, no vignette.

**Emotion:** Control, competence. Hands-on mastery. The phone screen is intentionally blank — the actual dashboard UI is composited in code.

**Important:** The phone screen MUST be low-detail and uniform dark green. Do not generate any UI, text, or app interface on the screen.

---

## Prompt 5 — Scene 5: "The Future"

**Reference image:** `trackfarmops-bg.png`

> High aerial drone photograph at sunset from 120 metres, wide 24mm lens tilted down. In the bottom-left third the same Nigerian farm is recognisable — white barn, diagonal gravel road, black water tanks. Beyond it, eight similar farms tile the flat landscape to a hazy horizon; an irrigation canal catches the light as a bright S-curve through the mid-ground; two distant farms have centre-pivot irrigation arcs; two small agricultural drones hover with faint navigation lights; a pickup truck travels a far road. Sun three degrees above the horizon at top-right, saturated amber-to-peach sky, long violet shadows, glowing ground haze. Vast, optimistic scale, sense of a connected agricultural future. Photorealistic, cinematic editorial photography, filmic colour grade with soft highlight roll-off and lifted blacks, natural skin and foliage tones, fine 35mm grain, no text, no logos, no watermark, no lens flare artefacts, no vignette.

**Emotion:** Scale, momentum. The farm is part of something bigger. Sunset = the future is bright.

---

## Post-Generation Checklist

For each generated image, verify:

- [ ] Barn, road, and water tanks identifiable (Scenes 2, 5) or plausibly present in bokeh (Scenes 3, 4)
- [ ] Light source from top-right; shadows fall bottom-left
- [ ] Focal mass in right 45% of frame; left 55% has low-contrast area suitable for text overlay
- [ ] No text, logos, or watermarks in the image
- [ ] No extra limbs or fingers (Scenes 3, 4 — count carefully)
- [ ] Colour palette close to hex anchors (field green, golden light, laterite soil)
- [ ] Scene 4 phone screen is low-detail and uniform (no generated UI)
- [ ] 16:9 aspect ratio, high resolution (at least 1920x1080)

## After Generation

Update `frontend/src/components/landing/hero/scenes.ts`:

```typescript
// Replace PLACEHOLDER with per-scene paths:
const IMAGES = {
  scene1: '/hero/hero-scene-1.jpg',
  scene2: '/hero/hero-scene-2.jpg',
  scene3: '/hero/hero-scene-3.jpg',
  scene4: '/hero/hero-scene-4.jpg',
  scene5: '/hero/hero-scene-5.jpg',
};
```

Then set each scene's `image` and `imageFallback` to the corresponding path.
