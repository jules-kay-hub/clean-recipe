# CleanRecipe Subagent Architecture

## Overview

This document outlines a multi-agent architecture for the CleanRecipe extraction and intelligence system. The architecture uses specialized subagents coordinated by an orchestrator to handle recipe extraction, ingredient processing, and meal planning intelligence.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MOBILE APP                                      │
│                         (React Native + Expo)                                │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONVEX                                          │
│                    (Database + Real-time Sync)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   recipes   │  │    users    │  │  mealPlans  │  │ shoppingLists│        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR AGENT                                   │
│                                                                              │
│   • Receives extraction requests from Convex                                 │
│   • Routes to appropriate subagents                                          │
│   • Handles retries and fallbacks                                            │
│   • Aggregates results and returns to Convex                                 │
│                                                                              │
└───────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┘
        │             │             │             │             │
        ▼             ▼             ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│   RECON   │  │ EXTRACTION│  │INGREDIENT │  │   IMAGE   │  │  MEAL     │
│   AGENT   │  │  AGENTS   │  │  AGENTS   │  │   AGENT   │  │  AGENT    │
└───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘
```

---

## Cache-First Architecture

All implementation options (Function-Based, Queue-Based, LLM-Orchestrated) use the same cache-first pattern. The caching layer sits at the Convex level, above the extraction pipeline, ensuring we never re-extract a recipe that's already been saved.

### Cache Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MOBILE APP                                      │
│                                                                              │
│   User submits URL ──────────────────────────────────────────────────────┐  │
│                                                                           │  │
└───────────────────────────────────────────────────────────────────────────┼──┘
                                                                            │
                                                                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONVEX                                          │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    extractOrGet Action                               │   │
│   │                                                                      │   │
│   │   1. Normalize URL (remove tracking params, lowercase)               │   │
│   │   2. Generate URL hash for fast lookup                               │   │
│   │                                                                      │   │
│   └───────────────────────────────┬─────────────────────────────────────┘   │
│                                   │                                          │
│                                   ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │              Check User's Recipe Cache                               │   │
│   │              recipes.by_user_url(userId, urlHash)                    │   │
│   └───────────────────────────────┬─────────────────────────────────────┘   │
│                                   │                                          │
│                    ┌──────────────┴──────────────┐                          │
│                    │                             │                          │
│                    ▼                             ▼                          │
│              ┌──────────┐                 ┌──────────────┐                  │
│              │  FOUND   │                 │  NOT FOUND   │                  │
│              └────┬─────┘                 └───────┬──────┘                  │
│                   │                               │                          │
│                   │                               ▼                          │
│                   │               ┌─────────────────────────────────────┐   │
│                   │               │    Check Global Recipe Cache        │   │
│                   │               │    recipes.by_url_hash(urlHash)     │   │
│                   │               └───────────────┬─────────────────────┘   │
│                   │                               │                          │
│                   │                ┌──────────────┴──────────────┐          │
│                   │                │                             │          │
│                   │                ▼                             ▼          │
│                   │          ┌──────────┐                ┌──────────────┐   │
│                   │          │  FOUND   │                │  NOT FOUND   │   │
│                   │          └────┬─────┘                └───────┬──────┘   │
│                   │               │                              │          │
│                   │               ▼                              │          │
│                   │    ┌───────────────────┐                     │          │
│                   │    │ Copy to User's    │                     │          │
│                   │    │ Collection        │                     │          │
│                   │    └─────────┬─────────┘                     │          │
│                   │              │                               │          │
│                   ▼              ▼                               ▼          │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │   RETURN CACHED                              CALL EXTRACTION        │   │
│   │   ┌────────────────────┐                     PIPELINE               │   │
│   │   │ {                  │                     ┌──────────────────┐   │   │
│   │   │   success: true,   │                     │                  │   │   │
│   │   │   recipe: {...},   │                     │  Orchestrator    │   │   │
│   │   │   cached: true,    │                     │       ↓          │   │   │
│   │   │   source: "user"   │                     │  Recon Agent     │   │   │
│   │   │     | "global"     │                     │       ↓          │   │   │
│   │   │ }                  │                     │  Extractor       │   │   │
│   │   └────────────────────┘                     │       ↓          │   │   │
│   │                                              │  Ingredient      │   │   │
│   │                                              │       ↓          │   │   │
│   │                                              │  Image Agent     │   │   │
│   │                                              │                  │   │   │
│   │                                              └────────┬─────────┘   │   │
│   │                                                       │             │   │
│   │                                                       ▼             │   │
│   │                                              ┌──────────────────┐   │   │
│   │                                              │ Save to User's   │   │   │
│   │                                              │ Collection +     │   │   │
│   │                                              │ Global Cache     │   │   │
│   │                                              └────────┬─────────┘   │   │
│   │                                                       │             │   │
│   │                                                       ▼             │   │
│   │                                              ┌────────────────────┐ │   │
│   │                                              │ {                  │ │   │
│   │                                              │   success: true,   │ │   │
│   │                                              │   recipe: {...},   │ │   │
│   │                                              │   cached: false    │ │   │
│   │                                              │ }                  │ │   │
│   │                                              └────────────────────┘ │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Cache Levels

| Level | Scope | Purpose | TTL |
|-------|-------|---------|-----|
| **User Cache** | Per-user recipes | User's personal collection | Permanent |
| **Global Cache** | All extracted recipes | Avoid re-extracting popular recipes | Permanent |
| **Redis Cache** (Optional) | Recent extractions | Fast lookup for hot recipes | 1 hour |

### URL Normalization

Before checking the cache, URLs are normalized to ensure consistent matching:

```typescript
function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  
  // Remove common tracking parameters
  const trackingParams = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'fbclid', 'gclid', 'ref', 'source'
  ];
  trackingParams.forEach(param => parsed.searchParams.delete(param));
  
  // Normalize
  parsed.hostname = parsed.hostname.replace(/^www\./, '');  // Remove www
  const normalized = parsed.toString()
    .replace(/\/$/, '')      // Remove trailing slash
    .toLowerCase();          // Lowercase
  
  return normalized;
}

