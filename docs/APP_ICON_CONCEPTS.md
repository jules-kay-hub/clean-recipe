# CleanRecipe App Icon Concepts

Based on the brand guide's direction: "Stylized leaf/spoon combination" representing fresh, clean cooking.

---

## Recommended Concept: Leaf-Spoon Fusion

### Description
A sage green leaf shape where the stem subtly forms the handle of a spoon. The leaf's natural curve creates the spoon bowl. Simple, recognizable at all sizes, and communicates "clean/fresh cooking" instantly.

### Design Specifications

**Primary Icon (1024x1024 for app stores)**
```
┌─────────────────────────────┐
│                             │
│         ╭───────╮           │
│        ╱  leaf   ╲          │
│       │   shape   │         │
│       │  (spoon   │         │
│       │   bowl)   │         │
│        ╲         ╱          │
│         ╲       ╱           │
│          │stem │            │  ← Spoon handle
│          │     │            │
│          ╰─────╯            │
│                             │
└─────────────────────────────┘
```

**Colors**
- Background: Cream `#FAF8F5` (or transparent for iOS)
- Icon: Sage `#5C7C5A`
- Optional accent: Terracotta `#C4704E` (small dot or detail)

**Sizing Guidelines**
| Platform | Size | Notes |
|----------|------|-------|
| iOS App Store | 1024x1024 | No transparency |
| iOS App Icon | 180x180 (@3x) | With transparency |
| Android Play Store | 512x512 | 32px padding |
| Android Adaptive | 108x108 dp | Safe zone: 66x66 dp |
| Favicon | 32x32, 16x16 | Simplified version |

---

## Alternative Concepts

### Concept B: Clean Plate with Leaf
A minimalist circular plate with a single leaf accent at 2 o'clock position.
- Represents: Clean eating, simplicity
- Risk: May look too generic

### Concept C: Open Cookbook with Leaf Bookmark
A stylized open book shape with a leaf serving as a bookmark.
- Represents: Recipes without clutter
- Risk: May be too detailed for small sizes

### Concept D: Fork-Leaf Hybrid
A fork where one tine transforms into a leaf.
- Represents: Fresh ingredients meet cooking
- Risk: Similar to many food apps

---

## SVG Implementation (Leaf-Spoon)

### Simple Version (for favicon/small sizes)
```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle (optional) -->
  <circle cx="50" cy="50" r="48" fill="#FAF8F5"/>

  <!-- Leaf-spoon shape -->
  <path d="M50 15
           C70 15, 85 35, 85 55
           C85 70, 70 80, 55 80
           L55 90
           C55 92, 53 94, 50 94
           C47 94, 45 92, 45 90
           L45 80
           C30 80, 15 70, 15 55
           C15 35, 30 15, 50 15 Z"
        fill="#5C7C5A"/>

  <!-- Leaf vein (optional detail) -->
  <path d="M50 25 L50 70"
        stroke="#4A6548"
        stroke-width="2"
        fill="none"/>
</svg>
```

### Detailed Version (for app icon)
```svg
<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" rx="224" fill="#FAF8F5"/>

  <!-- Shadow (subtle) -->
  <ellipse cx="520" cy="850" rx="200" ry="30" fill="rgba(0,0,0,0.08)"/>

  <!-- Leaf-spoon main shape -->
  <path d="M512 120
           C680 120, 820 280, 820 480
           C820 640, 680 760, 560 760
           L560 880
           C560 905, 540 920, 512 920
           C484 920, 464 905, 464 880
           L464 760
           C344 760, 204 640, 204 480
           C204 280, 344 120, 512 120 Z"
        fill="#5C7C5A"/>

  <!-- Leaf center vein -->
  <path d="M512 200
           C512 200, 512 650, 512 650"
        stroke="#4A6548"
        stroke-width="16"
        stroke-linecap="round"
        fill="none"/>

  <!-- Side veins -->
  <path d="M512 300 C580 340, 620 400, 640 450"
        stroke="#4A6548"
        stroke-width="8"
        stroke-linecap="round"
        fill="none"/>
  <path d="M512 300 C444 340, 404 400, 384 450"
        stroke="#4A6548"
        stroke-width="8"
        stroke-linecap="round"
        fill="none"/>
  <path d="M512 450 C560 480, 590 520, 610 560"
        stroke="#4A6548"
        stroke-width="8"
        stroke-linecap="round"
        fill="none"/>
  <path d="M512 450 C464 480, 434 520, 414 560"
        stroke="#4A6548"
        stroke-width="8"
        stroke-linecap="round"
        fill="none"/>

  <!-- Terracotta accent dot (optional) -->
  <circle cx="512" cy="200" r="24" fill="#C4704E"/>
</svg>
```

---

## Dark Mode Variant

For dark backgrounds (notification icons, dark mode splash):
- Swap sage `#5C7C5A` → sage light `#7A9E78`
- Background: Deep charcoal `#1A1A1A` or transparent

---

## Monochrome Version

For single-color contexts (loading states, watermarks):
- Use sage `#5C7C5A` on transparent
- Or white `#FFFFFF` on colored backgrounds

---

## Implementation Checklist

- [ ] Create 1024x1024 master icon in vector format (Figma/Illustrator)
- [ ] Export iOS sizes: 180x180, 120x120, 87x87, 80x80, 60x60, 58x58, 40x40, 29x29
- [ ] Export Android adaptive icon (foreground + background layers)
- [ ] Create favicon.ico (16x16, 32x32, 48x48)
- [ ] Create web app manifest icons (192x192, 512x512)
- [ ] Create splash screen variants

---

## File Placement

```
assets/
├── icon.png                 # 1024x1024 master
├── adaptive-icon.png        # Android foreground (with padding)
├── splash.png              # Splash screen
├── favicon.ico             # Web favicon
└── icons/
    ├── ios/
    │   ├── icon-20@2x.png
    │   ├── icon-20@3x.png
    │   └── ... (all iOS sizes)
    └── android/
        ├── mipmap-mdpi/
        ├── mipmap-hdpi/
        └── ... (all densities)
```

---

## Quick Start

To use these SVGs immediately:
1. Copy the SVG code above
2. Save as `icon.svg`
3. Use a tool like [realfavicongenerator.net](https://realfavicongenerator.net/) to generate all sizes
4. Or open in Figma/Illustrator to refine and export

For professional refinement, share this document with a designer along with the brand guide.
