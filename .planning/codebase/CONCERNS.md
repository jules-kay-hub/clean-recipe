# Codebase Concerns

Analysis of technical debt, bugs, security considerations, performance bottlenecks, and fragile areas.

---

## Tech Debt

### 1. Type Safety Issues with `any` Types

| Aspect | Details |
|--------|---------|
| **Issue** | Multiple `any` type usages undermining TypeScript benefits |
| **Files** | `convex/mealPlans.ts:9,13,89`, `convex/shoppingLists.ts:10,13,124`, `src/services/offlineStorage.ts:37` |
| **Impact** | Reduced type safety, potential runtime errors, harder refactoring |
| **Fix Approach** | Replace with proper Convex types (`QueryCtx`, `MutationCtx`) and explicit interface definitions |

### 2. Hardcoded Demo User Pattern

| Aspect | Details |
|--------|---------|
| **Issue** | `getOrCreateUserId` functions use hardcoded demo user email |
| **Files** | `convex/mealPlans.ts:9-26`, `convex/shoppingLists.ts:10-25` |
| **Impact** | No multi-user support, all data shared among all users |
| **Fix Approach** | Implement proper authentication (Clerk, Auth0, etc.) and pass authenticated userId |

### 3. Duplicated Helper Functions

| Aspect | Details |
|--------|---------|
| **Issue** | `getOrCreateUserId` is duplicated across multiple Convex files |
| **Files** | `convex/mealPlans.ts`, `convex/shoppingLists.ts` |
| **Impact** | Code duplication, inconsistent behavior risk |
| **Fix Approach** | Extract to shared utility module in `convex/lib/` |

### 4. Incomplete Site-Specific Extraction

| Aspect | Details |
|--------|---------|
| **Issue** | `handleExtractWithSelectors` falls back to schema extraction without actual CSS selector parsing |
| **Files** | `convex/lib/toolHandlers.ts:509-525` |
| **Impact** | Site-specific extraction not functional, always falls back |
| **Fix Approach** | Implement proper HTML parsing with cheerio or similar library |

### 5. Placeholder Image Processing

| Aspect | Details |
|--------|---------|
| **Issue** | `handleDownloadImage` only validates URL exists, no actual download/resize/storage |
| **Files** | `convex/lib/toolHandlers.ts:730-756` |
| **Impact** | Images served from external URLs (potential broken links, no optimization) |
| **Fix Approach** | Implement actual image download to Convex file storage with resizing |

### 6. Large Component Files

| Aspect | Details |
|--------|---------|
| **Issue** | Several files exceed 500 lines |
| **Files** | `convex/lib/toolHandlers.ts` (790), `src/components/ui/index.tsx` (579), `src/screens/ShoppingListScreen.tsx` (576), `convex/extraction.ts` (571), `src/screens/RecipesScreen.tsx` (568) |
| **Impact** | Harder to maintain, test, and understand |
| **Fix Approach** | Split into smaller, focused modules |

---

## Known Bugs

### 1. Silent Error Swallowing in Offline Operations

| Aspect | Details |
|--------|---------|
| **Symptoms** | Operations fail silently with no user feedback |
| **Files** | `src/context/OfflineContext.tsx:47-51,61-63,69-71,77-79,86-88,95-97,103-105` |
| **Trigger** | Any SQLite operation failure |
| **Workaround** | None currently; errors logged to console but not surfaced to user |

### 2. Category Missing in Sort Order

| Aspect | Details |
|--------|---------|
| **Symptoms** | "canned" category appears in CATEGORIES but missing from categoryOrder in shoppingLists.ts |
| **Files** | `convex/shoppingLists.ts:228-239`, `src/screens/ShoppingListScreen.tsx:64-76` |
| **Trigger** | Items with "canned" category may sort inconsistently |
| **Workaround** | Items still appear but may not sort correctly |

---

## Security Considerations

### 1. No Authentication Implementation

| Aspect | Details |
|--------|---------|
| **Risk** | All users share same demo user data; no data isolation |
| **Files** | `convex/mealPlans.ts`, `convex/shoppingLists.ts`, `convex/recipes.ts` |
| **Mitigation** | Currently demo-only app, not exposed to public |
| **Recommendations** | Implement Clerk/Auth0 authentication before production release |

### 2. Anthropic API Key Exposure Risk

| Aspect | Details |
|--------|---------|
| **Risk** | API key must be stored in Convex environment variables |
| **Files** | `convex/extraction.ts:157` (creates Anthropic client) |
| **Mitigation** | Key stored in Convex Dashboard, not in code |
| **Recommendations** | Ensure API key has appropriate rate limits; monitor usage |

### 3. External URL Fetching Without Validation

| Aspect | Details |
|--------|---------|
| **Risk** | User-provided URLs are fetched directly without sanitization |
| **Files** | `convex/lib/toolHandlers.ts:90-132` |
| **Mitigation** | Basic URL validation exists, runs in Convex serverless environment |
| **Recommendations** | Add URL allowlist for known recipe sites; implement request timeouts |

### 4. No Rate Limiting on Extraction

| Aspect | Details |
|--------|---------|
| **Risk** | Users could trigger unlimited LLM API calls |
| **Files** | `convex/extraction.ts:39-341` |
| **Mitigation** | None currently |
| **Recommendations** | Implement per-user rate limiting; add extraction quotas |

---

## Performance Bottlenecks

### 1. N+1 Query Pattern in Meal Plans

