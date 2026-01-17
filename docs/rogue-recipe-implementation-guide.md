# Rogue Recipe: Implementation Guide

## Overview

This guide maps your existing CleanRecipe codebase to the new Rogue Recipe brand identity. The approach preserves your usability foundations (kitchen-ready sizing, accessible spacing) while adopting the minimalist visual language and restrained voice.

**Estimated effort:** 2-4 hours for color/typography, additional 1-2 hours for copy updates.

---

## Color Token Mapping

### Light Mode

| Token | Current (CleanRecipe) | New (Rogue Recipe) | Notes |
|-------|----------------------|-------------------|-------|
| `--color-primary` | `#5C7C5A` (Sage) | `#0D1B2A` (Deep Navy) | All primary actions |
| `--color-accent` | `#C4704E` (Terracotta) | `#0D1B2A` (Deep Navy) | Single accent color now |
| `--color-background` | `#FAF8F5` (Cream) | `#FAFAFA` (Paper) | Slightly cooler |
| `--color-surface` | `#FFFFFF` (White) | `#FFFFFF` (White) | No change |
| `--color-text-primary` | `#2D2D2D` (Charcoal) | `#1A1A1A` (Ink) | Slightly darker |
| `--color-text-secondary` | `#6B6B6B` (Stone) | `#6B6B6B` (Stone) | No change |
| `--color-border` | `#E8E5E0` (Mist) | `#E8E4E1` (Stone) | Nearly identical |

### Dark Mode

| Token | Current | New |
|-------|---------|-----|
| `--color-primary` | `#7A9E78` | `#4A6FA5` (Lighter navy) |
| `--color-accent` | `#D4896A` | `#4A6FA5` |
| `--color-background` | `#1A1A1A` | `#121212` |
| `--color-surface` | `#2A2A2A` | `#1E1E1E` |
| `--color-text-primary` | `#F5F5F5` | `#F5F5F5` |
| `--color-text-secondary` | `#A0A0A0` | `#A0A0A0` |
| `--color-border` | `#3A3A3A` | `#2E2E2E` |

### Semantic Colors

Keep your current semantic colors unchanged. They work well and serve a functional purpose separate from brand identity.

```css
/* No changes needed */
--color-success: #4A8C4A;
--color-warning: #D4A84A;
--color-error: #C45A5A;
--color-info: #5A8AC4;
```

---

## Typography Changes

### Font Stack

| Current | New |
|---------|-----|
| `'DM Sans', sans-serif` | `'Inter', -apple-system, sans-serif` |
| `'Fraunces', serif` | Remove entirely |

**Action:** Replace all instances of `--font-display` (Fraunces) with `--font-sans`. The brand no longer uses a display serif.

```css
/* Before */
--font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Fraunces', Georgia, serif;

/* After */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
/* Remove --font-display entirely */
```

### Type Scale

Keep your current sizes. They're optimized for kitchen readability. Only change the weights and font family.

| Element | Current | New |
|---------|---------|-----|
| Hero Title | 32px / Fraunces 600 | 32px / Inter 600 |
| Screen Title | 24px / Fraunces 600 | 24px / Inter 600 |
| Section Header | 18px / 600 | 18px / 500 |
| Body | 16px / 400 | 16px / 400 |
| Caption | 14px / 400 | 14px / 400 |
| Label | 12px / 500 | 12px / 500 (uppercase) |
| Button | 16px / 600 | 16px / 500 |

**Key change:** Section labels should now be uppercase with letter-spacing.

```css
.section-label {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}
```

### Kitchen Mode

Keep these sizes unchanged. Usability trumps brand consistency here.

---

## Spacing & Radius

### Spacing

No changes. Your current system is well-structured.

### Border Radius

Reduce slightly for a sharper feel.

| Token | Current | New |
|-------|---------|-----|
| `--radius-sm` | 8px | 6px |
| `--radius-md` | 12px | 8px |
| `--radius-lg` | 16px | 12px |
| `--radius-full` | 9999px | 9999px |

---

## Shadows

Reduce shadow intensity for a flatter, calmer appearance.

```css
/* Before */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);

/* After */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.03);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08);
```

---

## Component Updates

### Buttons

| Type | Current | New |
|------|---------|-----|
| Primary | Sage bg, white text | Navy bg, white text |
| Secondary | Transparent, sage border | Transparent, navy border |
| Accent | Terracotta bg | Remove. Use Primary instead. |

**Action:** Eliminate the accent button variant. One primary button color reinforces restraint.

### Recipe Card

- Remove Fraunces from title
- Reduce shadow
- Keep image radius

### Ingredient Checkbox

| Element | Current | New |
|---------|---------|-----|
| Checked accent | Terracotta | Navy |
| Checkmark | Terracotta | Navy |
| Strike-through | Keep | Keep |

### Input Fields

| Element | Current | New |
|---------|---------|-----|
| Background | Cream | Paper (`#FAFAFA`) |
| Border | Mist | Stone |
| Focus ring | Sage | Navy |

### Bottom Navigation

| State | Current | New |
|-------|---------|-----|
| Active | Sage icon + text | Navy icon + text |
| Inactive | Stone icon | Stone icon |

---

