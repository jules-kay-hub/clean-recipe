# CleanRecipe

Ad-free recipe extraction mobile app built with React Native, Expo, and Convex.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo Go app on your phone (for testing)
- Anthropic API key (for recipe extraction)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Initialize Convex (creates your backend)
npx convex dev
# This will:
# - Create a Convex project (or link to existing)
# - Generate the _generated folder
# - Start the Convex dev server

# 3. Copy environment template
cp .env.example .env
# Edit .env and add your EXPO_PUBLIC_CONVEX_URL

# 4. Add Anthropic API key to Convex
# Go to: https://dashboard.convex.dev
# Select your project → Settings → Environment Variables
# Add: ANTHROPIC_API_KEY = sk-ant-...

# 5. Start the app
npm start
# Scan QR code with Expo Go
```

### Adding Custom Fonts

The app uses DM Sans and Fraunces fonts. To add them:

```bash
# Download fonts and place in assets/fonts/
mkdir -p assets/fonts

# Then update App.tsx to load them with expo-font
```

## 📁 Project Structure

```
clean-recipe/
├── App.tsx                 # Entry point
├── app.json               # Expo config
├── convex.json            # Convex config
├── tsconfig.json          # TypeScript config
├── babel.config.js        # Babel config
├── package.json           # Dependencies
│
├── assets/                # App icons, splash screen
│   └── README.md          # Asset requirements
│
├── convex/                # Backend (runs on Convex)
│   ├── schema.ts          # Database schema
│   ├── recipes.ts         # Recipe CRUD operations
│   ├── extraction.ts      # LLM orchestrator
│   └── lib/
│       ├── types.ts       # TypeScript types
│       ├── utils.ts       # URL normalization
│       ├── llmTools.ts    # Claude tool definitions
│       └── toolHandlers.ts # Tool implementations
│
├── src/                   # Frontend (React Native)
│   ├── styles/
│   │   └── theme.ts       # Design tokens
│   ├── hooks/
│   │   └── useTheme.tsx   # Theme context
│   ├── components/
│   │   ├── ui/            # Base UI components
│   │   ├── RecipeCard.tsx
│   │   ├── IngredientItem.tsx
│   │   ├── ServingsAdjuster.tsx
│   │   └── URLInput.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── RecipeDetailScreen.tsx
│   │   ├── MealPlannerScreen.tsx
│   │   ├── ShoppingListScreen.tsx
│   │   └── ExtractingScreen.tsx
│   └── navigation/
│       └── index.tsx      # React Navigation setup
│
└── docs/
    ├── BRAND_THEME.md     # Design system
    └── CleanRecipe_Interactive_Preview.html
```

## 🎨 Design System

- **Primary**: Sage `#5C7C5A`
- **Accent**: Terracotta `#C4704E`
- **Background**: Cream `#FAF8F5`
- **Display Font**: Fraunces
- **Body Font**: DM Sans

See `docs/BRAND_THEME.md` for full specifications.

## 🔧 Architecture

### Cache-First Extraction

```
URL submitted
    ↓
Check user cache → Found? Return immediately
    ↓
Check global cache → Found? Copy to user, return
    ↓
Run LLM extraction (Claude orchestrates tools)
    ↓
Save to both caches
```

### LLM Tools (Option C)

Claude decides which tools to call:
1. `check_recipe_cache` - Always first
2. `fetch_page` - Get HTML
3. `extract_schema_recipe` - Try schema.org
4. `extract_with_selectors` - Site-specific CSS
5. `extract_generic` - Heuristic fallback
6. `parse_ingredients_batch` - Structure ingredients
7. `classify_ingredient` - Categorize for shopping
8. `download_image` - Process images
9. `save_recipe` - Persist to database

## 📱 Screens

| Screen | Purpose |
|--------|---------|
| Home | Recipe library + URL extraction |
| Recipe Detail | Full recipe with scaling |
| Meal Planner | Weekly calendar |
| Shopping List | Aggregated ingredients |
| Extracting | Loading state |

## 🚧 TODO

- [ ] Add authentication (Clerk or Auth0)
- [ ] Implement offline mode (SQLite)
- [ ] Add cooking mode (wake lock, step-by-step)
- [ ] Recipe sharing
- [ ] Import from photos (OCR)

## 📄 License

MIT
