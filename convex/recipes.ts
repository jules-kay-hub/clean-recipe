// convex/recipes.ts
// Recipe queries and mutations with cache-first architecture

import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all recipes for the current user
 * Supports both authenticated users and demo user (via userId param)
 */
export const list = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { userId }) => {
    // If userId provided (demo mode), use it directly
    if (userId) {
      return await ctx.db
        .query("recipes")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }

    // Otherwise, try authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

/**
 * Get a single recipe by ID
 */
export const getById = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/**
 * Search recipes by title
 */
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
      .first();

    if (!user) return [];

    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const searchLower = query.toLowerCase();
    return recipes.filter((r) => r.title.toLowerCase().includes(searchLower));
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL QUERIES (for use by actions)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if user already has this recipe (by URL hash)
 */
export const getByUrlHash = internalQuery({
  args: { userId: v.id("users"), urlHash: v.string() },
  handler: async (ctx, { userId, urlHash }) => {
    return await ctx.db
      .query("recipes")
      .withIndex("by_user_url", (q) => q.eq("userId", userId).eq("urlHash", urlHash))
      .first();
  },
});

/**
 * Check global cache for any extraction of this URL
 */
export const getGlobalByUrlHash = internalQuery({
  args: { urlHash: v.string() },
  handler: async (ctx, { urlHash }) => {
    return await ctx.db
      .query("recipes")
      .withIndex("by_url_hash", (q) => q.eq("urlHash", urlHash))
      .first();
  },
});

/**
 * Get recipe by ID (internal)
 */
export const getByIdInternal = internalQuery({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/**
 * Get user by ID
 */
export const getUserById = internalQuery({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/**
 * Delete recipe by ID (internal - for testing/admin)
 */
export const deleteByIdInternal = internalMutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});


// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Delete a recipe
 */
export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const recipe = await ctx.db.get(id);
    if (!recipe) throw new Error("Recipe not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
      .first();

    if (!user || recipe.userId !== user._id) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(id);
  },
});

/**
 * Update recipe (for user edits)
 */
export const update = mutation({
  args: {
    id: v.id("recipes"),
    title: v.optional(v.string()),
    ingredients: v.optional(
      v.array(
        v.object({
          text: v.string(),
          quantity: v.optional(v.number()),
          unit: v.optional(v.string()),
          item: v.optional(v.string()),
          preparation: v.optional(v.string()),
          category: v.optional(v.string()),
        })
      )
    ),
    instructions: v.optional(v.array(v.string())),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const recipe = await ctx.db.get(id);
    if (!recipe) throw new Error("Recipe not found");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
      .first();

    if (!user || recipe.userId !== user._id) {
      throw new Error("Not authorized");
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, {
      ...filteredUpdates,
      userModified: true,
    });

    return await ctx.db.get(id);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL MUTATIONS (for use by actions)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Save a newly extracted recipe
 */
export const saveRecipe = internalMutation({
  args: {
    userId: v.id("users"),
    sourceUrl: v.string(),
    urlHash: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(
      v.object({
        text: v.string(),
        quantity: v.optional(v.number()),
        unit: v.optional(v.string()),
        item: v.optional(v.string()),
        preparation: v.optional(v.string()),
        category: v.optional(v.string()),
      })
    ),
    instructions: v.array(v.string()),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    totalTime: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
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
    extractionConfidence: v.optional(v.number()),
    extractorUsed: v.optional(v.string()),
    agentsUsed: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("recipes", {
      ...args,
      extractedAt: Date.now(),
      originalServings: args.servings,
    });
  },
});

/**
 * Copy a recipe from global cache to user's collection
 */
export const copyToUser = internalMutation({
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
      .withIndex("by_user_url", (q) =>
        q.eq("userId", userId).eq("urlHash", source.urlHash)
      )
      .first();

    if (existing) return existing._id;

    // Copy to user's collection (excluding _id and _creationTime)
    const { _id, _creationTime, userId: _originalUserId, ...recipeData } = source;

    return await ctx.db.insert("recipes", {
      ...recipeData,
      userId,
      extractedAt: Date.now(),
    });
  },
});

/**
 * Update recipe after re-extraction
 */
export const updateFromExtraction = internalMutation({
  args: {
    id: v.id("recipes"),
    title: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(
      v.object({
        text: v.string(),
        quantity: v.optional(v.number()),
        unit: v.optional(v.string()),
        item: v.optional(v.string()),
        preparation: v.optional(v.string()),
        category: v.optional(v.string()),
      })
    ),
    instructions: v.array(v.string()),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    totalTime: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    extractionConfidence: v.optional(v.number()),
    extractorUsed: v.optional(v.string()),
    agentsUsed: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      extractedAt: Date.now(),
      userModified: false,
    });
    return id;
  },
});
