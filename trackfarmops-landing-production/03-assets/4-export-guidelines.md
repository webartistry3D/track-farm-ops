# Export Guidelines
## TrackFarmOps Landing Experience

> Version: 1.0
> Status: Locked
> Purpose: Define standardized export specifications for every production asset used in the TrackFarmOps landing experience.
> Owner: WebArtistry Creations

---

# Purpose

Every exported asset must be:

- Consistent
- Optimized
- Predictable
- Version-controlled
- Ready for production

Export settings are part of the production pipeline—not an afterthought.

---

# General Principles

Assets should be exported:

• At the smallest practical file size

• Without visible quality loss

• With consistent naming

• Using production-ready formats

• Optimized before commit

Never export directly from a design tool into production without optimization.

---

# Directory Structure

```
assets/

    illustrations/
    svg/
    images/
    ui/
    video/
    lottie/
    glb/
    icons/
    fonts/
```

---

# File Naming Convention

Pattern

```
category-name-variant-v1.ext
```

Examples

```
hero-farm-manager-v1.webp

warehouse-interior-v2.webp

receipt-v1.svg

dashboard-overview-v3.webp

cta-background-v1.webp

tractor-v1.glb
```

Never use:

```
final.png

latest.png

new2.png

copy.webp

design-final-final.svg
```

---

# Versioning

Major visual changes

```
v2
```

Minor refinements

```
v1.1
```

Bug fixes

```
v1.0.1
```

Every production asset should be traceable.

---

# SVG Export

Preferred Tool

Figma

Illustrator

Inkscape

Requirements

✓ Preserve ViewBox

✓ Remove metadata

✓ Outline strokes only when necessary

✓ Minify

✓ Responsive

✓ Layer names preserved if animation is required

Maximum Sizes

Icons

<5 KB

Documents

<20 KB

Illustrations

<60 KB

Maps

<80 KB

Optimization

Use SVGO before production.

---

# WebP Export

Preferred for raster assets.

Quality

85–90%

Color Profile

sRGB

Transparency

Enabled when required

Maximum Widths

Hero

2560px

Section Background

1920px

Illustration

1600px

Cards

1200px

Mobile

900px

Target Sizes

Hero

<350 KB

Illustrations

<250 KB

Cards

<120 KB

Backgrounds

<300 KB

---

# PNG Export

Only when transparency is essential.

Examples

Particles

Masks

Special overlays

Avoid PNG for photographic content.

---

# JPEG Export

Only for:

Photography

Reference boards

Documentation

Quality

85%

Progressive JPEG preferred.

---

# AVIF Export

Preferred for:

Large hero imagery

Background scenes

Landscape illustrations

Quality

45–60

Fallback

WebP

---

# GLB Export

Used for:

Hero 3D objects

Interactive scenes

Product showcases

Requirements

Compressed with Draco

Embedded textures

Real-world scale

PBR materials

Target Size

<3 MB

---

# Blender Export

Preferred Formats

GLB

FBX (production only)

Camera

Metric units

Scale

1 meter

Apply transforms

Before export

Textures

Power-of-two dimensions

2048px maximum unless approved

---

# Lottie Export

Used for:

Icons

Loading states

Micro-interactions

Requirements

JSON

No raster images

Vector-only

Target Size

<100 KB

Avoid unsupported After Effects features.

---

# Video Export

Preferred Codec

H.264

Container

MP4

Resolution

Desktop

1920×1080

Mobile

1080×1920 (if required)

Frame Rate

60 FPS

Bitrate

8–12 Mbps

Looping videos should:

Begin and end seamlessly.

---

# Audio Export

Format

OGG

Fallback

MP3

Bitrate

192 kbps

Normalize

-16 LUFS

Audio should remain optional.

---

# Font Assets

Preferred

WOFF2

Fallback

WOFF

Never ship TTF or OTF directly.

Subset fonts before deployment.

---

# Favicon Assets

Required

favicon.ico

favicon.svg

apple-touch-icon.png

android-chrome-192.png

android-chrome-512.png

site.webmanifest

---

# Icon Assets

Primary Format

SVG

Fallback

PNG

Consistent viewport

24×24

32×32

48×48

No inconsistent sizing.

---

# Dashboard Assets

Export individually.

Never flatten complete dashboards.

Each widget should remain reusable.

---

# Image Optimization

Before commit:

✓ Remove metadata

✓ Compress

✓ Resize

✓ Verify quality

✓ Verify color profile

✓ Verify transparency

---

# Color Management

Working Color Space

sRGB

Never export using:

Adobe RGB

Display P3

CMYK

unless explicitly required.

---

# Responsive Assets

Provide variants where appropriate:

Desktop

Tablet

Mobile

Do not rely solely on browser scaling.

---

# Accessibility

Maintain sufficient contrast.

Avoid embedding critical text inside images.

Decorative assets should not replace meaningful content.

---

# Git Standards

Do not commit:

Source exports with unnecessary metadata

Duplicate files

Unused variants

Temporary exports

Review every asset before merge.

---

# Export Checklist

Before approving an asset:

✓ Correct format

✓ Correct naming

✓ Versioned

✓ Optimized

✓ Responsive

✓ Color profile verified

✓ Compression verified

✓ Referenced in Asset Bible

✓ Animation-ready

✓ Performance budget respected

---

# Definition of Done

An exported asset is production-ready only if it:

✓ Matches the Art Direction

✓ Meets performance budgets

✓ Passes optimization checks

✓ Uses approved naming conventions

✓ Is committed to the correct directory

✓ Is documented in the Asset Bible

✓ Can be consumed directly by the Next.js application

---

# Final Principle

Every exported asset should be immediately deployable.

If an engineer needs to rename, resize, recompress or optimize an asset after export, the export process has failed.

Production assets should move from the design pipeline into the application without modification.