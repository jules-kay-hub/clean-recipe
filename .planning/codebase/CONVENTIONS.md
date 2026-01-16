# Code Conventions

This document describes the coding conventions and patterns used in the Rogue Recipe / Julienned codebase.

## Naming Patterns

### Files

- **Components**: PascalCase with `.tsx` extension (e.g., `RecipeCard.tsx`, `ServingsAdjuster.tsx`)
- **Screens**: PascalCase ending with `Screen` (e.g., `RecipeDetailScreen.tsx`, `CookingModeScreen.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useTheme.tsx`, `useOfflineRecipes.ts`)
- **Utilities**: camelCase with `.ts` extension (e.g., `dateUtils.ts`, `textUtils.ts`)
- **Backend/Convex**: camelCase for modules (e.g., `recipes.ts`, `mealPlans.ts`)
- **Types**: Located in `lib/types.ts` with descriptive names

### Functions

- **Components**: PascalCase function names matching file name
  ```typescript
  export function RecipeCard({ ... }: RecipeCardProps) { ... }
  ```
- **Hooks**: camelCase starting with `use`
  ```typescript
  export function useTheme() { ... }
  export function useColors() { ... }
  ```
- **Utilities**: camelCase, verb-first for actions
  ```typescript
  export function formatDuration(totalMinutes: number): string { ... }
  export function extractPassiveTime(instructions?: string[]): number { ... }
  export function hashUrl(url: string): string { ... }
  ```
- **Convex queries/mutations**: camelCase, descriptive
  ```typescript
  export const list = query({ ... });
  export const getById = query({ ... });
  export const saveRecipe = internalMutation({ ... });
  ```

### Variables

- **State**: camelCase, boolean prefixed with `is`/`has`
  ```typescript
  const [servings, setServings] = useState(4);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const hasPassiveTime = passiveTime > 0;
  ```
- **Constants**: UPPER_SNAKE_CASE for config objects
  ```typescript
  const TRACKING_PARAMS = [...];
  const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = { ... };
  const SITE_CONFIGS: Record<string, SiteConfig> = { ... };
  ```

### Types and Interfaces

- **Interfaces**: PascalCase, suffixed with `Props` for component props
  ```typescript
  interface RecipeCardProps { ... }
  interface ThemeContextType { ... }
  interface SiteConfig { ... }
  ```
- **Type exports**: PascalCase
  ```typescript
  export type ThemeColors = Theme['colors'];
  export type IngredientCategory = 'produce' | 'meat_seafood' | ...;
  ```

## Code Style

### Formatting

- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings, double for JSX attributes
- **Trailing commas**: Used in multi-line objects/arrays
- **Line length**: No strict limit, but readability preferred

### Linting

Configuration in `eslint.config.mjs`:

- TypeScript rules via `@typescript-eslint`
- React and React Hooks rules enabled
- React Native specific rules
- Key settings:
  - `@typescript-eslint/no-unused-vars`: warn (underscore prefix ignored)
  - `@typescript-eslint/no-explicit-any`: warn
  - `react-hooks/rules-of-hooks`: error
  - `react-hooks/exhaustive-deps`: warn
  - `prefer-const`: warn
  - `no-var`: error

## Import Organization

### Order (by convention, not enforced)

1. React and React Native core
2. External packages (expo, navigation, convex)
3. Internal generated files (`../../convex/_generated/api`)
4. Local navigation/types
5. Hooks
6. Styles/theme
7. Utils
8. Components

### Example from `RecipeDetailScreen.tsx`

```typescript
import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, ... } from 'react-native';
import { Image } from 'expo-image';
import { useMutation } from 'convex/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Clock, ... } from 'lucide-react-native';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { RootStackParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { spacing, typography, shadows, borderRadius } from '../styles/theme';
import { formatRelativeTime, formatDuration, ... } from '../utils/dateUtils';
import { HeroTitle, SectionHeader, ... } from '../components/ui';
import { IngredientItem } from '../components/IngredientItem';
```

### Path Aliases

Configured in `tsconfig.json` and `babel.config.js`:

- `@/*` -> `src/*`
- `@components/*` -> `src/components/*`
- `@screens/*` -> `src/screens/*`
- `@hooks/*` -> `src/hooks/*`
- `@styles/*` -> `src/styles/*`