function hashUrl(url: string): string {
  return createHash('sha256')
    .update(normalizeUrl(url))
    .digest('hex')
    .substring(0, 16);  // First 16 chars is enough
}
```

### Convex Schema with Cache Indexes

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    // Ownership
    userId: v.id("users"),
    
    // Cache keys
    sourceUrl: v.string(),
    urlHash: v.string(),
    
    // Recipe data
    title: v.string(),
    ingredients: v.array(v.object({
      text: v.string(),
      quantity: v.optional(v.number()),
      unit: v.optional(v.string()),
      item: v.optional(v.string()),
      category: v.optional(v.string()),
    })),
    instructions: v.array(v.string()),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    
    // Metadata
    extractedAt: v.number(),
    extractionConfidence: v.optional(v.number()),
    extractorUsed: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_url_hash", ["urlHash"])                    // Global cache lookup
    .index("by_user_url", ["userId", "urlHash"]),         // User-specific lookup

  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    preferences: v.optional(v.object({
      defaultServings: v.optional(v.number()),
      theme: v.optional(v.string()),
    })),
  }).index("by_email", ["email"]),

  mealPlans: defineTable({
    userId: v.id("users"),
    date: v.string(),
    meals: v.array(v.object({
      slot: v.union(v.literal("breakfast"), v.literal("lunch"), v.literal("dinner")),
      recipeId: v.id("recipes"),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),

  shoppingLists: defineTable({
    userId: v.id("users"),
    name: v.optional(v.string()),
    items: v.array(v.object({
      ingredient: v.string(),
      quantity: v.optional(v.number()),
      unit: v.optional(v.string()),
      category: v.optional(v.string()),
      checked: v.boolean(),
      recipeId: v.optional(v.id("recipes")),
    })),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
```

### Cache-First Extraction Action

