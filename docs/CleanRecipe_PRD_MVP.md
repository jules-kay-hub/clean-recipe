# Product Requirements Document
## CleanRecipe: Ad-Free Recipe Extraction App

| Field | Value |
|-------|-------|
| **Version** | 1.0 (MVP) |
| **Date** | January 2026 |
| **Status** | Draft |
| **Tech Stack** | React Native, Convex, Node.js |

---

## 1. Executive Summary

CleanRecipe is a mobile application that extracts clean, ad-free recipes from any URL, delivering only ingredients and instructions. The app addresses a validated pain point: recipe websites cluttered with ads, life stories, and pop-ups that frustrate home cooks and busy parents.

The MVP focuses on three core capabilities: one-tap recipe extraction, offline access to saved recipes, and basic meal planning integration.

---

## 2. Problem Statement

### 2.1 User Pain Points

- Recipe websites are cluttered with ads, pop-ups, and auto-playing videos
- Long personal narratives before actual recipe content
- No offline access to recipes while cooking
- Existing solutions (Paprika) require manual editing
- Web-only tools (JustTheRecipe.com) lack mobile integration

### 2.2 Market Validation

Strong validation signals from target user communities:

- Reddit r/Cooking post generated massive discussion with 223+ average words per post
- MetaFilter thread received 28 favorites
- Cooking category ranks as third-highest frustration area in Reddit sentiment analysis

---

## 3. Target Users

| Persona | Characteristics | Key Needs |
|---------|-----------------|-----------|
| **Home Cook Hannah** | Ages 25-45, cooks 4-5x/week, browses recipes on phone, follows food blogs | Quick access to clean recipes, save favorites, scale ingredients |
| **Busy Parent Pat** | Ages 30-50, limited time, meal preps weekly, needs efficiency | One-tap extraction, offline access while shopping, meal planning |

---

## 4. Technical Architecture

### 4.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Mobile Frontend | React Native + Expo | Cross-platform, large ecosystem, JavaScript consistency with web |
| Database | Convex | Real-time sync, serverless, TypeScript-first, built-in auth |
| Local Storage | SQLite (Expo) | Offline-first recipe access, reliable local persistence |
| Recipe Parser | Node.js Service | Server-side parsing handles site changes, anti-scraping measures |
| Hosting | Convex + Railway | Convex for data layer, Railway for parsing microservice |

### 4.2 Data Model (Convex Schema)

Core entities stored in Convex with the following structure:

- **recipes**: id, userId, title, sourceUrl, ingredients[], instructions[], servings, prepTime, cookTime, imageUrl, createdAt, updatedAt
- **users**: id, email, name, preferences{}, createdAt
- **mealPlans**: id, userId, date, meals[{slot, recipeId}]
- **shoppingLists**: id, userId, items[{ingredient, checked, recipeId}], createdAt

---

## 5. MVP Feature Specification

### 5.1 Feature Priority Matrix

| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| One-tap URL extraction | P0 | High (2 weeks) | Critical |
| Recipe display (clean UI) | P0 | Medium (1 week) | Critical |
| Save recipes locally | P0 | Medium (1 week) | High |
| Offline access | P0 | Medium (1 week) | High |
| Ingredient scaling | P1 | Low (3 days) | Medium |
| Basic meal calendar | P1 | Medium (1 week) | Medium |
| Shopping list generation | P1 | Medium (1 week) | Medium |
| Share extension | P1 | Medium (4 days) | High |

---

## 6. User Journeys

### Journey 1: First-Time Recipe Extraction

**Persona:** Home Cook Hannah  
**Goal:** Save a clean version of a recipe found online

**User Flow:**

1. Hannah finds a recipe on a food blog while browsing on her phone
2. She copies the URL or uses the share sheet to send it to CleanRecipe
3. The app displays a loading indicator while parsing (target: <3 seconds)
4. Clean recipe appears with title, image, ingredients list, and numbered instructions
5. Hannah taps "Save" to add the recipe to her collection
6. Recipe syncs to Convex and downloads to local SQLite for offline access
7. Success confirmation appears with option to add to meal plan

