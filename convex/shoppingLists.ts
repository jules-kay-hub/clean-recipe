// convex/shoppingLists.ts
// Generate shopping lists from meal plans

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { handleClassifyIngredient } from "./lib/toolHandlers";

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
  | "canned"
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
        // Classify ingredient if category is missing or "other"
        const category = (ing.category && ing.category !== "other")
          ? (ing.category as IngredientCategory)
          : handleClassifyIngredient(item);

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

    // Get custom items from saved shopping list
    const savedList = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user_week", (q) =>
        q.eq("userId", userId).eq("weekStart", startDate)
      )
      .first();

    // Merge custom items into aggregated
    if (savedList?.customItems) {
      for (const customItem of savedList.customItems) {
        const unit = normalizeUnit(customItem.unit);
        const key = ingredientKey(customItem.ingredient, unit);
        // Classify ingredient if category is missing or "other"
        const category = (customItem.category && customItem.category !== "other")
          ? (customItem.category as IngredientCategory)
          : handleClassifyIngredient(customItem.ingredient);

        if (aggregated.has(key)) {
          const existing = aggregated.get(key)!;
          existing.quantity += customItem.quantity || 1;
          if (customItem.recipeTitle) {
            existing.recipes.add(customItem.recipeTitle);
          }
        } else {
          aggregated.set(key, {
            ingredient: customItem.ingredient,
            quantity: customItem.quantity || 1,
            unit: unit,
            category: category,
            recipes: customItem.recipeTitle ? new Set([customItem.recipeTitle]) : new Set(),
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
      customItemCount: savedList?.customItems?.length || 0,
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

/**
 * Add a recipe's ingredients to the shopping list
 */
export const addRecipeToList = mutation({
  args: {
    weekStart: v.string(),
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, { weekStart, recipeId }) => {
    const userId = await getOrCreateUserId(ctx);

    // Fetch the recipe
    const recipe = await ctx.db.get(recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    // Get or create shopping list for this week
    let shoppingList = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user_week", (q) =>
        q.eq("userId", userId).eq("weekStart", weekStart)
      )
      .first();

    const now = Date.now();

    // Build custom items from recipe ingredients with proper categorization
    const newItems = recipe.ingredients.map((ing) => {
      const ingredientName = ing.item || ing.text;
      // Classify the ingredient if it doesn't have a category or is "other"
      const category = (ing.category && ing.category !== "other")
        ? ing.category
        : handleClassifyIngredient(ingredientName);

      return {
        ingredient: ingredientName,
        quantity: ing.quantity,
        unit: ing.unit,
        category,
        recipeId: recipeId,
        recipeTitle: recipe.title,
        addedAt: now,
      };
    });

    if (shoppingList) {
      // Merge with existing custom items
      const existingItems = shoppingList.customItems || [];
      await ctx.db.patch(shoppingList._id, {
        customItems: [...existingItems, ...newItems],
        updatedAt: now,
      });
      return shoppingList._id;
    } else {
      // Create new shopping list with custom items
      return await ctx.db.insert("shoppingLists", {
        userId,
        weekStart,
        checkedItems: [],
        customItems: newItems,
        updatedAt: now,
      });
    }
  },
});

/**
 * Remove an item from the shopping list (custom items only)
 */
export const removeItem = mutation({
  args: {
    weekStart: v.string(),
    ingredientKey: v.string(), // "ingredient|unit" key
  },
  handler: async (ctx, { weekStart, ingredientKey }) => {
    const userId = await getOrCreateUserId(ctx);

    const shoppingList = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user_week", (q) =>
        q.eq("userId", userId).eq("weekStart", weekStart)
      )
      .first();

    if (!shoppingList || !shoppingList.customItems) {
      return;
    }

    // Remove items matching the key
    const [ingredientName, unit] = ingredientKey.split("|");
    const filteredItems = shoppingList.customItems.filter((item) => {
      const itemKey = `${item.ingredient.toLowerCase().trim()}|${item.unit || ""}`;
      return itemKey !== ingredientKey;
    });

    // Also remove from checked items
    const filteredChecked = shoppingList.checkedItems.filter(
      (key) => key !== ingredientKey
    );

    await ctx.db.patch(shoppingList._id, {
      customItems: filteredItems,
      checkedItems: filteredChecked,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Clear all custom items from the shopping list
 */
export const clearCustomItems = mutation({
  args: {
    weekStart: v.string(),
  },
  handler: async (ctx, { weekStart }) => {
    const userId = await getOrCreateUserId(ctx);

    const shoppingList = await ctx.db
      .query("shoppingLists")
      .withIndex("by_user_week", (q) =>
        q.eq("userId", userId).eq("weekStart", weekStart)
      )
      .first();

    if (!shoppingList) return;

    await ctx.db.patch(shoppingList._id, {
      customItems: [],
      updatedAt: Date.now(),
    });
  },
});
