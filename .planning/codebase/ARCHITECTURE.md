# Architecture Overview - Julienned (Rogue Recipe)

## Pattern Overview

**Architecture Pattern:** Client-Server with Serverless Backend
**Frontend Pattern:** Provider-based Context Architecture with React Navigation
**Backend Pattern:** LLM-Orchestrated Tool Use with Cache-First Strategy

Julienned follows a **mobile-first, cache-first architecture** where:
1. A React Native + Expo frontend handles UI and local offline storage
2. Convex provides real-time serverless backend with database
3. Claude LLM orchestrates recipe extraction through tool use
4. SQLite provides offline-first caching on native platforms

---

## Layers

### 1. Presentation Layer (React Native UI)

| Aspect | Details |
|--------|---------|
| **Purpose** | User interface, navigation, user interactions |
| **Location** | `src/screens/`, `src/components/`, `src/components/ui/` |
| **Contains** | Screens, reusable components, design system primitives |
| **Dependencies** | React Navigation, Lucide icons, Expo modules |

**Key Components:**
- `src/screens/` - Full-page views (RecipesScreen, RecipeDetailScreen, etc.)
- `src/components/` - Feature components (RecipeCard, URLInput, ConfirmModal)
- `src/components/ui/index.tsx` - Design system primitives (Button, Input, Card, Badge, etc.)

---

### 2. State Management Layer (Contexts + Hooks)

| Aspect | Details |
|--------|---------|
| **Purpose** | Application state, theme, offline status, tab visibility |
| **Location** | `src/hooks/`, `src/context/` |
| **Contains** | React contexts, custom hooks, state providers |
| **Dependencies** | React Context API, Convex React hooks |

**Providers (wrapping order in `App.tsx`):**
1. `ConvexProvider` - Real-time database connection
2. `ThemeProvider` - Light/dark theme with system detection
3. `OfflineProvider` - Network status and SQLite cache operations

**Key Hooks:**
- `src/hooks/useTheme.tsx` - Theme context with `useColors()` convenience hook
- `src/hooks/useOfflineRecipes.ts` - Offline-aware recipe fetching
- `src/hooks/useNetworkStatus.ts` - Network connectivity monitoring
- `src/hooks/useTabBarVisibility.tsx` - Scroll-aware tab bar hiding
- `src/hooks/useHaptics.ts` - Haptic feedback abstraction

---

### 3. Navigation Layer

| Aspect | Details |
|--------|---------|
| **Purpose** | Screen routing, tab navigation, modal presentation |
| **Location** | `src/navigation/index.tsx` |
| **Contains** | Stack navigator, bottom tab navigator, type definitions |
| **Dependencies** | React Navigation (native-stack, bottom-tabs) |

**Navigation Structure:**
```
RootNavigator (Stack)
├── MainTabs (Tab Navigator)
│   ├── Extract
│   ├── Recipes
│   ├── MealPlanner
│   ├── ShoppingList
│   └── Settings
├── RecipeDetail (card presentation)
├── Extracting (modal)
├── RecipePicker (modal)
└── CookingMode (fullScreenModal)
```

**Type Definitions:**
- `RootStackParamList` - Stack screen params
- `TabParamList` - Tab screen params

---

### 4. Services Layer (Local Storage)

| Aspect | Details |
|--------|---------|
| **Purpose** | Offline data persistence, SQLite operations |
| **Location** | `src/services/offlineStorage.ts` |
| **Contains** | Database initialization, CRUD operations, cache management |
| **Dependencies** | expo-sqlite (native only) |

**Key Operations:**
- `initDatabase()` - Initialize SQLite schema
- `cacheRecipe()` / `cacheRecipes()` - Store recipes locally
- `getCachedRecipes()` / `getCachedRecipe()` - Retrieve from cache
- `removeCachedRecipe()` / `clearCache()` - Cache cleanup

---

### 5. Convex Backend Layer

| Aspect | Details |
|--------|---------|
| **Purpose** | Database, real-time sync, serverless functions, LLM orchestration |
| **Location** | `convex/` |
| **Contains** | Schema, queries, mutations, actions, tool handlers |
| **Dependencies** | Convex SDK, Anthropic SDK |

**Module Breakdown:**
- `convex/schema.ts` - Database schema (recipes, users, mealPlans, shoppingLists, extractionJobs)
- `convex/recipes.ts` - Recipe CRUD (queries, mutations)
- `convex/extraction.ts` - LLM-orchestrated extraction action
- `convex/users.ts` - User management
- `convex/mealPlans.ts` - Meal planning operations
- `convex/shoppingLists.ts` - Shopping list aggregation

**Library Code:**
- `convex/lib/types.ts` - TypeScript type definitions
- `convex/lib/utils.ts` - URL normalization, hashing
- `convex/lib/llmTools.ts` - Claude tool definitions and system prompt
- `convex/lib/toolHandlers.ts` - Tool implementation logic

---

### 6. LLM Extraction Layer

| Aspect | Details |
|--------|---------|
| **Purpose** | Intelligent recipe extraction from web pages |
| **Location** | `convex/extraction.ts`, `convex/lib/llmTools.ts`, `convex/lib/toolHandlers.ts` |
| **Contains** | Extraction orchestrator, tool definitions, handlers |
| **Dependencies** | @anthropic-ai/sdk (Claude) |

