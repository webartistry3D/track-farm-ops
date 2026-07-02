# SVG Library
## TrackFarmOps Landing Experience

> Version: 1.0
> Status: Locked
> Purpose: Master specification for every SVG asset used throughout the TrackFarmOps landing experience.
> Owner: WebArtistry Creations

---

# Philosophy

SVG is the primary illustration format of the landing experience.

SVGs should not merely decorate interfaces.

They should communicate.

Animate.

Transform.

Scale infinitely.

Every SVG should be lightweight, reusable and animation-ready.

---

# Why SVG?

SVG provides:

• Infinite scalability

• Small file sizes

• DOM accessibility

• GSAP compatibility

• CSS styling

• Path animation

• Responsive rendering

SVG should always be preferred over PNG whenever possible.

---

# Asset Categories

SVG assets are grouped into:

Brand

Icons

Documents

Agriculture

UI

Charts

Maps

Workflow

Background Elements

Decorative Elements

Patterns

Dividers

Logos

Every SVG belongs to one category.

---

# Folder Structure

```
assets/

    svg/

        brand/

        icons/

        documents/

        ui/

        charts/

        maps/

        agriculture/

        backgrounds/

        patterns/

        dividers/

        workflow/
```

---

# Naming Convention

Use semantic names.

Examples

```
receipt.svg

inventory-card.svg

fuel-log.svg

warehouse.svg

rice-bag.svg

farm-map.svg

workflow-arrow.svg

chart-line.svg
```

Avoid

```
icon1.svg

graphic-final.svg

new-design.svg

shape-copy.svg
```

---

# ID Convention

Every SVG receives an Asset ID.

```
SVG-001

SVG-002

SVG-003
```

Referenced inside the Asset Bible.

---

# SVG Standards

Use:

Vector paths

Rounded joins

Rounded caps

Clean geometry

Consistent stroke widths

Avoid:

Raster images

Embedded PNGs

Excessive anchor points

Hidden layers

Unused groups

Illustrator metadata

---

# Stroke System

Primary

2px

Secondary

1.5px

Fine Detail

1px

No arbitrary stroke widths.

---

# Corner Radius

Rounded corners should follow Design Tokens.

Never manually invent corner radii.

---

# Color Usage

All colors must reference Design Tokens.

Example

```
var(--color-brand-primary)

var(--text-primary)

var(--surface-primary)
```

Never hardcode HEX values inside production SVGs.

---

# Layer Naming

Every editable SVG should contain meaningful layer names.

Example

```
background

paper

icon

shadow

highlight

outline
```

Avoid:

```
Layer 1

Group 45

Path 21
```

---

# Animation Readiness

Every animated object should be isolated.

Example

Receipt

↓

Paper

↓

Shadow

↓

Stamp

↓

Fold

↓

Icon

This allows GSAP to animate individual parts.

---

# Document Assets

Required SVGs

Purchase Receipt

Expense Receipt

Fuel Log

Attendance Sheet

Inventory Card

Harvest Record

Invoice

Purchase Order

Delivery Note

Barcode Label

Weight Ticket

Warehouse Label

Each document should be individually editable.

---

# Agriculture Assets

Rice Sack

Seed Bag

Fertilizer Bag

Warehouse

Rice Plant

Tractor

Forklift

Pickup Truck

Water Pump

Generator

Drying Rack

Storage Bin

All simplified for vector animation.

---

# Dashboard Assets

Cards

Buttons

Charts

Widgets

Notifications

Progress Bars

Timeline

Navigation

Sidebar

Calendar

Tables

Map Pins

Status Indicators

Every dashboard component should exist independently.

---

# Charts

Line Chart

Bar Chart

Area Chart

Donut Chart

Progress Ring

Sparkline

Trend Arrow

Legend

Grid

Axis

All charts should animate through SVG paths.

---

# Maps

Nigeria Outline

State Boundaries

Farm Marker

Warehouse Marker

Route Line

Connection Line

Distribution Network

Maps should remain minimal.

---

# Workflow Graphics

Arrow

Connector

Timeline

Process Line

Step Indicator

Pipeline

Data Flow

These support storytelling throughout the landing experience.

---

# Decorative Assets

Crop Rows

Field Lines

Grid Pattern

Gradient Shape

Wave Divider

Section Divider

Corner Accent

Minimal geometric elements only.

---

# Logo Assets

TrackFarmOps Mark

Horizontal Lockup

Vertical Lockup

Monochrome

Dark

Light

Icon Only

Favicon

---

# GSAP Compatibility

Every animated SVG should support:

Path drawing

Morphing

Opacity

Rotation

Scaling

Translation

Transform Origin

Path Length Animation

Avoid flattening editable paths.

---

# Performance Rules

Maximum file size

Icons

<5 KB

Documents

<20 KB

Illustrations

<60 KB

Maps

<80 KB

Optimize every SVG before commit.

---

# Accessibility

Decorative SVGs

aria-hidden="true"

Functional SVGs

Accessible title

Meaningful labels

Keyboard focus when interactive

---

# Export Rules

Export using:

SVG 1.1

Minified

Responsive

ViewBox preserved

No inline dimensions

No unnecessary metadata

---

# Versioning

Every SVG includes:

Asset ID

Version

Creator

Source

Scene Usage

Animation Timeline

Date Modified

---

# Asset Matrix

| Asset | Category | Scene | Animated |
|--------|----------|--------|-----------|
| Purchase Receipt | Documents | 2 | Yes |
| Fuel Log | Documents | 2 | Yes |
| Inventory Card | Documents | 2 | Yes |
| Rice Sack | Agriculture | 1,4 | Optional |
| Dashboard Widget | UI | 3 | Yes |
| Nigeria Map | Maps | 6 | Yes |
| Workflow Arrow | Workflow | 4 | Yes |
| CTA Divider | Decorative | 7 | No |

---

# SVG Checklist

Before approval verify:

✓ Clean geometry

✓ Consistent strokes

✓ Optimized paths

✓ Meaningful layer names

✓ Animation-ready

✓ Responsive

✓ Design Token colors

✓ Accessible where required

✓ Versioned

✓ Referenced in Asset Bible

---

# Final Principle

Every SVG should behave like a reusable software component rather than a static illustration.

If an SVG cannot be animated, reused, themed and maintained easily, it does not meet the TrackFarmOps production standard.