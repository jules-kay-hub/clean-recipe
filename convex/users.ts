// convex/users.ts
// User management functions with Clerk authentication

import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ═══════════════════════════════════════════════════════════════════════════
// AUTH HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Require authentication and return the user ID
 * Throws an error if not authenticated
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token_identifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    throw new Error("User not found. Please sign in again.");
  }

  return user._id;
}

/**
 * Get authenticated user or null (for optional auth scenarios)
 */
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_token_identifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get or create user from Clerk identity
 * Called after successful Clerk authentication
 */
export const getOrCreateFromClerk = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user exists by token identifier
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token_identifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .first();

    if (existingUser) {
      // Update last active timestamp
      await ctx.db.patch(existingUser._id, {
        lastActiveAt: Date.now(),
        // Update profile info from Clerk in case it changed
        name: identity.name ?? existingUser.name,
        avatarUrl: identity.pictureUrl ?? existingUser.avatarUrl,
        email: identity.email ?? existingUser.email,
      });
      return existingUser;
    }

    // Create new user from Clerk identity
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? "",
      name: identity.name ?? undefined,
      avatarUrl: identity.pictureUrl ?? undefined,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      preferences: {
        defaultServings: 4,
        theme: "system",
        measurementSystem: "imperial",
      },
    });

    return await ctx.db.get(userId);
  },
});

/**
 * @deprecated Use getOrCreateFromClerk instead
 * Get or create a demo user for testing (no auth required)
 * Kept for backwards compatibility during migration
 */
export const getOrCreateDemoUser = mutation({
  args: {},
  handler: async (ctx) => {
    const demoEmail = "demo@cleanrecipe.app";

    // Check if demo user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", demoEmail))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Create demo user with required Clerk fields (dummy values)
    const userId = await ctx.db.insert("users", {
      clerkId: "demo_user",
      tokenIdentifier: "demo|demo@cleanrecipe.app",
      email: demoEmail,
      name: "Demo User",
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      preferences: {
        defaultServings: 4,
        theme: "system",
        measurementSystem: "imperial",
      },
    });

    return await ctx.db.get(userId);
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current authenticated user
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthenticatedUser(ctx);
  },
});

/**
 * Check if current user is authenticated
 */
export const isAuthenticated = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity !== null;
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE UPDATES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Update user's last active timestamp
 */
export const updateLastActive = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    await ctx.db.patch(userId, {
      lastActiveAt: Date.now(),
    });
  },
});

/**
 * Update user preferences
 */
export const updatePreferences = mutation({
  args: {
    defaultServings: v.optional(v.number()),
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
    ),
    measurementSystem: v.optional(
      v.union(v.literal("metric"), v.literal("imperial"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const currentPrefs = user.preferences || {};
    await ctx.db.patch(userId, {
      preferences: {
        ...currentPrefs,
        ...(args.defaultServings !== undefined && {
          defaultServings: args.defaultServings,
        }),
        ...(args.theme !== undefined && { theme: args.theme }),
        ...(args.measurementSystem !== undefined && {
          measurementSystem: args.measurementSystem,
        }),
      },
    });

    return await ctx.db.get(userId);
  },
});

/**
 * Update user profile
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    await ctx.db.patch(userId, {
      ...(args.name !== undefined && { name: args.name }),
    });

    return await ctx.db.get(userId);
  },
});