```typescript
// convex/recipes.ts
import { v } from "convex/values";
import { action, query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { createHash } from "crypto";

// Normalize and hash URL
function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid', 'ref']
    .forEach(p => parsed.searchParams.delete(p));
  parsed.hostname = parsed.hostname.replace(/^www\./, '');
  return parsed.toString().replace(/\/$/, '').toLowerCase();
}

function hashUrl(url: string): string {
  return createHash('sha256').update(normalizeUrl(url)).digest('hex').substring(0, 16);
}

// Query: Check if user already has this recipe
export const getByUrl = query({
  args: { url: v.string(), userId: v.id("users") },
  handler: async (ctx, { url, userId }) => {
    const urlHash = hashUrl(url);
    return await ctx.db
      .query("recipes")
      .withIndex("by_user_url", q => q.eq("userId", userId).eq("urlHash", urlHash))
      .first();
  },
});

// Query: Check global cache for any user's extraction of this URL
export const getGlobalByUrl = query({
  args: { urlHash: v.string() },
  handler: async (ctx, { urlHash }) => {
    return await ctx.db
      .query("recipes")
      .withIndex("by_url_hash", q => q.eq("urlHash", urlHash))
      .first();
  },
});

// Mutation: Save extracted recipe
export const saveRecipe = mutation({
  args: {
    userId: v.id("users"),
    sourceUrl: v.string(),
    urlHash: v.string(),
    title: v.string(),
    ingredients: v.array(v.object({
      text: v.string(),
      quantity: v.optional(v.number()),
      unit: v.optional(v.string()),
      item: v.optional(v.string()),
      category: v.optional(v.string()),
    })),
    instructions: v.array(v.string()),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    extractionConfidence: v.optional(v.number()),
    extractorUsed: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("recipes", {
      ...args,
      extractedAt: Date.now(),
    });
  },
});

// Mutation: Copy global recipe to user's collection
export const copyToUser = mutation({
  args: {
    userId: v.id("users"),
    sourceRecipeId: v.id("recipes"),
  },
  handler: async (ctx, { userId, sourceRecipeId }) => {
    const source = await ctx.db.get(sourceRecipeId);
    if (!source) throw new Error("Source recipe not found");
    
    // Check if user already has this recipe
    const existing = await ctx.db
      .query("recipes")
      .withIndex("by_user_url", q => q.eq("userId", userId).eq("urlHash", source.urlHash))
      .first();
    
    if (existing) return existing._id;
    
    // Copy to user's collection
    return await ctx.db.insert("recipes", {
      ...source,
      userId,
      extractedAt: Date.now(),
    });
  },
});

// Main Action: Extract or Get from Cache
export const extractOrGet = action({
  args: { url: v.string(), userId: v.id("users") },
  handler: async (ctx, { url, userId }): Promise<ExtractionResult> => {
    const startTime = Date.now();
    const urlHash = hashUrl(url);
    
    // ─────────────────────────────────────────────────────────────
    // STEP 1: Check user's personal cache
    // ─────────────────────────────────────────────────────────────
    const userCached = await ctx.runQuery(internal.recipes.getByUrl, { url, userId });
    
    if (userCached) {
      return {
        success: true,
        recipe: userCached,
        cached: true,
        metadata: {
          extractionTimeMs: Date.now() - startTime,
          source: "user_cache",
          agentsUsed: [],
        },
      };
    }
    
    // ─────────────────────────────────────────────────────────────
    // STEP 2: Check global cache (other users' extractions)
    // ─────────────────────────────────────────────────────────────
    const globalCached = await ctx.runQuery(internal.recipes.getGlobalByUrl, { urlHash });
    
    if (globalCached) {
      // Copy to user's collection
      const recipeId = await ctx.runMutation(internal.recipes.copyToUser, {
        userId,
        sourceRecipeId: globalCached._id,
      });
      
      const recipe = await ctx.runQuery(internal.recipes.getById, { id: recipeId });
      
      return {
        success: true,
        recipe,
        cached: true,
        metadata: {
          extractionTimeMs: Date.now() - startTime,
          source: "global_cache",
          agentsUsed: [],
        },
      };
    }
    
    // ─────────────────────────────────────────────────────────────
    // STEP 3: Not cached - run extraction pipeline
    // ─────────────────────────────────────────────────────────────
    try {
      // Call your extraction orchestrator (any of the 3 options)
      const extractionResult = await runExtractionPipeline(url);
      
      if (!extractionResult.success) {
        return {
          success: false,
          error: extractionResult.error,
          cached: false,
          metadata: {
            extractionTimeMs: Date.now() - startTime,
            source: "extraction_failed",
            agentsUsed: extractionResult.agentsUsed || [],
          },
        };
      }
      
      // Save to database
      const recipeId = await ctx.runMutation(internal.recipes.saveRecipe, {
        userId,
        sourceUrl: url,
        urlHash,
        ...extractionResult.recipe,
        extractionConfidence: extractionResult.confidence,
        extractorUsed: extractionResult.extractorUsed,
      });
      
      const recipe = await ctx.runQuery(internal.recipes.getById, { id: recipeId });
      
      return {
        success: true,
        recipe,
        cached: false,
        metadata: {
          extractionTimeMs: Date.now() - startTime,
          source: "fresh_extraction",
          agentsUsed: extractionResult.agentsUsed,
          confidence: extractionResult.confidence,
        },
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          code: "EXTRACTION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          retryable: true,
        },
        cached: false,
        metadata: {
          extractionTimeMs: Date.now() - startTime,
          source: "error",
          agentsUsed: [],
        },
      };
    }
  },
});

// Types
interface ExtractionResult {
  success: boolean;
  recipe?: any;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  cached: boolean;
  metadata: {
    extractionTimeMs: number;
    source: "user_cache" | "global_cache" | "fresh_extraction" | "extraction_failed" | "error";
    agentsUsed: string[];
    confidence?: number;
  };
}
```

