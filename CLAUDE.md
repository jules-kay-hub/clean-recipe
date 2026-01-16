# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rogue Recipe is an ad-free recipe extraction mobile app. Users paste a recipe URL, and the app extracts just the ingredients and instructions—no ads, no life stories. Built with React Native + Expo for the mobile frontend and Convex for the serverless backend with real-time sync.

## Commands

```bash
# Start Expo development server
npm start

# Start Convex backend (in separate terminal)
npm run convex:dev

# Run iOS simulator
npm run ios

# Run Android emulator
npm run android

# Type checking
npm run typecheck

# Linting
npm run lint

# Deploy Convex to production
npm run convex:deploy
```

## Architecture

### Tech Stack
- **Frontend**: React Native with Expo, React Navigation (bottom tabs + native stack)
- **Backend**: Convex (database, serverless functions, real-time sync)
- **Recipe Extraction**: LLM-orchestrated via Claude with tool use

### Directory Structure
```
src/                    # React Native frontend
├── components/         # UI components (RecipeCard, URLInput, etc.)
├── components/ui/      # Base design system components
├── screens/            # App screens (Home, RecipeDetail, MealPlanner, etc.)
├── hooks/              # React hooks (useTheme)
├── styles/             # Design tokens and theme
└── navigation/         # React Navigation configuration

convex/                 # Convex backend (runs in cloud)
├── schema.ts           # Database schema definition
├── recipes.ts          # Recipe CRUD operations and queries
├── extraction.ts       # LLM orchestrator for recipe extraction
└── lib/
    ├── types.ts        # TypeScript types for extraction
    ├── utils.ts        # URL normalization and hashing
    ├── llmTools.ts     # Claude tool definitions
    └── toolHandlers.ts # Tool implementations (fetch, parse, etc.)
```

### Path Aliases
Configured in `babel.config.js` and `tsconfig.json`:
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@screens/*` → `src/screens/*`
- `@hooks/*` → `src/hooks/*`
- `@styles/*` → `src/styles/*`

### Cache-First Extraction Flow
1. User submits URL
2. Check user's personal cache (by urlHash)
3. Check global cache (another user's extraction)
4. If not cached: LLM orchestration with Claude tool use
5. Save to both user collection and global cache

### Convex Schema (Key Tables)
- **recipes**: Core recipe data with ingredients, instructions, and extraction metadata. Indexed by `urlHash` for cache lookups.
- **users**: User accounts and preferences
- **mealPlans**: Weekly meal planning (breakfast/lunch/dinner slots)
- **shoppingLists**: Aggregated ingredients from meal plans
- **extractionJobs**: Async extraction job tracking

### LLM Extraction Tools (convex/lib/llmTools.ts)
Claude orchestrates these tools to extract recipes:
1. `check_recipe_cache` - Check if URL already extracted
2. `fetch_page` - Get HTML from URL
3. `extract_schema_recipe` - Parse schema.org JSON-LD
4. `extract_with_selectors` - Site-specific CSS selectors
5. `extract_generic` - Heuristic fallback
6. `parse_ingredients_batch` - Parse ingredient strings into structured data
7. `classify_ingredient` - Categorize for shopping list
8. `download_image` - Process recipe images
9. `save_recipe` - Persist to database

## Design System

- **Primary**: Deep Navy `#0D1B2A`
- **Background**: Paper `#FAFAFA`
- **Text**: Ink `#1A1A1A`
- **Fonts**: Inter (all text)
- **Icons**: Lucide React Native

Theme tokens are in `src/styles/theme.ts`.

## Environment Setup

1. Copy `.env.example` to `.env`
2. Run `npx convex dev` to create Convex project and get URL
3. Add `EXPO_PUBLIC_CONVEX_URL` to `.env`
4. Add `ANTHROPIC_API_KEY` in Convex Dashboard (Settings → Environment Variables)

## Key Patterns

### Ingredient Parsing
Ingredients are stored with structured data:
```typescript
{
  text: "2 cups flour, sifted",  // Original
  quantity: 2,
  unit: "cups",
  item: "flour",
  preparation: "sifted",
  category: "pantry"
}
```

### URL Normalization
URLs are normalized before caching:
- Remove tracking params (utm_*, fbclid, etc.)
- Strip www prefix
- Lowercase
- Remove trailing slash
- Hash with SHA256 for lookup key