**Extraction Tools (9 total):**
1. `check_recipe_cache` - Cache lookup
2. `fetch_page` - HTTP fetch with headers
3. `extract_schema_recipe` - schema.org JSON-LD parsing
4. `extract_with_selectors` - Site-specific CSS extraction
5. `extract_generic` - Heuristic fallback
6. `parse_ingredient` / `parse_ingredients_batch` - Ingredient parsing
7. `classify_ingredient` - Shopping category classification
8. `download_image` - Image processing
9. `save_recipe` - Database persistence

---

## Data Flow

### Recipe Extraction Flow

```
User Input (URL)
      │
      ▼
┌─────────────────┐
│  ExtractScreen  │ ──► URL validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ extractRecipe   │ ──► Convex action
│    (action)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Cache Check    │ ──► │ User Cache   │ ──► Return if found
└────────┬────────┘     └──────────────┘
         │                    │
         │ (not found)        ▼
         │              ┌──────────────┐
         │              │ Global Cache │ ──► Return if found
         │              └──────────────┘
         ▼
┌─────────────────┐
│  Fast Path      │ ──► Try schema.org extraction (no LLM)
│  Extraction     │
└────────┬────────┘
         │ (schema found → save & return)
         │ (no schema)
         ▼
┌─────────────────┐
│  LLM Orchestr.  │ ──► Claude with tool use
│  (Claude)       │     Iterative tool calls
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save Recipe    │ ──► Convex database
└────────┬────────┘
         │
         ▼
   Recipe returned to UI
```

### Offline Data Flow

```
┌─────────────────┐
│ useOfflineRecipes│
└────────┬────────┘
         │
         ▼
    Is Online?
    /        \
   YES        NO
    │          │
    ▼          ▼
┌────────┐  ┌────────────┐
│ Convex │  │  SQLite    │
│ Query  │  │  Cache     │
└───┬────┘  └─────┬──────┘
    │             │
    │   ┌─────────┘
    ▼   ▼
┌─────────────────┐
│  Cache recipes  │ ──► SQLite (background)
│  for offline    │
└─────────────────┘
```

---

## Key Abstractions

### 1. Recipe Model

```typescript
// Core recipe structure (simplified)
interface Recipe {
  userId: Id<"users">;
  sourceUrl: string;
  urlHash: string;           // SHA256 for cache lookup
  title: string;
  ingredients: ParsedIngredient[];
  instructions: string[];
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  inactiveTime?: number;     // Passive time (rising, chilling)
  imageUrl?: string;
  extractionConfidence?: number;
  extractorUsed?: string;
}

interface ParsedIngredient {
  text: string;              // Original: "2 cups flour, sifted"
  quantity?: number;         // 2
  unit?: string;            // "cups"
  item?: string;            // "flour"
  preparation?: string;     // "sifted"
  category?: string;        // "pantry"
}
```

### 2. Theme System

```typescript
interface Theme {
  colors: ThemeColors;      // 25+ semantic color tokens
  isDark: boolean;
}

// Access via hooks
const colors = useColors();
const { isDark, toggleTheme } = useTheme();
```

### 3. Extraction Result

```typescript
interface ExtractionResult {
  success: boolean;
  recipe?: SavedRecipe;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  cached: boolean;
  metadata: {
    extractionTimeMs: number;
    source: 'user_cache' | 'global_cache' | 'fresh_extraction' | 'error';
    agentsUsed: string[];
    confidence?: number;
    extractorUsed?: string;
  };
}
```

---

## Entry Points

| Entry Point | Location | Purpose |
|-------------|----------|---------|
| **App Entry** | `App.tsx` | Root component, providers setup, font loading |
| **Navigation** | `src/navigation/index.tsx` | Screen routing configuration |
| **Convex Backend** | `convex/schema.ts` | Database schema definition |
| **Extraction** | `convex/extraction.ts` | Main extraction action |

---

## Error Handling

### Frontend Error Handling
- **Network errors**: Caught by `useNetworkStatus`, triggers offline mode
- **Convex errors**: Handled in component try/catch, user-friendly messages
- **Navigation errors**: React Navigation error boundary

### Backend Error Handling
- **Extraction errors**: Structured error codes (`INVALID_URL`, `NO_RECIPE_FOUND`, `LLM_ERROR`)
- **Tool errors**: Individual tool handlers return success/error objects
- **Database errors**: Convex built-in error propagation

### Error Response Structure
```typescript
{
  code: 'INVALID_URL' | 'NO_RECIPE_FOUND' | 'LLM_ERROR' | 'FETCH_ERROR',
  message: string,
  retryable: boolean
}
```

---

## Cross-Cutting Concerns

### 1. Theming
- `ThemeProvider` wraps entire app
- `useColors()` hook for color access
- Light/dark mode with system detection
- Design tokens in `src/styles/theme.ts`

### 2. Offline Support
- `OfflineProvider` manages cache operations
- `useNetworkStatus` monitors connectivity
- SQLite cache on native platforms (not web)
- Graceful degradation to cached data

### 3. Haptics
- `expo-haptics` for tactile feedback
- Platform-aware (disabled on web)
- Used in tab bar, buttons, checkboxes

### 4. Typography
- Inter font family (sans-serif) for body
- Fraunces font family (serif) for display headings
- Consistent sizing via `typography.sizes`

### 5. Animations
- React Native Animated API
- Staggered list animations
- Tab bar hide/show on scroll
- Press feedback on interactive elements
