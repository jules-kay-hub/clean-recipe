# CleanRecipe Brand & Theme

A warm, approachable theme designed for busy home cooks who want clarity in the kitchen.

## Brand Personality

**Voice:** Helpful neighbor, not corporate chef
**Feeling:** Like opening a well-organized recipe box from your grandmother
**Promise:** "Just the recipe. Nothing else."

## Target Users

- **Hannah** (25-45): Home cook, cooks 4-5x/week, frustrated by recipe site clutter
- **Pat** (30-50): Busy parent, meal preps weekly, needs quick access while managing chaos

## Design Principles

1. **Clarity First** - Large text, high contrast, no visual noise
2. **Kitchen-Ready** - Works with messy hands, bright lights, quick glances
3. **Calm Confidence** - Warm colors that don't overwhelm
4. **Instant Access** - One-tap to what you need

---

## Color Palette

### Light Mode (Primary)

| Color | Hex | Usage |
|-------|-----|-------|
| **Sage** | `#5C7C5A` | Primary actions, headers |
| **Terracotta** | `#C4704E` | Accents, highlights, active states |
| **Cream** | `#FAF8F5` | Background |
| **Warm White** | `#FFFFFF` | Cards, surfaces |
| **Charcoal** | `#2D2D2D` | Primary text |
| **Stone** | `#6B6B6B` | Secondary text |
| **Mist** | `#E8E5E0` | Borders, dividers |

### Dark Mode (Kitchen Night Mode)

| Color | Hex | Usage |
|-------|-----|-------|
| **Sage Light** | `#7A9E78` | Primary actions |
| **Terracotta Light** | `#D4896A` | Accents |
| **Deep Charcoal** | `#1A1A1A` | Background |
| **Dark Surface** | `#2A2A2A` | Cards |
| **Off White** | `#F5F5F5` | Primary text |
| **Warm Gray** | `#A0A0A0` | Secondary text |
| **Dark Border** | `#3A3A3A` | Dividers |

### Semantic Colors

| Purpose | Light | Dark |
|---------|-------|------|
| Success | `#4A8C4A` | `#6AAF6A` |
| Warning | `#D4A84A` | `#E4C06A` |
| Error | `#C45A5A` | `#D47A7A` |
| Info | `#5A8AC4` | `#7AAAE4` |

---

## Typography

### Font Stack

```css
/* Primary - Clean, modern, highly readable */
--font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

/* Display - For hero titles, brand moments */
--font-display: 'Fraunces', Georgia, serif;
```

**Why these fonts:**
- **DM Sans**: Excellent readability at small sizes, friendly without being childish
- **Fraunces**: Warm, organic curves that feel hand-crafted, perfect for recipe titles

### Type Scale (Mobile)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero Title | 32px | 600 (Fraunces) | 1.2 |
| Screen Title | 24px | 600 | 1.3 |
| Section Header | 18px | 600 | 1.4 |
| Body | 16px | 400 | 1.5 |
| Body Large | 18px | 400 | 1.5 |
| Caption | 14px | 400 | 1.4 |
| Label | 12px | 500 | 1.3 |
| Button | 16px | 600 | 1 |

### Kitchen Mode (Cooking Screen)

When actively cooking, increase sizes for glanceability:
- Instructions: 20px
- Ingredients: 18px
- Step numbers: 24px bold

---

## Spacing System

Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight internal spacing |
| `sm` | 8px | Between related elements |
| `md` | 16px | Standard padding |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Major section breaks |
| `2xl` | 48px | Screen padding top/bottom |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 8px | Buttons, inputs |
| `md` | 12px | Cards, modals |
| `lg` | 16px | Large cards, images |
| `full` | 9999px | Pills, avatars |

---

## Shadows

```css
/* Light mode */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

/* Dark mode - subtle glow instead */
--shadow-sm-dark: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md-dark: 0 4px 12px rgba(0, 0, 0, 0.4);
```

---

## Component Patterns

### Recipe Card
- White/dark surface with md radius
- Hero image with lg radius (top only)
- Title in display font (Fraunces)
- Meta info (time, servings) in caption size
- Subtle shadow on light mode

### Buttons
- Primary: Sage background, white text
- Secondary: Transparent, sage text, sage border
- Accent: Terracotta background (for key actions like "Start Cooking")
- Full-width on mobile for easy thumb access

### Ingredient List
- Checkbox with terracotta accent when checked
- Quantity in semi-bold
- Large tap targets (48px min height)
- Strike-through when checked

### Input Fields
- Cream/dark surface background
- Mist/dark border
- Sage focus ring
- 48px height for thumb-friendly input

### Bottom Navigation
- 4 items max
- Active: Sage icon + text
- Inactive: Stone/warm gray icon only
- 60px height with safe area

---

## Iconography

**Style:** Rounded, 2px stroke weight, friendly
**Library Recommendation:** Lucide React (matches aesthetic)
**Key Icons:**
- Home: `home`
- Search: `search`
- Add Recipe: `plus-circle`
- Meal Plan: `calendar`
- Shopping List: `shopping-cart`
- Timer: `clock`
- Servings: `users`
- Checkmark: `check`

---

## Animation

**Principles:**
- Subtle, purposeful motion
- Never delay the user
- Confirm actions visually

**Timings:**
- Quick feedback: 150ms
- Standard transitions: 250ms
- Page transitions: 300ms

**Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)

**Key Animations:**
- Recipe card press: Scale to 0.98
- Checkbox: Bounce + color fill
- Screen transitions: Slide + fade
- Pull to refresh: Smooth spring
- Save confirmation: Checkmark draw

---

## Accessibility

- Minimum touch target: 44x44px (48x48 preferred)
- Color contrast: WCAG AA minimum (4.5:1 text, 3:1 UI)
- Support for Dynamic Type (iOS) / Font Scaling (Android)
- Screen reader labels on all interactive elements
- Reduce motion option respects system setting

---

## Logo Usage

**Primary Mark:** Stylized leaf/spoon combination
**Wordmark:** "CleanRecipe" in Fraunces, sage color
**Favicon:** Leaf icon in sage on cream

**Clear Space:** Minimum 8px around mark
**Minimum Size:** 24px height

---

## Example Applications

### Recipe Detail Screen
```
┌─────────────────────────────┐
│ [Hero Image - lg radius]    │
├─────────────────────────────┤
│ Creamy Tuscan Chicken       │ ← Fraunces 24px
│ ⏱ 45 min · 👤 4 servings    │ ← DM Sans 14px stone
├─────────────────────────────┤
│ [─ 4 servings +]            │ ← Terracotta accent
├─────────────────────────────┤
│ INGREDIENTS                 │ ← DM Sans 12px sage
│ ☐ 2 lbs chicken thighs     │
│ ☐ 1 cup sun-dried tomatoes │
│ ☐ 2 cups spinach           │
├─────────────────────────────┤
│ [🍳 Start Cooking]          │ ← Terracotta button
└─────────────────────────────┘
```

---

## File Exports

When implementing, reference these CSS custom properties:

```css
:root {
  /* Colors - Light */
  --color-sage: #5C7C5A;
  --color-terracotta: #C4704E;
  --color-cream: #FAF8F5;
  --color-white: #FFFFFF;
  --color-charcoal: #2D2D2D;
  --color-stone: #6B6B6B;
  --color-mist: #E8E5E0;
  
  /* Typography */
  --font-sans: 'DM Sans', sans-serif;
  --font-display: 'Fraunces', serif;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}
```