**Acceptance Criteria:**

- Recipe extraction completes in under 5 seconds for 95% of supported sites
- Extracted content matches source recipe with 98%+ accuracy
- No ads, pop-ups, or narrative content appears in extracted recipe
- Recipe is accessible offline immediately after saving
- User can undo save action within 5 seconds

---

### Journey 2: Cooking with Offline Recipe

**Persona:** Busy Parent Pat  
**Goal:** Access a saved recipe while cooking without internet

**User Flow:**

1. Pat opens the app in their kitchen (may have poor connectivity)
2. App loads from local SQLite cache, showing saved recipes immediately
3. Pat searches or browses to find the desired recipe
4. Full recipe displays with ingredients and step-by-step instructions
5. Pat uses the ingredient checkbox feature to track progress
6. Screen stays awake during cooking session
7. Pat completes the recipe and optionally marks it as "cooked"

**Acceptance Criteria:**

- Saved recipes load in under 1 second regardless of network status
- All recipe content (including images) available offline
- Search works offline against locally cached recipes
- Screen wake lock activates when viewing recipe in cook mode
- Ingredient checkboxes persist state locally

---

### Journey 3: Weekly Meal Planning

**Persona:** Busy Parent Pat  
**Goal:** Plan meals for the upcoming week using saved recipes

**User Flow:**

1. Pat opens the Meal Plan tab and views the weekly calendar
2. Taps on a day/meal slot (breakfast, lunch, dinner)
3. Recipe picker shows saved recipes with search and filters
4. Pat selects a recipe to assign to that meal slot
5. Repeats for other days of the week
6. Taps "Generate Shopping List" to create aggregated ingredient list
7. Reviews and edits shopping list, checking off items already owned
8. Exports or shares shopping list for use at grocery store

**Acceptance Criteria:**

- Calendar displays current week with clear meal slot indicators
- Recipes can be assigned to any meal slot with single tap
- Shopping list automatically aggregates and deduplicates ingredients
- Quantities combine intelligently (e.g., two recipes needing onions)
- Shopping list is accessible offline after generation
- User can manually add items to shopping list

---

### Journey 4: Scaling Recipe Servings

**Persona:** Home Cook Hannah  
**Goal:** Adjust a recipe for a different number of servings

**User Flow:**

1. Hannah opens a saved recipe that serves 4 people
2. She needs to cook for 6 people for a dinner party
3. Taps the servings indicator and adjusts to 6 servings
4. All ingredient quantities automatically recalculate
5. Hannah reviews the scaled ingredients
6. Proceeds to cook with adjusted quantities
7. Can reset to original servings at any time

**Acceptance Criteria:**

- Serving size adjustable from 1 to 20 servings
- Ingredient quantities scale proportionally with appropriate rounding
- Fractional amounts display in cooking-friendly format (1/4, 1/2, 3/4)
- Original serving size always visible for reference
- Scaling works offline

---

### Journey 5: Share-to-App Quick Save

**Persona:** Home Cook Hannah  
**Goal:** Quickly save a recipe from any app using system share

**User Flow:**

1. Hannah is browsing Instagram and sees a recipe post with a link
2. She taps the share button on the post
3. Selects CleanRecipe from the share sheet options
4. CleanRecipe opens briefly, extracts the recipe in background
5. Push notification confirms save with recipe title
6. Hannah continues browsing Instagram
7. Later opens CleanRecipe to find recipe in her collection

**Acceptance Criteria:**

- Share extension available for iOS and Android
- Background extraction completes within 10 seconds
- User receives notification on success or failure
- Duplicate URL detection prevents redundant saves
- Failed extractions queued for retry with user notification

---

## 7. Functional Requirements

### 7.1 Recipe Extraction Engine

- Support schema.org Recipe structured data (primary parsing method)
- Fallback to HTML pattern matching for sites without structured data
- Extract: title, ingredients, instructions, prep time, cook time, servings, nutrition (if available)
- Download and cache recipe images locally
- Handle common anti-scraping measures (rate limiting, user-agent requirements)
- Support major recipe sites: AllRecipes, Food Network, Epicurious, Bon Appetit, Serious Eats, NYT Cooking (paywall-limited)