## Error Handling

### Frontend (React Native)

- Try-catch with console.error for async operations
- Graceful fallbacks for missing data
  ```typescript
  try {
    await addToShoppingList({ ... });
    setAddedToList(true);
  } catch (error) {
    console.error('Failed to add to shopping list:', error);
  }
  ```

### Backend (Convex)

- Explicit error throwing with descriptive messages
- Type-safe validation via Convex validators
  ```typescript
  if (!recipe) throw new Error("Recipe not found");
  if (!user || recipe.userId !== user._id) {
    throw new Error("Not authorized");
  }
  ```

### URL Parsing

- Try-catch wrapping with fallback returns
  ```typescript
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
  ```

## Logging

- `console.error` for error conditions
- `console.log` allowed (not blocked by ESLint) for debugging
- No structured logging framework in use

## Comments

### File Headers

Every file starts with a descriptive comment:
```typescript
// src/components/RecipeCard.tsx
// Recipe card component for the home screen grid
```

### Section Dividers (Convex)

Visual separators for major sections:
```typescript
// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC QUERIES
// ═══════════════════════════════════════════════════════════════════════════
```

### JSDoc for Utilities

Public utility functions use JSDoc:
```typescript
/**
 * Format a duration in minutes to a human-readable string
 * e.g., 90 -> "1h 30m", 1500 -> "1d 1h", 45 -> "45m"
 */
export function formatDuration(totalMinutes: number): string { ... }
```

### Inline Comments

Used for explaining non-obvious logic:
```typescript
// Only show minutes if no days (keep it concise)
// Account for status bar
// Filter out undefined values
```

## Function Design

### React Components

- Named function exports (not arrow functions)
- Props interface defined before component
- Hooks called at top
- Derived state computed via useMemo when appropriate
- Event handlers defined as inner functions
- StyleSheet.create at bottom of file

```typescript
interface RecipeCardProps {
  id: string;
  title: string;
  onPress: (id: string) => void;
}

export function RecipeCard({ id, title, onPress }: RecipeCardProps) {
  const colors = useColors();

  // Computed values
  const formattedTime = formatDuration(totalTime);

  // Event handlers
  const handlePress = () => onPress(id);

  return (
    <Pressable onPress={handlePress}>
      ...
    </Pressable>
  );
}

const styles = StyleSheet.create({ ... });
```

### Utility Functions

- Pure functions preferred
- Single responsibility
- TypeScript types for parameters and returns
- Default parameters where sensible

### Convex Functions

- Explicit args validation with `v` validators
- Handler receives validated args
- Internal vs public distinction (internal prefix for server-only)

```typescript
export const getById = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});
```

## Module Design

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Base design system components
├── screens/            # Full-page components
├── hooks/              # Custom React hooks
├── styles/             # Theme tokens and design system
├── utils/              # Pure utility functions
├── context/            # React contexts
├── navigation/         # Navigation configuration
└── services/           # External service integrations

convex/
├── schema.ts           # Database schema definition
├── recipes.ts          # Recipe domain logic
├── mealPlans.ts        # Meal planning domain
├── extraction.ts       # LLM orchestration
└── lib/
    ├── types.ts        # Shared TypeScript types
    ├── utils.ts        # Backend utilities
    ├── llmTools.ts     # LLM tool definitions
    └── toolHandlers.ts # Tool implementations
```

### Exports

- Named exports for everything (no default exports)
- Index files for component directories (`components/ui/index.tsx`)
- Re-exports for convenience

### Design System

Theme tokens centralized in `src/styles/theme.ts`:
- `colors` - Color palette (light/dark)
- `typography` - Font families, sizes, line heights
- `spacing` - Spacing scale (xs through 3xl)
- `borderRadius` - Border radius scale
- `shadows` - Shadow presets (sm, md, lg)
- `animation` - Timing and easing values
- `touchTargets` - Minimum touch target sizes

Components use theme via hooks:
```typescript
const colors = useColors();
const { isDark } = useTheme();
```

### Styling Approach

- React Native StyleSheet for static styles
- Dynamic styles via style arrays with theme values
- Shadows from theme presets
- No inline styles for static values

```typescript
<View style={[
  styles.container,
  { backgroundColor: colors.cardBackground },
  shadows.md,
]}>
```
