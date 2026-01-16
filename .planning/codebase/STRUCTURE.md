# Directory Structure - Julienned (Rogue Recipe)

## Directory Layout

```
julienned/
├── App.tsx                          # Main entry point, providers setup
├── app.json                         # Expo configuration
├── babel.config.js                  # Babel config with path aliases
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
├── .env.example                     # Environment variable template
│
├── src/                             # React Native frontend source
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # Design system primitives
│   │   │   └── index.tsx            # All base components exported
│   │   ├── RecipeCard.tsx           # Recipe grid card
│   │   ├── URLInput.tsx             # URL input with validation
│   │   ├── IngredientItem.tsx       # Ingredient list item
│   │   ├── ServingsAdjuster.tsx     # Servings ± control
│   │   ├── ConfirmModal.tsx         # Confirmation dialog
│   │   ├── OfflineIndicator.tsx     # Offline badge component
│   │   ├── AppIcon.tsx              # App icon component
│   │   └── JuliennedIcon.tsx        # Logo icon
│   │
│   ├── screens/                     # Full-page screen components
│   │   ├── ExtractScreen.tsx        # URL input / extract tab
│   │   ├── ExtractingScreen.tsx     # Extraction progress modal
│   │   ├── RecipesScreen.tsx        # Recipe library grid
│   │   ├── RecipeDetailScreen.tsx   # Single recipe view
│   │   ├── RecipePickerScreen.tsx   # Recipe selection modal
│   │   ├── MealPlannerScreen.tsx    # Weekly meal planner
│   │   ├── ShoppingListScreen.tsx   # Shopping list view
│   │   ├── CookingModeScreen.tsx    # Distraction-free cooking
│   │   └── SettingsScreen.tsx       # App settings
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useTheme.tsx             # Theme context and hooks
│   │   ├── useOfflineRecipes.ts     # Offline-aware recipe fetching
│   │   ├── useNetworkStatus.ts      # Network connectivity
│   │   ├── useTabBarVisibility.tsx  # Scroll-aware tab hiding
│   │   └── useHaptics.ts            # Haptic feedback
│   │
│   ├── context/                     # React Context providers
│   │   └── OfflineContext.tsx       # Offline state and cache ops
│   │
│   ├── services/                    # External service integrations
│   │   └── offlineStorage.ts        # SQLite cache operations
│   │
│   ├── styles/                      # Design system tokens
│   │   └── theme.ts                 # Colors, typography, spacing
│   │
│   ├── navigation/                  # React Navigation config
│   │   └── index.tsx                # Navigator setup & types
│   │
│   └── utils/                       # Utility functions
│       ├── animations.ts            # Animation timing/easing
│       ├── textUtils.ts             # Text formatting
│       └── dateUtils.ts             # Date formatting
│
├── convex/                          # Convex serverless backend
│   ├── _generated/                  # Auto-generated Convex types
│   │   ├── api.d.ts                 # API type definitions
│   │   ├── dataModel.d.ts           # Data model types
│   │   └── server.d.ts              # Server utilities
│   │
│   ├── lib/                         # Backend library code
│   │   ├── types.ts                 # Shared TypeScript types
│   │   ├── utils.ts                 # URL normalization, hashing
│   │   ├── llmTools.ts              # Claude tool definitions
│   │   └── toolHandlers.ts          # Tool implementation logic
│   │
│   ├── schema.ts                    # Database schema definition
│   ├── recipes.ts                   # Recipe queries & mutations
│   ├── extraction.ts                # LLM extraction action
│   ├── users.ts                     # User management
│   ├── mealPlans.ts                 # Meal planning operations
│   └── shoppingLists.ts             # Shopping list operations
│
├── assets/                          # Static assets
│   ├── android/                     # Android app icons (mipmap-*)
│   └── ios/                         # iOS app icons
│
├── scripts/                         # Build/utility scripts
├── docs/                            # Documentation
│   └── wireframes/                  # Design wireframes
│
├── skills/                          # Claude Code skills
├── .claude/                         # Claude Code config
├── .expo/                           # Expo cache (gitignored)
├── .maestro/                        # E2E test flows
│   └── flows/                       # Test flow definitions
│
└── .planning/                       # Planning documentation
    └── codebase/                    # Architecture docs
        ├── ARCHITECTURE.md          # This file
        └── STRUCTURE.md             # Directory structure
```

---

## Directory Purposes

| Directory | Purpose |
|-----------|---------|
| `src/` | React Native frontend application code |
| `src/components/` | Reusable UI components (feature-specific) |
| `src/components/ui/` | Design system primitives (Button, Input, Card, etc.) |
| `src/screens/` | Full-page screen components (one per route) |
| `src/hooks/` | Custom React hooks for shared logic |
| `src/context/` | React Context providers for app-wide state |
| `src/services/` | External service integrations (SQLite, etc.) |
| `src/styles/` | Design tokens (colors, typography, spacing) |
| `src/navigation/` | React Navigation configuration |
| `src/utils/` | Pure utility functions |
| `convex/` | Convex serverless backend (cloud-deployed) |
| `convex/_generated/` | Auto-generated Convex types (do not edit) |
| `convex/lib/` | Backend library code (types, utils, tools) |
| `assets/` | Static assets (icons, images) |
| `.planning/` | Architecture and planning documentation |

---

## Key File Locations

### Entry Points
| File | Purpose |
|------|---------|
| `App.tsx` | Application entry, provider setup |
| `src/navigation/index.tsx` | Navigation structure |
| `convex/schema.ts` | Database schema |