| Aspect | Details |
|--------|---------|
| **Problem** | Individual recipe fetches for each meal in a plan |
| **Files** | `convex/mealPlans.ts:48-57,92-101` |
| **Cause** | `Promise.all` with individual `ctx.db.get()` calls per recipe |
| **Improvement** | Batch fetch recipes with a single query using `IN` filter |

### 2. Unoptimized Shopping List Generation

| Aspect | Details |
|--------|---------|
| **Problem** | Sequential recipe fetching in shopping list generation |
| **Files** | `convex/shoppingLists.ts:125-135` |
| **Cause** | Loop with individual `ctx.db.get()` calls |
| **Improvement** | Use single batch query to fetch all recipes at once |

### 3. LLM Extraction Loop Without Early Exit

| Aspect | Details |
|--------|---------|
| **Problem** | Extraction loop may continue even after recipe is found |
| **Files** | `convex/extraction.ts:186-268` |
| **Cause** | Loop continues until `end_turn` or max loops reached |
| **Improvement** | Add explicit exit condition when recipe is saved successfully |

### 4. Console Logging in Production Code

| Aspect | Details |
|--------|---------|
| **Problem** | 24 console.log/error statements in src/ |
| **Files** | Multiple screens and hooks (see console.error grep results) |
| **Cause** | Debug logging left in production code |
| **Improvement** | Replace with proper logging service or remove; use development-only logging |

---

## Fragile Areas

### 1. LLM Tool Orchestration

| Aspect | Details |
|--------|---------|
| **Files** | `convex/extraction.ts`, `convex/lib/toolHandlers.ts`, `convex/lib/llmTools.ts` |
| **Why Fragile** | Complex state machine with multiple tool calls; depends on LLM response format; 10-iteration safety limit could miss edge cases |
| **Safe Modification** | Test with variety of recipe URLs; ensure tool result parsing handles unexpected formats |
| **Test Coverage** | No automated tests visible; manual testing required |

### 2. Passive Time Regex Patterns

| Aspect | Details |
|--------|---------|
| **Files** | `convex/lib/toolHandlers.ts:256-365` |
| **Why Fragile** | 15+ complex regex patterns with overlapping matches; span tracking to avoid double-counting |
| **Safe Modification** | Add comprehensive test cases before modifying; validate against known recipe instructions |
| **Test Coverage** | No unit tests visible |

### 3. Ingredient Parsing and Classification

| Aspect | Details |
|--------|---------|
| **Files** | `convex/lib/toolHandlers.ts:550-724` |
| **Why Fragile** | Multiple regex patterns for quantities, fractions, units; keyword-based classification with priority ordering |
| **Safe Modification** | Test with diverse ingredient formats; beware of order-dependency in category matching |
| **Test Coverage** | No unit tests visible |

### 4. Offline Storage SQLite Integration

| Aspect | Details |
|--------|---------|
| **Files** | `src/services/offlineStorage.ts`, `src/context/OfflineContext.tsx`, `src/hooks/useOfflineRecipes.ts` |
| **Why Fragile** | Platform-specific code (web vs native); conditional imports; async initialization |
| **Safe Modification** | Test on both iOS and Android; verify web fallback behavior |
| **Test Coverage** | No automated tests |

---

## Scaling Limits

| Concern | Details |
|---------|---------|
| **Recipe Count** | No pagination on recipe list queries; performance degrades with large collections |
| **Meal Plan History** | No archival strategy; all historical meal plans retained indefinitely |
| **Shopping List Items** | No limit on custom items per week |
| **LLM Costs** | No caching strategy for failed extractions; retries consume API credits |
| **Image Storage** | Currently using external URLs; no CDN or storage optimization |

---

## Dependencies at Risk

| Dependency | Version | Risk |
|------------|---------|------|
| `@anthropic-ai/sdk` | ^0.71.2 | API changes could break extraction; pricing changes affect costs |
| `expo-sqlite` | ~16.0.10 | Native-only; no web support without WebAssembly configuration |
| `convex` | ^1.17.0 | Backend-as-a-service; platform dependency |
| `expo` | ^54.0.31 | Major version changes often require significant migration effort |
| `react-native` | ^0.81.5 | Frequent breaking changes between versions |

---

## Missing Critical Features

| Feature | Impact | Priority |
|---------|--------|----------|
| **User Authentication** | No data isolation between users | High |
| **Error Boundaries** | App crashes on component errors | High |
| **Automated Testing** | No tests found for any component | High |
| **Loading State Skeletons** | Jarring loading experience | Medium |
| **Retry Logic for Failed Extractions** | Users must manually retry | Medium |
| **Export/Backup** | No way to export recipe collection | Medium |
| **Search Functionality** | No recipe search capability | Medium |

---

## Test Coverage Gaps

| Area | Gap Description |
|------|-----------------|
| **Convex Functions** | No unit tests for queries, mutations, or actions |
| **React Components** | No component tests |
| **Extraction Logic** | No tests for ingredient parsing, classification, or passive time detection |
| **Offline Storage** | No tests for SQLite operations |
| **Navigation** | No integration tests for navigation flows |
| **E2E Tests** | No end-to-end testing framework configured |

---

## Summary Priority Matrix

| Priority | Items |
|----------|-------|
| **Critical** | Authentication implementation, Error boundaries |
| **High** | Test coverage, Type safety fixes, Rate limiting |
| **Medium** | Performance optimizations, Image processing, Logging cleanup |
| **Low** | Code organization, Duplicate code removal |