### 7.2 Data Synchronization

- Convex handles real-time sync between devices
- Local SQLite serves as offline-first cache
- Conflict resolution: last-write-wins with timestamp
- Sync queue for offline changes
- Delta sync for bandwidth efficiency

### 7.3 User Authentication

- Email/password authentication via Convex Auth
- Social login: Google, Apple (required for iOS App Store)
- Anonymous/guest mode with local-only storage
- Account linking for guest-to-registered conversion

---

## 8. Non-Functional Requirements

### 8.1 Performance

- App launch to interactive: <2 seconds
- Recipe extraction: <5 seconds (95th percentile)
- Local recipe load: <500ms
- Search results: <200ms for local queries
- Target app size: <50MB

### 8.2 Reliability

- Recipe extraction success rate: >90% for supported sites
- Offline functionality: 100% for saved content
- Data sync reliability: 99.9% when online
- Crash-free sessions: >99.5%

### 8.3 Security

- All API communications over HTTPS
- User credentials never stored locally (token-based auth)
- Personal data encrypted at rest in Convex
- GDPR-compliant data export and deletion

---

## 9. Success Metrics

| Metric | Target (3 months) | Measurement |
|--------|-------------------|-------------|
| Monthly Active Users | 5,000 | Convex analytics |
| Recipes Extracted/User | 10+ | Average per active user |
| Day 7 Retention | >30% | Cohort analysis |
| Extraction Success Rate | >90% | Server logs |
| App Store Rating | 4.5+ stars | App Store / Play Store |
| NPS Score | >50 | In-app survey |

---

## 10. MVP Development Timeline

| Week | Deliverables | Dependencies |
|------|--------------|--------------|
| 1-2 | Project setup, Convex schema, auth flow, basic app shell | None |
| 3-4 | Recipe extraction service, URL input, parsing logic | Project setup |
| 5-6 | Recipe display UI, save functionality, SQLite integration | Extraction service |
| 7 | Offline mode, sync logic, ingredient scaling | Recipe display |
| 8 | Meal planning calendar, shopping list generation | Core features |
| 9 | Share extension (iOS/Android), polish, bug fixes | Core features |
| 10 | Testing, App Store submission, soft launch | All features |

---

## 11. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Recipe sites block scraping | High | Rotate user agents, respect robots.txt, rate limit requests, maintain site-specific parsers |
| Extraction accuracy issues | Medium | Prioritize schema.org sites, build feedback loop for failed extractions, allow manual editing |
| Copyright/legal concerns | Medium | Store for personal use only, link back to source, consult legal counsel |
| App store rejection | Low | Follow guidelines strictly, prepare appeal documentation, test on multiple devices |
| Performance on older devices | Medium | Test on 3-year-old devices, optimize image loading, lazy load content |

---

## 12. Future Considerations (Post-MVP)

- Recipe collections and tagging system
- Nutritional information display and filtering
- Social features: sharing, public profiles, recipe ratings
- Grocery store integration for shopping list delivery
- Voice-guided cooking mode
- Subscription tier with premium features
- Web app companion for desktop access
- Recipe import from photos using OCR/AI

---

## Appendix A: Convex Schema Definition

The following TypeScript schema defines the Convex database structure:

```typescript
// schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    sourceUrl: v.string(),
    ingredients: v.array(v.object({
      text: v.string(),
      quantity: v.optional(v.number()),
      unit: v.optional(v.string()),
    })),
    instructions: v.array(v.string()),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
  }).index("by_user", ["userId"]),

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
      slot: v.string(),
      recipeId: v.id("recipes"),
    })),
  }).index("by_user_date", ["userId", "date"]),

  shoppingLists: defineTable({
    userId: v.id("users"),
    items: v.array(v.object({
      ingredient: v.string(),
      checked: v.boolean(),
      recipeId: v.optional(v.id("recipes")),
    })),
  }).index("by_user", ["userId"]),
});
```

---

*End of Document*
