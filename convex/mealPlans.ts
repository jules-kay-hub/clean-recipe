// convex/mealPlans.ts
// Meal planning CRUD operations with authentication

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth } from "./users";

/**
 * Get meal plan for a specific date
 */
export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const userId = await requireAuth(ctx);

    const mealPlan = await ctx.db
      .query("mealPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", date)
      )
      .first();

    if (!mealPlan) {
      return { date, meals: [] };
    }

    // Fetch recipe details for each meal
    const mealsWithRecipes = await Promise.all(
      mealPlan.meals.map(async (meal) => {
        const recipe = await ctx.db.get(meal.recipeId);
        return {
          ...meal,
          recipeName: recipe?.title || "Unknown Recipe",
          recipeImage: recipe?.imageUrl,
        };
      })
    );

    return {
      ...mealPlan,
      meals: mealsWithRecipes,
    };
  },
});

/**
 * Get meal plans for a date range (for weekly view)
 */
export const getByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, { startDate, endDate }) => {
    const userId = await requireAuth(ctx);

    const mealPlans = await ctx.db
      .query("mealPlans")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();

    // Create a map of date -> meals with recipe details
    const result: Record<string, any> = {};

    for (const plan of mealPlans) {
      const mealsWithRecipes = await Promise.all(
        plan.meals.map(async (meal) => {
          const recipe = await ctx.db.get(meal.recipeId);
          return {
            ...meal,
            recipeName: recipe?.title || "Unknown Recipe",
            recipeImage: recipe?.imageUrl,
          };
        })
      );
      result[plan.date] = mealsWithRecipes;
    }

    return result;
  },
});

/**
 * Set a meal for a specific date and slot
 */
export const setMeal = mutation({
  args: {
    date: v.string(),
    slot: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack")
    ),
    recipeId: v.id("recipes"),
    servings: v.optional(v.number()),
  },
  handler: async (ctx, { date, slot, recipeId, servings }) => {
    const userId = await requireAuth(ctx);

    // Check if meal plan exists for this date
    const existingPlan = await ctx.db
      .query("mealPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", date)
      )
      .first();

    const newMeal = { slot, recipeId, servings };

    if (existingPlan) {
      // Update existing plan - remove old meal for this slot and add new one
      const updatedMeals = existingPlan.meals.filter((m) => m.slot !== slot);
      updatedMeals.push(newMeal);

      await ctx.db.patch(existingPlan._id, {
        meals: updatedMeals,
      });

      return existingPlan._id;
    } else {
      // Create new plan for this date
      return await ctx.db.insert("mealPlans", {
        userId,
        date,
        meals: [newMeal],
      });
    }
  },
});

/**
 * Remove a meal from a specific date and slot
 */
export const removeMeal = mutation({
  args: {
    date: v.string(),
    slot: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack")
    ),
  },
  handler: async (ctx, { date, slot }) => {
    const userId = await requireAuth(ctx);

    const existingPlan = await ctx.db
      .query("mealPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", date)
      )
      .first();

    if (!existingPlan) {
      return null;
    }

    const updatedMeals = existingPlan.meals.filter((m) => m.slot !== slot);

    if (updatedMeals.length === 0) {
      // Delete the plan if no meals left
      await ctx.db.delete(existingPlan._id);
    } else {
      await ctx.db.patch(existingPlan._id, {
        meals: updatedMeals,
      });
    }

    return existingPlan._id;
  },
});

/**
 * Clear all meal plans for the user
 */
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const allPlans = await ctx.db
      .query("mealPlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const plan of allPlans) {
      await ctx.db.delete(plan._id);
    }

    return { deleted: allPlans.length };
  },
});

/**
 * Copy a day's meal plan to another day
 */
export const copyDay = mutation({
  args: {
    sourceDate: v.string(),
    targetDate: v.string(),
  },
  handler: async (ctx, { sourceDate, targetDate }) => {
    const userId = await requireAuth(ctx);

    const sourcePlan = await ctx.db
      .query("mealPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", sourceDate)
      )
      .first();

    if (!sourcePlan || sourcePlan.meals.length === 0) {
      return null;
    }

    // Check if target already has a plan
    const existingTargetPlan = await ctx.db
      .query("mealPlans")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", targetDate)
      )
      .first();

    if (existingTargetPlan) {
      // Replace target meals
      await ctx.db.patch(existingTargetPlan._id, {
        meals: sourcePlan.meals,
      });
      return existingTargetPlan._id;
    } else {
      // Create new plan
      return await ctx.db.insert("mealPlans", {
        userId,
        date: targetDate,
        meals: sourcePlan.meals,
      });
    }
  },
});