### Cache Benefits

| Scenario | Without Cache | With Cache |
|----------|---------------|------------|
| User saves same recipe twice | 2 extractions (10s) | 1 extraction + 1 lookup (<100ms) |
| Popular recipe (1000 users) | 1000 extractions | 1 extraction + 999 lookups |
| User switches devices | Re-extract all | Synced via Convex |
| Offline access | Not possible | SQLite local cache |

### Cache Invalidation

Recipes rarely change, but if needed:

```typescript
// Force re-extraction (e.g., user reports outdated recipe)
export const forceRefresh = action({
  args: { recipeId: v.id("recipes"), userId: v.id("users") },
  handler: async (ctx, { recipeId, userId }) => {
    const recipe = await ctx.runQuery(internal.recipes.getById, { id: recipeId });
    if (!recipe || recipe.userId !== userId) {
      throw new Error("Recipe not found or not owned by user");
    }
    
    // Re-extract
    const result = await runExtractionPipeline(recipe.sourceUrl);
    
    if (result.success) {
      // Update existing recipe
      await ctx.runMutation(internal.recipes.update, {
        id: recipeId,
        ...result.recipe,
        extractedAt: Date.now(),
      });
    }
    
    return result;
  },
});
```

---

## Agent Specifications

### 1. Orchestrator Agent

**Role:** Central coordinator that manages the extraction pipeline and routes requests to specialized subagents.

**Responsibilities:**
- Receive URL extraction requests
- Coordinate subagent execution order
- Handle errors, retries, and fallbacks
- Aggregate results into final recipe object
- Return structured data to Convex

**Input:**
```typescript
interface ExtractionRequest {
  url: string;
  userId: string;
  requestId: string;
  options?: {
    skipImages?: boolean;
    parseNutrition?: boolean;
  };
}
```

**Output:**
```typescript
interface ExtractionResult {
  success: boolean;
  recipe?: Recipe;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  metadata: {
    extractionTimeMs: number;
    agentsUsed: string[];
    confidence: number;
  };
}
```

**Orchestration Flow:**
```
1. Receive URL
2. Call Recon Agent → Get site analysis
3. Based on site type:
   a. Schema.org detected → Schema Extractor
   b. Known site → Site-Specific Extractor  
   c. Unknown site → Generic HTML Extractor
4. Call Ingredient Agents → Parse and classify
5. Call Image Agent → Download and optimize
6. Aggregate results
7. Return to Convex
```

---

### 2. Recon Agent

**Role:** Analyzes the target URL to determine the best extraction strategy.

**Responsibilities:**
- Fetch page headers and initial HTML
- Detect schema.org Recipe markup
- Identify known recipe site patterns
- Check for anti-scraping measures
- Recommend extraction strategy

**Input:**
```typescript
interface ReconRequest {
  url: string;
}
```

**Output:**
```typescript
interface ReconResult {
  siteType: 'schema_org' | 'known_site' | 'unknown' | 'blocked';
  siteName?: string;  // e.g., "allrecipes", "seriouseats"
  hasSchemaRecipe: boolean;
  antiScrapingDetected: boolean;
  recommendedExtractor: string;
  headers: {
    contentType: string;
    serverType?: string;
  };
  confidence: number;
}
```

