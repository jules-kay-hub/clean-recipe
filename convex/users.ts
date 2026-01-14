// convex/users.ts
// User management functions

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get or create a demo user for testing (no auth required)
 * In production, this would be replaced with proper authentication
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

    // Create demo user
    const userId = await ctx.db.insert("users", {
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

/**
 * Get current user (for authenticated scenarios)
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
      .first();
  },
});

/**
 * Update user's last active timestamp
 */
export const updateLastActive = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, {
      lastActiveAt: Date.now(),
    });
  },
});
