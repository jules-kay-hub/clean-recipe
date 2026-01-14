// convex/shoppingLists.ts
// Generate shopping lists from meal plans

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get user ID (creates anonymous user if needed)
async function getOrCreateUserId(ctx: { db: any }): Promise<Id<"users">> {
  const existingUser = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("email"), "demo@cleanrecipe.app"))
    .first();

  if (existingUser) {
    return existingUser._id;
  }

  return await ctx.db.insert("users", {
    email: "demo@cleanrecipe.app",
    name: "Demo User",
    createdAt: Date.now(),
  });
}

// Ingredient category type
type IngredientCategory =
  | "produce"
  | "meat_seafood"
  | "dairy"
  | "bakery"
  | "pantry"
  | "frozen"
  | "spices"
  | "condiments"
  | "beverages"
  | "other";

// Shopping list item structure
interface ShoppingItem {
  id: string;
  ingredient: string;
  quantity?: number;
  unit?: string;
  category: IngredientCategory;
  recipes: string[];
}

// Normalize units for aggregation
function normalizeUnit(unit: string | undefined): string {
  if (!unit) return "";
  const normalized = unit.toLowerCase().trim();

  // Map common variations
  const unitMap: Record<string, string> = {
    "tablespoon": "tbsp",
    "tablespoons": "tbsp",
    "tbsps": "tbsp",
    "teaspoon": "tsp",
    "teaspoons": "tsp",
    "tsps": "tsp",
    "cup": "cups",
    "ounce": "oz",
    "ounces": "oz",
    "pound": "lbs",
    "pounds": "lbs",
    "lb": "lbs",
    "clove": "cloves",
  };

  return unitMap[normalized] || normalized;
}

// Create a key for ingredient aggregation
function ingredientKey(item: string, unit: string): string {
  return `${item.toLowerCase().trim()}|${unit}`;
}

/**
 * Generate shopping list from meal plans for a date range
 */
export const generateFromMealPlans = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, { startDate, endDate }) => {
    const userId = await getOrCreateUserId(ctx);

    // Get all meal plans for the date range
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

    // Collect all recipe IDs and their info
    const recipeIds = new Set<string>();
    const mealRecipeMap: Map<string, { date: string; slot: string }[]> = new Map();

    for (const plan of mealPlans) {
      for (const meal of plan.meals) {
        const recipeIdStr = meal.recipeId.toString();
        recipeIds.add(recipeIdStr);

        if (!mealRecipeMap.has(recipeIdStr)) {
          mealRecipeMap.set(recipeIdStr, []);
        }
        mealRecipeMap.get(recipeIdStr)!.push({
          date: plan.date,
          slot: meal.slot,
        });
      }
    }

    // Fetch all recipes
    const recipes: Map<string, any> = new Map();
    for (const recipeIdStr of recipeIds) {
      try {
        const recipe = await ctx.db.get(recipeIdStr as Id<"recipes">);
        if (recipe) {
          recipes.set(recipeIdStr, recipe);
        }
      } catch (e) {
        // Skip invalid recipe IDs
        console.error("Failed to fetch recipe:", recipeIdStr, e);
      }
    }

    // Aggregate ingredients
    const aggregated: Map<string, {
      ingredient: string;
      quantity: number;
      unit: string;
      category: IngredientCategory;
      recipes: Set<string>;
    }> = new Map();

    for (const [recipeIdStr, recipe] of recipes) {
      if (!recipe.ingredients) continue;

      for (const ing of recipe.ingredients) {
        const item = ing.item || ing.text || "";
        if (!item) continue;

        const unit = normalizeUnit(ing.unit);
        const key = ingredientKey(item, unit);
        const category = (ing.category as IngredientCategory) || "other";

        if (aggregated.has(key)) {
          const existing = aggregated.get(key)!;
          existing.quantity += ing.quantity || 1;
          existing.recipes.add(recipe.title);
        } else {
          aggregated.set(key, {
            ingredient: ing.item || ing.text,
            quantity: ing.quantity || 1,
            unit: unit,
            category: category,
            recipes: new Set([recipe.title]),
          });
        }
      }
    }

    // Convert to array format
    const items: ShoppingItem[] = [];
    let id = 1;

    for (const [_, agg] of aggregated) {
      items.push({
        id: String(id++),
        ingredient: agg.ingredient,
        quantity: agg.quantity > 0 ? agg.quantity : undefined,
        unit: agg.unit || undefined,
        category: agg.category,
        recipes: Array.from(agg.recipes),
      });
    }

    // Sort by category, then by ingredient name
    const categoryOrder: IngredientCategory[] = [
      "produce",
      "meat_seafood",
      "dairy",
      "bakery",
      "pantry",
      "frozen",
      "spices",
      "condiments",
      "beverages",
      "other",
    ];

    items.sort((a, b) => {
      const catA = categoryOrder.indexOf(a.category);
      const catB = categoryOrder.indexOf(b.category);
      if (catA !== catB) return catA - catB;
      return a.ingredient.localeCompare(b.ingredient);
    });

    return {
      items,
      recipeCount: recipes.size,
      mealCount: Array.from(mealPlans).reduce((sum, p) => sum + p.meals.length, 0),
    };
  },
});

/**
 * Get saved shopping list with checked state
 */
export const getSaved = query({
  args: {
    weekStart: v.string(),
  },
  handler: async (ctx, { weekStart }) => {
    const userId = await getOrCreateUserId(ctx);

    const saved = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user_week", (q) =>
        q.eq("userId", userId).eq("weekStart", weekStart)
      )
      .first();

    return saved;
  },
});

/**
 * Save checked items state
 */
export const saveCheckedItems = mutation({
  args: {
    weekStart: v.string(),
    checkedItems: v.array(v.string()),
  },
  handler: async (ctx, { weekStart, checkedItems }) => {
    const userId = await getOrCreateUserId(ctx);

    const existing = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user_week", (q) =>
        q.eq("userId", userId).eq("weekStart", weekStart)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        checkedItems,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("shoppingLists", {
        userId,
        weekStart,
        checkedItems,
        updatedAt: Date.now(),
      });
    }
  },
});