**Detection Patterns:**
```typescript
const KNOWN_SITES = {
  'allrecipes.com': 'allrecipes',
  'seriouseats.com': 'seriouseats',
  'bonappetit.com': 'bonappetit',
  'epicurious.com': 'epicurious',
  'foodnetwork.com': 'foodnetwork',
  'food52.com': 'food52',
  'smittenkitchen.com': 'smittenkitchen',
  'budgetbytes.com': 'budgetbytes',
};
```

---

### 3. Extraction Agents (3 variants)

#### 3a. Schema Extractor Agent

**Role:** Extracts recipe data from schema.org JSON-LD or microdata.

**Input:** Raw HTML with schema.org markup

**Output:** Structured recipe data

**Implementation:**
```typescript
interface SchemaRecipe {
  '@type': 'Recipe';
  name: string;
  image?: string | string[];
  recipeIngredient: string[];
  recipeInstructions: (string | { text: string })[];
  prepTime?: string;  // ISO 8601 duration
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
  nutrition?: object;
}
```

**Confidence:** High (95%+) - structured data is reliable

---

#### 3b. Site-Specific Extractor Agent

**Role:** Uses custom selectors for known recipe sites.

**Site Configurations:**
```typescript
const SITE_CONFIGS = {
  allrecipes: {
    title: 'h1.headline',
    ingredients: '.ingredients-section li',
    instructions: '.instructions-section li',
    prepTime: '.prep-time-amount',
    cookTime: '.cook-time-amount',
    servings: '.serves-amount',
    image: '.recipe-image img',
  },
  seriouseats: {
    title: 'h1.heading__title',
    ingredients: '.structured-ingredients__list-item',
    instructions: '.structured-project__steps li',
    // ...
  },
  // Additional site configs...
};
```

**Confidence:** Medium-High (85-95%) - depends on site stability

---

#### 3c. Generic HTML Extractor Agent

**Role:** Fallback extractor using heuristics and pattern matching.

**Strategies:**
1. Look for common class names: `ingredient`, `instruction`, `recipe`
2. Find largest ordered list after a heading containing "instruction"
3. Find unordered lists with measurement patterns (cups, tbsp, etc.)
4. Use text density analysis to find recipe content

**Confidence:** Medium (70-85%) - may require manual correction

---

### 4. Ingredient Agents (3 variants)

#### 4a. Quantity Parser Agent

**Role:** Extracts quantity, unit, and item from ingredient strings.

**Input:**
```typescript
"2 1/2 cups all-purpose flour, sifted"
```

**Output:**
```typescript
{
  original: "2 1/2 cups all-purpose flour, sifted",
  quantity: 2.5,
  unit: "cups",
  item: "all-purpose flour",
  preparation: "sifted",
  confidence: 0.95
}
```

**Parsing Patterns:**
```typescript
const PATTERNS = {
  // Fractions: 1/2, 1/4, 3/4
  fraction: /(\d+)\/(\d+)/,
  // Mixed: 2 1/2, 1 3/4
  mixed: /(\d+)\s+(\d+)\/(\d+)/,
  // Decimal: 2.5, 0.75
  decimal: /(\d+\.?\d*)/,
  // Ranges: 2-3, 2 to 3
  range: /(\d+)\s*[-–to]\s*(\d+)/,
  // Units
  units: /(cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|ml|liters?|pinch|dash|cloves?|cans?|packages?|bunche?s?)/i,
};
```

---

#### 4b. Unit Normalizer Agent

**Role:** Standardizes units for consistent scaling and aggregation.

**Conversion Map:**
```typescript
const UNIT_CONVERSIONS = {
  // Volume
  'tbsp': { standard: 'tablespoon', ml: 15 },
  'tsp': { standard: 'teaspoon', ml: 5 },
  'c': { standard: 'cup', ml: 240 },
  'cup': { standard: 'cup', ml: 240 },
  'fl oz': { standard: 'fluid_ounce', ml: 30 },
  
  // Weight
  'oz': { standard: 'ounce', g: 28.35 },
  'lb': { standard: 'pound', g: 453.6 },
  'g': { standard: 'gram', g: 1 },
  'kg': { standard: 'kilogram', g: 1000 },
  
  // Count-based (no conversion)
  'clove': { standard: 'clove', countable: true },
  'can': { standard: 'can', countable: true },
  'package': { standard: 'package', countable: true },
};
```

---

#### 4c. Ingredient Classifier Agent