### Design System
| File | Purpose |
|------|---------|
| `src/styles/theme.ts` | All design tokens (colors, fonts, spacing) |
| `src/components/ui/index.tsx` | Base UI components |
| `src/hooks/useTheme.tsx` | Theme provider and hooks |

### Data Layer
| File | Purpose |
|------|---------|
| `convex/recipes.ts` | Recipe CRUD operations |
| `convex/extraction.ts` | LLM extraction orchestration |
| `src/services/offlineStorage.ts` | SQLite cache operations |
| `src/hooks/useOfflineRecipes.ts` | Offline-aware data fetching |

### LLM Integration
| File | Purpose |
|------|---------|
| `convex/lib/llmTools.ts` | Tool definitions + system prompt |
| `convex/lib/toolHandlers.ts` | Tool implementation logic |
| `convex/extraction.ts` | LLM orchestration loop |

### Configuration
| File | Purpose |
|------|---------|
| `babel.config.js` | Path aliases (@/, @components, etc.) |
| `tsconfig.json` | TypeScript settings + path mapping |
| `app.json` | Expo app configuration |
| `.env.example` | Environment variable template |

---

## Naming Conventions

### Files
| Type | Convention | Example |
|------|------------|---------|
| Screens | `PascalCaseScreen.tsx` | `RecipeDetailScreen.tsx` |
| Components | `PascalCase.tsx` | `RecipeCard.tsx` |
| Hooks | `useCamelCase.ts(x)` | `useTheme.tsx` |
| Contexts | `PascalCaseContext.tsx` | `OfflineContext.tsx` |
| Services | `camelCase.ts` | `offlineStorage.ts` |
| Utils | `camelCase.ts` | `dateUtils.ts` |
| Convex modules | `camelCase.ts` | `recipes.ts` |

### Components
| Type | Convention | Example |
|------|------------|---------|
| Function components | `export function Name()` | `export function RecipeCard()` |
| Props interface | `NameProps` | `RecipeCardProps` |
| Style objects | `const styles = StyleSheet.create()` | At bottom of file |

### Convex Functions
| Type | Convention | Example |
|------|------------|---------|
| Queries | `export const name = query()` | `export const list = query()` |
| Mutations | `export const name = mutation()` | `export const remove = mutation()` |
| Actions | `export const name = action()` | `export const extractRecipe = action()` |
| Internal | `export const nameInternal = internalQuery()` | `export const getByIdInternal = internalQuery()` |

---

## Where to Add New Code

### New Screen
1. Create `src/screens/NewScreen.tsx`
2. Add to `src/navigation/index.tsx`:
   - Add to type definitions (`RootStackParamList` or `TabParamList`)
   - Add `<Stack.Screen>` or `<Tab.Screen>`
3. Import screen in navigation file

### New Reusable Component
1. If design system primitive: Add to `src/components/ui/index.tsx`
2. If feature component: Create `src/components/NewComponent.tsx`
3. Use `useColors()` for theming

### New Custom Hook
1. Create `src/hooks/useNewHook.ts(x)`
2. Export from the hook file
3. If provides context, create matching provider

### New Convex Function
1. Add to appropriate module (`convex/recipes.ts`, etc.)
2. For new table: Update `convex/schema.ts`
3. Types go in `convex/lib/types.ts`

### New Extraction Tool
1. Add tool definition to `convex/lib/llmTools.ts`
2. Add handler in `convex/lib/toolHandlers.ts`
3. Add case in `executeToolCall()` in `convex/extraction.ts`

### New Design Token
1. Add to `src/styles/theme.ts`
2. If theme-specific, add to both `lightTheme` and `darkTheme`

---

## Special Directories

### `convex/_generated/`
- **Auto-generated by Convex CLI**
- Do NOT edit manually
- Regenerated on `npx convex dev` or schema changes
- Contains type definitions for API, data model

### `assets/android/` and `assets/ios/`
- App icons in platform-specific formats
- Android: mipmap-{hdpi,mdpi,xhdpi,xxhdpi,xxxhdpi}
- iOS: Standard iOS icon set

### `.expo/`
- Expo build cache
- Gitignored
- Safe to delete for clean rebuild

### `.maestro/`
- E2E testing with Maestro
- Test flows in YAML format
- `flows/` contains individual test scenarios

---

## Path Aliases

Configured in `babel.config.js` and `tsconfig.json`:

| Alias | Resolves To | Example Usage |
|-------|-------------|---------------|
| `@/*` | `src/*` | `import { theme } from '@/styles/theme'` |
| `@components/*` | `src/components/*` | `import { RecipeCard } from '@components/RecipeCard'` |
| `@screens/*` | `src/screens/*` | `import { RecipesScreen } from '@screens/RecipesScreen'` |
| `@hooks/*` | `src/hooks/*` | `import { useTheme } from '@hooks/useTheme'` |
| `@styles/*` | `src/styles/*` | `import { colors } from '@styles/theme'` |

Note: Currently codebase uses relative imports; aliases are available but not consistently used.

---

## Import Patterns

### Frontend Components
```typescript
// Convex integration
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Doc, Id } from '../../convex/_generated/dataModel';

// Navigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

// Design system
import { useColors, useTheme } from '../hooks/useTheme';
import { spacing, typography, borderRadius } from '../styles/theme';
import { Button, Card, ScreenTitle } from '../components/ui';

// Icons
import { IconName } from 'lucide-react-native';
```

### Convex Backend
```typescript
// Server utilities
import { v } from "convex/values";
import { query, mutation, action, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Local library
import { hashUrl } from "./lib/utils";
import { EXTRACTION_TOOLS } from "./lib/llmTools";
```
