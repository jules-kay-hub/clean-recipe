// convex/lib/toolHandlers.ts
// Implementation of extraction tools for LLM orchestrator (Option C)

import { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import {
  ParsedIngredient,
  IngredientCategory,
  FetchResult,
  Recipe,
} from "./types";
import { hashUrl } from "./utils";

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA.ORG RECIPE TYPE
// ═══════════════════════════════════════════════════════════════════════════

interface SchemaRecipe {
  "@type"?: string;
  name?: string;
  description?: string;
  recipeIngredient?: string[];
  recipeInstructions?: string | unknown[];
  recipeYield?: string | number;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  image?: unknown;
  nutrition?: {
    calories?: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fatContent?: string;
    fiberContent?: string;
    sodiumContent?: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHE HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function handleCheckCache(
  ctx: ActionCtx,
  userId: Id<"users">,
  url: string
): Promise<{ found: boolean; recipe?: Recipe; source?: string }> {
  const urlHash = hashUrl(url);

  // Check user's personal cache
  const userCached = await ctx.runQuery(internal.recipes.getByUrlHash, {
    userId,
    urlHash,
  });

  if (userCached) {
    return { found: true, recipe: userCached, source: "user_cache" };
  }

  // Check global cache
  const globalCached = await ctx.runQuery(internal.recipes.getGlobalByUrlHash, {
    urlHash,
  });

  if (globalCached) {
    // Copy to user's collection
    const recipeId = await ctx.runMutation(internal.recipes.copyToUser, {
      userId,
      sourceRecipeId: globalCached._id,
    });

    const recipe = await ctx.runQuery(internal.recipes.getByIdInternal, {
      id: recipeId,
    });

    return { found: true, recipe, source: "global_cache" };
  }

  return { found: false };
}

// ═══════════════════════════════════════════════════════════════════════════
// FETCH HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function handleFetchPage(
  url: string,
  customHeaders?: Record<string, string>
): Promise<FetchResult> {
  try {
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      ...customHeaders,
    };

    const response = await fetch(url, {
      headers,
      redirect: "follow",
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };
    }

    const html = await response.text();
    const contentType = response.headers.get("content-type") || "";

    return {
      success: true,
      html,
      statusCode: response.status,
      contentType,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Fetch failed",
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA.ORG EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

export function handleExtractSchema(html: string): Recipe | null {
  // Find JSON-LD script tags
  const jsonLdRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonContent = match[1].trim();
      const data = JSON.parse(jsonContent);

      // Handle array of schemas
      const schemas = Array.isArray(data) ? data : [data];

      for (const schema of schemas) {
        // Check for @graph structure
        const items = schema["@graph"] || [schema];

        for (const item of items) {
          if (item["@type"] === "Recipe" || item["@type"]?.includes("Recipe")) {
            return parseSchemaRecipe(item);
          }
        }
      }
    } catch {
      // Continue to next script tag
      continue;
    }
  }

  // Try microdata (itemtype="http://schema.org/Recipe")
  // This is a simplified check - full microdata parsing would be more complex
  if (html.includes('itemtype="http://schema.org/Recipe"')) {
    // Would need a proper microdata parser here
    return null;
  }

  return null;
}

function parseSchemaRecipe(schema: SchemaRecipe): Recipe {
  // Parse instructions
  let instructions: string[] = [];
  if (schema.recipeInstructions) {
    if (Array.isArray(schema.recipeInstructions)) {
      instructions = schema.recipeInstructions.map((inst: unknown) => {
        if (typeof inst === "string") return inst;
        if (typeof inst === "object" && inst !== null) {
          const instObj = inst as Record<string, unknown>;
          if (instObj.text) return String(instObj.text);
          if (instObj["@type"] === "HowToStep") return String(instObj.text || instObj.name || "");
        }
        return String(inst);
      });
    } else if (typeof schema.recipeInstructions === "string") {
      // Split on newlines or numbered patterns
      instructions = schema.recipeInstructions
        .split(/\n|(?=\d+\.\s)/)
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }

  // Parse ingredients
  const ingredients: ParsedIngredient[] = (schema.recipeIngredient || []).map(
    (text: string) => ({ text })
  );

  // Parse time (ISO 8601 duration to minutes)
  const parseTime = (duration: string | undefined): number | undefined => {
    if (!duration) return undefined;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (match) {
      const hours = parseInt(match[1] || "0");
      const minutes = parseInt(match[2] || "0");
      return hours * 60 + minutes;
    }
    return undefined;
  };

  // Parse yield/servings
  const parseServings = (yield_: unknown): number | undefined => {
    if (typeof yield_ === "number") return yield_;
    if (typeof yield_ === "string") {
      const match = yield_.match(/(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    }
    return undefined;
  };

  // Get image URL
  const getImageUrl = (image: unknown): string | undefined => {
    if (!image) return undefined;
    if (typeof image === "string") return image;
    if (Array.isArray(image)) return image[0] as string;
    if (typeof image === "object" && image !== null && "url" in image) {
      return (image as { url: string }).url;
    }
    return undefined;
  };

  return {
    title: schema.name || "Untitled Recipe",
    description: schema.description,
    ingredients,
    instructions: instructions.filter(Boolean),
    servings: parseServings(schema.recipeYield),
    prepTime: parseTime(schema.prepTime),
    cookTime: parseTime(schema.cookTime),
    totalTime: parseTime(schema.totalTime),
    imageUrl: getImageUrl(schema.image),
    nutrition: schema.nutrition
      ? {
          calories: schema.nutrition.calories ? parseInt(schema.nutrition.calories) : undefined,
          protein: schema.nutrition.proteinContent ? parseInt(schema.nutrition.proteinContent) : undefined,
          carbs: schema.nutrition.carbohydrateContent ? parseInt(schema.nutrition.carbohydrateContent) : undefined,
          fat: schema.nutrition.fatContent ? parseInt(schema.nutrition.fatContent) : undefined,
          fiber: schema.nutrition.fiberContent ? parseInt(schema.nutrition.fiberContent) : undefined,
          sodium: schema.nutrition.sodiumContent ? parseInt(schema.nutrition.sodiumContent) : undefined,
        }
      : undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SITE-SPECIFIC EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

interface SiteConfig {
  title: string;
  ingredients: string;
  instructions: string;
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  image?: string;
}

const SITE_CONFIGS: Record<string, SiteConfig> = {
  allrecipes: {
    title: "h1.headline",
    ingredients: ".mntl-structured-ingredients__list-item",
    instructions: ".mntl-sc-block-group--LI p",
    prepTime: ".mntl-recipe-details__label:contains('Prep') + .mntl-recipe-details__value",
    cookTime: ".mntl-recipe-details__label:contains('Cook') + .mntl-recipe-details__value",
    servings: ".mntl-recipe-details__label:contains('Servings') + .mntl-recipe-details__value",
    image: ".primary-image__image",
  },
  seriouseats: {
    title: "h1.heading__title",
    ingredients: ".structured-ingredients__list-item",
    instructions: ".mntl-sc-block-group--LI p",
    image: ".primary-image img",
  },
  // Add more site configs as needed
};

export function handleExtractWithSelectors(
  html: string,
  siteName: string
): Recipe | null {
  const config = SITE_CONFIGS[siteName];
  if (!config) return null;

  // Note: In a real implementation, you'd use a proper HTML parser like cheerio
  // This is a simplified example showing the structure

  // For now, fall back to schema extraction if available
  const schemaRecipe = handleExtractSchema(html);
  if (schemaRecipe) return schemaRecipe;

  // Would implement actual CSS selector extraction here
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

export function handleExtractGeneric(html: string): Recipe | null {
  // Try schema first
  const schemaRecipe = handleExtractSchema(html);
  if (schemaRecipe) return schemaRecipe;

  // Heuristic extraction would go here
  // Look for:
  // - Lists with measurement patterns (cups, tbsp, etc.)
  // - Ordered lists after "instructions" or "directions" headings
  // - Common class names: ingredient, instruction, recipe

  // This is a fallback - in production, you might use an LLM to extract directly
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// INGREDIENT PARSING
// ═══════════════════════════════════════════════════════════════════════════

const UNIT_PATTERNS =
  /^(cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|pinch|dash|cloves?|cans?|packages?|bunche?s?|slices?|pieces?|heads?|stalks?|sprigs?|leaves?)\.?$/i;

const FRACTION_MAP: Record<string, number> = {
  "½": 0.5,
  "⅓": 0.333,
  "⅔": 0.667,
  "¼": 0.25,
  "¾": 0.75,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

export function handleParseIngredient(ingredientText: string): ParsedIngredient {
  let text = ingredientText.trim();
  let quantity: number | undefined;
  let unit: string | undefined;
  let preparation: string | undefined;

  // Extract preparation (after comma)
  const commaIndex = text.lastIndexOf(",");
  if (commaIndex > 0) {
    preparation = text.slice(commaIndex + 1).trim();
    text = text.slice(0, commaIndex).trim();
  }

  // Replace unicode fractions
  for (const [frac, val] of Object.entries(FRACTION_MAP)) {
    if (text.includes(frac)) {
      text = text.replace(frac, val.toString());
    }
  }

  // Parse quantity
  const quantityMatch = text.match(
    /^(\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?(?:\s+\d+\/\d+)?|\d+\/\d+)\s*/
  );

  if (quantityMatch) {
    const qStr = quantityMatch[1];
    text = text.slice(quantityMatch[0].length).trim();

    // Handle fractions
    if (qStr.includes("/")) {
      const parts = qStr.split(/\s+/);
      let total = 0;
      for (const part of parts) {
        if (part.includes("/")) {
          const [num, den] = part.split("/").map(Number);
          total += num / den;
        } else {
          total += Number(part);
        }
      }
      quantity = total;
    } else if (qStr.includes("-") || qStr.includes("–")) {
      // Range: take the first number
      const rangeMatch = qStr.match(/(\d+(?:\.\d+)?)/);
      quantity = rangeMatch ? Number(rangeMatch[1]) : undefined;
    } else {
      quantity = Number(qStr);
    }
  }

  // Parse unit
  const words = text.split(/\s+/);
  if (words.length > 0 && UNIT_PATTERNS.test(words[0])) {
    unit = words[0].toLowerCase().replace(/\.$/, "");
    text = words.slice(1).join(" ").trim();
  }

  // Remaining text is the item
  const item = text;

  return {
    text: ingredientText,
    quantity,
    unit,
    item,
    preparation,
  };
}

export function handleParseIngredientsBatch(
  ingredients: string[]
): ParsedIngredient[] {
  return ingredients.map(handleParseIngredient);
}

// ═══════════════════════════════════════════════════════════════════════════
// INGREDIENT CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORY_KEYWORDS: Record<IngredientCategory, string[]> = {
  produce: [
    "lettuce", "tomato", "onion", "garlic", "carrot", "potato", "celery",
    "pepper", "cucumber", "spinach", "kale", "broccoli", "cauliflower",
    "mushroom", "zucchini", "squash", "corn", "peas", "beans", "lemon",
    "lime", "orange", "apple", "banana", "berry", "avocado", "herb",
    "basil", "cilantro", "parsley", "mint", "rosemary", "thyme", "ginger",
  ],
  meat_seafood: [
    "chicken", "beef", "pork", "lamb", "turkey", "bacon", "sausage",
    "ham", "steak", "ground", "salmon", "tuna", "shrimp", "fish",
    "crab", "lobster", "scallop", "cod", "tilapia", "anchovy",
  ],
  dairy: [
    "milk", "cheese", "butter", "cream", "yogurt", "sour cream",
    "cottage cheese", "ricotta", "mozzarella", "parmesan", "cheddar",
    "egg", "eggs",
  ],
  bakery: [
    "bread", "roll", "bun", "bagel", "croissant", "tortilla", "pita",
    "naan", "baguette",
  ],
  pantry: [
    "flour", "sugar", "salt", "oil", "vinegar", "rice", "pasta",
    "noodle", "cereal", "oat", "quinoa", "lentil", "chickpea",
    "bean", "nut", "seed", "honey", "syrup", "vanilla", "baking",
  ],
  frozen: ["frozen", "ice cream"],
  canned: ["canned", "tomato sauce", "tomato paste", "broth", "stock", "coconut milk"],
  spices: [
    "pepper", "cumin", "paprika", "cinnamon", "nutmeg", "oregano",
    "basil", "thyme", "rosemary", "bay leaf", "curry", "turmeric",
    "chili", "cayenne", "garlic powder", "onion powder",
  ],
  condiments: [
    "ketchup", "mustard", "mayo", "mayonnaise", "soy sauce", "hot sauce",
    "worcestershire", "bbq", "salsa", "sriracha", "ranch", "dressing",
  ],
  beverages: ["juice", "wine", "beer", "coffee", "tea", "water", "soda"],
  other: [],
};

export function handleClassifyIngredient(ingredient: string): IngredientCategory {
  const lower = ingredient.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category as IngredientCategory;
      }
    }
  }

  return "other";
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE HANDLING
// ═══════════════════════════════════════════════════════════════════════════

export async function handleDownloadImage(
  imageUrl: string,
  _skipThumbnail: boolean = false
): Promise<{ imageUrl: string; thumbnailUrl?: string } | null> {
  // In a real implementation, this would:
  // 1. Download the image
  // 2. Validate it's actually an image
  // 3. Resize to max dimensions
  // 4. Generate thumbnail
  // 5. Upload to Convex file storage or S3
  // 6. Return the new URLs

  // For now, just return the original URL
  // This would be replaced with actual image processing
  try {
    const response = await fetch(imageUrl, { method: "HEAD" });
    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.startsWith("image/")) {
        return { imageUrl };
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SAVE RECIPE
// ═══════════════════════════════════════════════════════════════════════════

export async function handleSaveRecipe(
  ctx: ActionCtx,
  userId: Id<"users">,
  url: string,
  recipe: Recipe & { confidence?: number; extractorUsed?: string; agentsUsed?: string[] }
): Promise<Id<"recipes">> {
  const urlHash = hashUrl(url);

  return await ctx.runMutation(internal.recipes.saveRecipe, {
    userId,
    sourceUrl: url,
    urlHash,
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    imageUrl: recipe.imageUrl,
    thumbnailUrl: recipe.thumbnailUrl,
    nutrition: recipe.nutrition,
    extractionConfidence: recipe.confidence,
    extractorUsed: recipe.extractorUsed,
    agentsUsed: recipe.agentsUsed,
  });
}