**Role:** Categorizes ingredients for shopping list organization.

**Categories:**
```typescript
enum IngredientCategory {
  PRODUCE = 'produce',
  MEAT_SEAFOOD = 'meat_seafood',
  DAIRY = 'dairy',
  BAKERY = 'bakery',
  PANTRY = 'pantry',
  FROZEN = 'frozen',
  CANNED = 'canned',
  SPICES = 'spices',
  CONDIMENTS = 'condiments',
  BEVERAGES = 'beverages',
  OTHER = 'other',
}
```

**Classification Approach:**
```typescript
// Option 1: Keyword matching (fast, less accurate)
const CATEGORY_KEYWORDS = {
  produce: ['lettuce', 'tomato', 'onion', 'garlic', 'carrot', 'potato', ...],
  meat_seafood: ['chicken', 'beef', 'pork', 'salmon', 'shrimp', ...],
  dairy: ['milk', 'cheese', 'butter', 'cream', 'yogurt', ...],
  // ...
};

// Option 2: LLM classification (slower, more accurate)
// Use Claude/GPT to classify unknown ingredients
```

---

### 5. Image Agent

**Role:** Downloads, validates, and optimizes recipe images.

**Responsibilities:**
- Download image from source URL
- Validate image (is it actually food?)
- Resize to standard dimensions
- Compress for mobile
- Generate thumbnail
- Upload to storage (Convex file storage or S3)

**Output:**
```typescript
interface ImageResult {
  originalUrl: string;
  storedUrl: string;
  thumbnailUrl: string;
  dimensions: { width: number; height: number };
  sizeBytes: number;
  format: 'jpeg' | 'png' | 'webp';
}
```

**Image Specs:**
```typescript
const IMAGE_SPECS = {
  full: { maxWidth: 1200, maxHeight: 800, quality: 85 },
  thumbnail: { width: 200, height: 200, quality: 80 },
  format: 'webp', // Best compression for mobile
};
```

---

### 6. Meal Intelligence Agent

**Role:** Provides smart features for meal planning and shopping.

**Capabilities:**

#### Shopping List Aggregation
```typescript
// Input: Multiple recipes with ingredients
// Output: Consolidated shopping list

interface AggregatedItem {
  ingredient: string;
  totalQuantity: number;
  unit: string;
  category: IngredientCategory;
  sources: { recipeId: string; quantity: number }[];
}

// Example: Two recipes both need onions
// Recipe A: 1 onion
// Recipe B: 2 onions
// Result: { ingredient: "onion", totalQuantity: 3, unit: "whole", ... }
```

#### Substitution Suggestions
```typescript
interface SubstitutionRequest {
  ingredient: string;
  reason: 'dietary' | 'allergy' | 'unavailable' | 'preference';
  dietaryRestrictions?: string[];
}

interface SubstitutionResult {
  original: string;
  suggestions: {
    substitute: string;
    ratio: string;  // e.g., "1:1", "use half"
    notes: string;
    confidence: number;
  }[];
}
```

#### Nutritional Estimation
```typescript
interface NutritionEstimate {
  servings: number;
  perServing: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  confidence: number;
  source: 'schema' | 'estimated' | 'usda_lookup';
}
```

---

## Communication Protocol

### Message Format

All agents communicate using a standard message envelope:

```typescript
interface AgentMessage {
  id: string;
  timestamp: string;
  source: string;      // Agent ID
  target: string;      // Agent ID or 'orchestrator'
  type: 'request' | 'response' | 'error';
  payload: any;
  metadata: {
    correlationId: string;  // Links related messages
    ttl?: number;           // Time to live in ms
    priority?: 'low' | 'normal' | 'high';
  };
}
```

### Error Handling

```typescript
interface AgentError {
  code: string;
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
  fallbackAgent?: string;
}

const ERROR_CODES = {
  EXTRACTION_FAILED: { retryable: true, fallback: 'generic_extractor' },
  SITE_BLOCKED: { retryable: false },
  TIMEOUT: { retryable: true },
  RATE_LIMITED: { retryable: true, retryAfterMs: 60000 },
  INVALID_URL: { retryable: false },
  NO_RECIPE_FOUND: { retryable: false },
};
```

---

## Implementation Options

### Option A: Function-Based (Recommended for MVP → Post-MVP)

Simple functions that can be refactored into services later:

```typescript
// orchestrator.ts
export async function extractRecipe(url: string): Promise<Recipe> {
  const recon = await reconAgent(url);
  
  let rawRecipe;
  if (recon.hasSchemaRecipe) {
    rawRecipe = await schemaExtractor(url);
  } else if (recon.siteName) {
    rawRecipe = await siteExtractor(url, recon.siteName);
  } else {
    rawRecipe = await genericExtractor(url);
  }
  
  const ingredients = await parseIngredients(rawRecipe.ingredients);
  const image = await processImage(rawRecipe.imageUrl);
  
  return buildRecipe(rawRecipe, ingredients, image);
}
```

**Pros:** Simple, easy to test, no infrastructure overhead  
**Cons:** All runs in single process, harder to scale independently

---

### Option B: Queue-Based Microservices

Separate services communicating via message queue:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Convex     │────▶│   Redis     │◀───▶│ Orchestrator│
│  Action     │     │   Queue     │     │   Service   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
             ┌─────────────┐           ┌─────────────┐           ┌─────────────┐
             │   Recon     │           │  Extractor  │           │  Ingredient │
             │   Service   │           │   Service   │           │   Service   │
             └─────────────┘           └─────────────┘           └─────────────┘
```

**Pros:** Independent scaling, fault isolation, can use different languages  
**Cons:** Infrastructure complexity, network latency, harder to debug

---

### Option C: LLM-Orchestrated Agents

Use Claude/GPT as the orchestrator with tool use:

```typescript
const tools = [
  { name: 'fetch_page', description: 'Fetch HTML from URL' },
  { name: 'extract_schema', description: 'Extract schema.org data' },
  { name: 'parse_html', description: 'Parse recipe from HTML selectors' },
  { name: 'parse_ingredient', description: 'Parse ingredient string' },
  { name: 'classify_ingredient', description: 'Categorize ingredient' },
  { name: 'download_image', description: 'Download and process image' },
];

// Claude decides which tools to call and in what order
const result = await claude.complete({
  system: "You are a recipe extraction agent...",
  tools,
  messages: [{ role: 'user', content: `Extract recipe from: ${url}` }],
});
```

**Pros:** Flexible, handles edge cases well, self-correcting  
**Cons:** Higher latency, API costs, less predictable

---

## Recommended Rollout Plan

### Phase 1: MVP (Weeks 1-10)
- Single extraction function (Option A)
- Schema.org + 5 major site extractors
- Basic ingredient parsing
- No subagent architecture

### Phase 2: Post-MVP (Months 2-3)
- Refactor into function-based agents
- Add Recon Agent for smarter routing
- Add Ingredient Classifier for shopping lists
- Add Image Agent for optimization

### Phase 3: Scale (Months 4-6)
- Move to queue-based architecture if needed
- Add LLM fallback for unknown sites
- Add Meal Intelligence Agent
- Add substitution and nutrition features

---

## Metrics & Monitoring

### Agent Performance Metrics

```typescript
interface AgentMetrics {
  agentId: string;
  requestCount: number;
  successRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
  errorsByType: Record<string, number>;
}
```

### Extraction Quality Metrics

```typescript
interface QualityMetrics {
  siteAccuracy: Record<string, number>;  // Per-site success rate
  fieldCompleteness: {
    title: number;      // % of extractions with title
    ingredients: number;
    instructions: number;
    image: number;
    prepTime: number;
    servings: number;
  };
  userCorrections: number;  // Manual edits after extraction
}
```

---

## Summary

| Agent | Priority | MVP | Post-MVP |
|-------|----------|-----|----------|
| Orchestrator | P0 | Simple function | Queue coordinator |
| Recon Agent | P1 | Basic detection | Full analysis |
| Schema Extractor | P0 | ✅ | ✅ |
| Site-Specific Extractor | P0 | Top 5 sites | 20+ sites |
| Generic Extractor | P1 | Basic heuristics | LLM-enhanced |
| Quantity Parser | P0 | ✅ | ✅ |
| Unit Normalizer | P1 | Basic | Full conversion |
| Ingredient Classifier | P2 | — | ✅ |
| Image Agent | P1 | Basic download | Full optimization |
| Meal Intelligence | P2 | — | ✅ |

This architecture gives you a clear path from simple MVP to sophisticated multi-agent system as your needs grow.
