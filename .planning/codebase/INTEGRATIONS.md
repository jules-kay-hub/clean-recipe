# External Integrations

## APIs & External Services

### Anthropic Claude API
| Aspect | Detail |
|--------|--------|
| **SDK** | `@anthropic-ai/sdk` v0.71.2 |
| **Model** | `claude-sonnet-4-20250514` |
| **Purpose** | LLM-orchestrated recipe extraction |
| **Usage Location** | `convex/extraction.ts` |
| **Authentication** | API key via Convex environment variable |

**Integration Pattern:**
- Claude acts as an orchestrator with tool-use capabilities
- Tools defined in `convex/lib/llmTools.ts`
- Handles: cache checking, page fetching, schema extraction, ingredient parsing, recipe saving

**Tool Suite:**
1. `check_recipe_cache` - Cache lookup
2. `fetch_page` - HTTP page retrieval
3. `extract_schema_recipe` - schema.org JSON-LD extraction
4. `extract_with_selectors` - Site-specific CSS selectors
5. `extract_generic` - Heuristic fallback
6. `parse_ingredient` / `parse_ingredients_batch` - Ingredient parsing
7. `classify_ingredient` - Shopping category assignment
8. `download_image` - Image processing
9. `save_recipe` - Database persistence

### External Recipe Websites
- **Integration**: HTTP fetch with browser-like headers
- **User-Agent**: Chrome/Windows simulation
- **Extraction Methods**:
  1. schema.org JSON-LD (primary)
  2. Site-specific CSS selectors (fallback)
  3. Generic heuristics (last resort)

## Data Storage

### Convex Database (Primary)
| Aspect | Detail |
|--------|--------|
| **Type** | Document database with real-time sync |
| **SDK** | `convex` v1.17.0 |
| **URL** | `https://qualified-goose-335.convex.cloud` |
| **Project** | `clean-recipe` (team: julie-heflin) |

**Schema Tables** (`convex/schema.ts`):
| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `recipes` | Core recipe data | `by_url_hash`, `by_user`, `by_user_url` |
| `users` | User accounts & preferences | `by_email` |
| `mealPlans` | Weekly meal planning | `by_user_date` |
| `shoppingLists` | Shopping list items & state | `by_user_week` |
| `extractionJobs` | Async extraction tracking | `by_status`, `by_url_hash` |

**Backend Functions** (`convex/`):
| File | Purpose |
|------|---------|
| `recipes.ts` | Recipe CRUD operations |
| `extraction.ts` | LLM extraction orchestration |
| `users.ts` | User management |
| `mealPlans.ts` | Meal planning logic |
| `shoppingLists.ts` | Shopping list aggregation |

### SQLite (Local Cache)
| Aspect | Detail |
|--------|--------|
| **Package** | `expo-sqlite` v16.0.10 |
| **Database** | `recipeCache.db` |
| **Purpose** | Offline recipe viewing |
| **Location** | `src/services/offlineStorage.ts` |

**Cache Schema:**
```sql
CREATE TABLE cached_recipes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  data TEXT NOT NULL,         -- JSON blob
  cached_at INTEGER NOT NULL,
  last_accessed INTEGER NOT NULL,
  convex_modified INTEGER
);
```

**Cache Operations:**
- `cacheRecipe()` / `cacheRecipes()` - Store recipes
- `getCachedRecipes()` / `getCachedRecipe()` - Retrieve
- `removeCachedRecipe()` / `clearCache()` - Cleanup
- `getCacheStats()` - Usage metrics

**Platform Support:**
- Native (iOS/Android): Full SQLite support
- Web: Disabled (no WASM configuration)

## Authentication & Identity

### Current State
- **Users table** defined in Convex schema
- **Fields**: email, name, avatarUrl
- **No external auth provider** integrated yet
- Placeholder bundle identifiers in `app.json`

### Prepared For
- Email-based authentication
- OAuth integration (structure supports avatarUrl)
- User preferences (theme, measurement system, default servings)

## Monitoring & Observability

### Console Logging
- Extraction errors logged via `console.error()`
- Fast path fallbacks logged via `console.log()`
- No external monitoring service integrated

### Extraction Metadata
- `extractionTimeMs` - Performance tracking
- `extractionConfidence` - Quality scoring (0-1)
- `extractorUsed` - Method tracking (schema/llm/generic)
- `agentsUsed` - Agent chain tracking

## CI/CD & Deployment

### Convex Deployment
| Environment | Command | URL |
|-------------|---------|-----|
| Development | `npm run convex:dev` | Auto-sync with local |
| Production | `npm run convex:deploy` | `qualified-goose-335.convex.cloud` |

### Expo Build (Prepared)
- EAS Build placeholder in `app.json` (`extra.eas.projectId`)
- iOS/Android bundle identifiers configured

### Scripts (`package.json`)
| Script | Purpose |
|--------|---------|
| `npm start` | Start Expo dev server |
| `npm run ios` | iOS simulator |
| `npm run android` | Android emulator |
| `npm run web` | Web development |
| `npm run convex:dev` | Convex local development |
| `npm run convex:deploy` | Production deployment |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint check |

## Environment Configuration

### Environment Variables

#### Local Development (`.env.local`)
```
CONVEX_DEPLOYMENT=dev:qualified-goose-335
EXPO_PUBLIC_CONVEX_URL=https://qualified-goose-335.convex.cloud
```

#### Convex Dashboard (Required)
| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API authentication |

### Configuration Loading
- **Frontend**: `EXPO_PUBLIC_*` prefix exposes to client
- **Backend**: Convex environment variables via dashboard

## Network & Connectivity

### NetInfo Integration
| Aspect | Detail |
|--------|--------|
| **Package** | `@react-native-community/netinfo` v11.4.1 |
| **Purpose** | Online/offline detection |
| **Usage** | `src/context/OfflineContext.tsx` (implied) |

### Offline-First Pattern
1. Check network connectivity
2. If online: Query Convex, sync to SQLite cache
3. If offline: Serve from SQLite cache
4. Hooks: `useOfflineRecipes()`, `useOfflineRecipe()`