## Copy Rewrites

This is where the brand shift is most noticeable. Apply these principles:

1. Cut words in half
2. Remove enthusiasm
3. State facts only

### Global UI Elements

| Location | Current | New |
|----------|---------|-----|
| App tagline | "Just the recipe. Nothing else." | "Just the recipe." |
| Empty state (saved) | "No saved recipes yet. Start by pasting a URL above." | "No saved recipes." |
| Empty state (search) | "Search for recipes or paste a URL to get started!" | "Paste a URL to start." |
| Loading | "Extracting your recipe..." | "Extracting..." |
| Success toast | "Recipe saved successfully!" | "Saved." |
| Error toast | "We couldn't find a recipe at that URL." | "No recipe found." |
| Pull to refresh | "Pull to refresh" | Remove text entirely |

### Onboarding

| Screen | Current | New |
|--------|---------|-----|
| Welcome | "Welcome to CleanRecipe! We help you get straight to cooking." | "Rogue Recipe" (logo only) |
| Step 1 | "Paste any recipe URL and we'll extract just the good stuff." | "Paste a link. Get the recipe." |
| Step 2 | "Save your favorites for quick access anytime!" | "Save recipes for later." |
| Step 3 | "Start cooking with our clutter-free view!" | "Cook without distractions." |
| CTA | "Let's Get Cooking!" | "Start" |

### Recipe Detail Screen

| Element | Current | New |
|---------|---------|-----|
| Section label | "INGREDIENTS" | "INGREDIENTS" (no change) |
| Section label | "INSTRUCTIONS" | "STEPS" |
| Servings adjuster | "4 servings" | "Serves 4" |
| Start button | "🍳 Start Cooking" | "Cook" |
| Save button | "Save Recipe" | "Save" |
| Share button | "Share Recipe" | "Share" |

### Settings / Menu

| Item | Current | New |
|------|---------|-----|
| About | "About CleanRecipe" | "About" |
| Help | "Help & Support" | "Help" |
| Feedback | "Send Feedback" | "Feedback" |
| Rate | "Rate CleanRecipe" | "Rate" |

### Error States

| Scenario | Current | New |
|----------|---------|-----|
| No internet | "You're offline. Check your connection and try again." | "No connection." |
| Parse failed | "We couldn't extract a recipe from this page. Try a different URL." | "Couldn't extract recipe." |
| Invalid URL | "Please enter a valid URL." | "Invalid URL." |
| Server error | "Something went wrong. Please try again later." | "Something went wrong." |

---

## Icon Updates

Keep using Lucide React. No changes needed to the icon set—the rounded style works with both brands.

---

## Logo & App Icon

### New Requirements

**App Icon:** Geometric "R" with subtle fork tine integrated into the right leg. Single color (navy) on white background.

**Wordmark:** "Rogue Recipe" in Inter Medium, navy color.

**Action needed:** Commission or create new logo assets. The current leaf/spoon mark should be replaced entirely.

---

## What to Keep Unchanged

These elements are usability wins that transcend brand:

- Kitchen mode large text sizes
- 48px minimum tap targets
- Spacing system
- Semantic color meanings
- Accessibility standards
- Animation timings and easing
- Dynamic type support

---

## Updated CSS Variables

Replace your current root variables with:

```css
:root {
  /* Colors - Light */
  --color-primary: #0D1B2A;
  --color-background: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #6B6B6B;
  --color-border: #E8E4E1;
  
  /* Colors - Semantic (unchanged) */
  --color-success: #4A8C4A;
  --color-warning: #D4A84A;
  --color-error: #C45A5A;
  --color-info: #5A8AC4;
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Spacing (unchanged) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Radius (reduced) */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Shadows (softer) */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] {
  --color-primary: #4A6FA5;
  --color-background: #121212;
  --color-surface: #1E1E1E;
  --color-text-primary: #F5F5F5;
  --color-text-secondary: #A0A0A0;
  --color-border: #2E2E2E;
}
```

---

## Implementation Checklist

### Phase 1: Foundation (1 hour)
- [ ] Update CSS variables (colors, radius, shadows)
- [ ] Replace font family (DM Sans → Inter, remove Fraunces)
- [ ] Add Inter font to project

### Phase 2: Components (1-2 hours)
- [ ] Update button styles (remove accent variant)
- [ ] Update input focus states
- [ ] Update checkbox accent color
- [ ] Update navigation active states
- [ ] Reduce card shadows

### Phase 3: Copy (1-2 hours)
- [ ] Update all toast messages
- [ ] Update empty states
- [ ] Update button labels
- [ ] Update onboarding screens
- [ ] Update error messages

### Phase 4: Brand Assets (separate effort)
- [ ] Create new app icon
- [ ] Create new wordmark
- [ ] Update App Store screenshots
- [ ] Update splash screen

---

## Quick Reference Card

When in doubt, apply these rules:

| Principle | Action |
|-----------|--------|
| Two colors? | Use one (navy). |
| Three words? | Use two. |
| Exclamation point? | Remove it. |
| Emoji in UI? | Remove it. |
| "Successfully"? | Delete the word. |
| Serif font? | Replace with sans. |
| Heavy shadow? | Reduce by half. |
