// convex/schema.ts
// Julienned Database Schema with Cache-First Architecture

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ═══════════════════════════════════════════════════════════════════════════
  // RECIPES TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  recipes: defineTable({
    // Ownership
    userId: v.id("users"),

    // Cache keys
    sourceUrl: v.string(),
    urlHash: v.string(), // SHA256 hash of normalized URL for fast lookup

    // Core recipe data
    title: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(
      v.object({
        text: v.string(), // Original text: "2 cups flour, sifted"
        quantity: v.optional(v.number()), // 2
        unit: v.optional(v.string()), // "cups"
        item: v.optional(v.string()), // "flour"
        preparation: v.optional(v.string()), // "sifted"
        category: v.optional(v.string()), // "pantry"
      })
    ),
    instructions: v.array(v.string()),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()), // Minutes (active hands-on time)
    cookTime: v.optional(v.number()), // Minutes (active cooking time)
    totalTime: v.optional(v.number()), // Minutes (from source, may exclude passive time)
    inactiveTime: v.optional(v.number()), // Minutes (passive time: rising, chilling, marinating)

    // Media
    imageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),

    // Nutrition (if available)
    nutrition: v.optional(
      v.object({
        calories: v.optional(v.number()),
        protein: v.optional(v.number()),
        carbs: v.optional(v.number()),
        fat: v.optional(v.number()),
        fiber: v.optional(v.number()),
        sodium: v.optional(v.number()),
      })
    ),

    // Extraction metadata
    extractedAt: v.number(),
    extractionConfidence: v.optional(v.number()), // 0-1
    extractorUsed: v.optional(v.string()), // "schema", "site_specific", "generic", "llm"
    agentsUsed: v.optional(v.array(v.string())),

    // User modifications
    userModified: v.optional(v.boolean()),
    originalServings: v.optional(v.number()), // For scaling reference
  })
    .index("by_user", ["userId"])
    .index("by_url_hash", ["urlHash"]) // Global cache lookup
    .index("by_user_url", ["userId", "urlHash"]) // User-specific lookup
    .index("by_user_created", ["userId", "extractedAt"]), // Recent recipes

  // ═══════════════════════════════════════════════════════════════════════════
  // USERS TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  users: defineTable({
    // Clerk Authentication (optional for migration from demo user)
    clerkId: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),

    // Profile
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),

    // Preferences
    preferences: v.optional(
      v.object({
        defaultServings: v.optional(v.number()),
        theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
        measurementSystem: v.optional(v.union(v.literal("metric"), v.literal("imperial"))),
      })
    ),

    // Metadata
    createdAt: v.number(),
    lastActiveAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_token_identifier", ["tokenIdentifier"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // MEAL PLANS TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  mealPlans: defineTable({
    userId: v.id("users"),
    date: v.string(), // ISO date: "2026-01-13"
    meals: v.array(
      v.object({
        slot: v.union(
          v.literal("breakfast"),
          v.literal("lunch"),
          v.literal("dinner"),
          v.literal("snack")
        ),
        recipeId: v.id("recipes"),
        servings: v.optional(v.number()), // Override recipe servings
      })
    ),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]), // Also used for date range queries

  // ═══════════════════════════════════════════════════════════════════════════
  // SHOPPING LISTS TABLE
  // Stores checked state and custom items for shopping lists
  // ═══════════════════════════════════════════════════════════════════════════
  shoppingLists: defineTable({
    userId: v.id("users"),
    weekStart: v.string(), // ISO date of week start: "2026-01-13"
    checkedItems: v.array(v.string()), // Array of ingredient keys that are checked
    // Custom items added directly (not from meal plans)
    customItems: v.optional(v.array(
      v.object({
        ingredient: v.string(),
        quantity: v.optional(v.number()),
        unit: v.optional(v.string()),
        category: v.string(),
        recipeId: v.optional(v.id("recipes")), // Source recipe if added from recipe
        recipeTitle: v.optional(v.string()),
        addedAt: v.number(),
      })
    )),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_week", ["userId", "weekStart"]),

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRACTION JOBS TABLE (for tracking async extractions)
  // ═══════════════════════════════════════════════════════════════════════════
  extractionJobs: defineTable({
    userId: v.id("users"),
    url: v.string(),
    urlHash: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    recipeId: v.optional(v.id("recipes")), // Set on completion
    error: v.optional(
      v.object({
        code: v.string(),
        message: v.string(),
        retryable: v.boolean(),
      })
    ),
    attempts: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_url_hash", ["urlHash"])
    .index("by_status", ["status"]),
});
