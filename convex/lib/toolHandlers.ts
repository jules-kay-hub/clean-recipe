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
  SavedRecipe,
} from "./types";
import { hashUrl, decodeHtmlEntities } from "./utils";

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
): Promise<{ found: boolean; recipe?: SavedRecipe; source?: string }> {
  const urlHash = hashUrl(url);

  // Check user's personal cache
  const userCached = await ctx.runQuery(internal.recipes.getByUrlHash, {
    userId,
    urlHash,
  });

  if (userCached) {
    return { found: true, recipe: userCached as SavedRecipe, source: "user_cache" };
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

    if (recipe) {
      return { found: true, recipe: recipe as SavedRecipe, source: "global_cache" };
    }
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

// Helper to extract instruction text from various schema.org formats
function extractInstructionText(inst: unknown): string | null {
  if (typeof inst === "string") return inst;
  if (typeof inst !== "object" || inst === null) return null;

  const instObj = inst as Record<string, unknown>;

  // Skip HowToSection - these contain nested steps, not direct text
  if (instObj["@type"] === "HowToSection") {
    return null;
  }

  // HowToStep - most common format
  if (instObj["@type"] === "HowToStep") {
    return String(instObj.text || instObj.name || "");
  }

  // Object with text property (but not a section)
  if (instObj.text && typeof instObj.text === "string") {
    return instObj.text;
  }

  // Object with name property (less common, and only if no @type that indicates nesting)
  if (!instObj["@type"] && instObj.name && typeof instObj.name === "string") {
    return instObj.name;
  }

  return null;
}

// Flatten nested instruction structures (HowToSection, itemListElement, etc.)
function flattenInstructions(items: unknown[]): string[] {
  const results: string[] = [];

  for (const item of items) {
    // Try to extract directly as a step
    const text = extractInstructionText(item);
    if (text) {
      results.push(text);
      continue;
    }

    // Handle HowToSection containing itemListElement
    if (typeof item === "object" && item !== null) {
      const itemObj = item as Record<string, unknown>;

      // HowToSection with itemListElement (nested steps)
      if (itemObj["@type"] === "HowToSection" && Array.isArray(itemObj.itemListElement)) {
        // Skip section name - just extract the actual steps
        results.push(...flattenInstructions(itemObj.itemListElement));
        continue;
      }

      // Generic itemListElement (without HowToSection wrapper)
      if (Array.isArray(itemObj.itemListElement)) {
        results.push(...flattenInstructions(itemObj.itemListElement));
        continue;
      }

      // Array of steps directly
      if (Array.isArray(itemObj.steps)) {
        results.push(...flattenInstructions(itemObj.steps));
        continue;
      }
    }
  }

  return results.filter(Boolean);
}

// ═══════════════════════════════════════════════════════════════════════════
// PASSIVE TIME EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract passive/inactive time from recipe instructions
 * Looks for patterns like "let rise for 2 hours", "chill for 30 minutes", etc.
 * Returns total passive time in minutes
 */
function extractPassiveTimeFromInstructions(instructions: string[]): number {
  if (!instructions || instructions.length === 0) return 0;

  const text = instructions.join(" ").toLowerCase();
  let totalMinutes = 0;

  // Patterns for passive time (action + duration)
  const passivePatterns = [
    // Rising/proofing (bread, dough)
    /(?:let\s+)?(?:rise|proof|ferment)\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,
    /(?:allow|leave)\s+(?:to\s+)?(?:rise|proof)\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Resting
    /(?:let\s+)?rest\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,
    /(?:let\s+)?(?:it\s+)?sit\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,
    /(?:let\s+)?stand\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Chilling/refrigerating
    /(?:chill|refrigerate|cool)\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,
    /(?:in\s+(?:the\s+)?(?:fridge|refrigerator))\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Marinating
    /marinate\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Soaking
    /soak\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Freezing
    /freeze\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Setting (for desserts)
    /(?:let\s+)?set\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Cooling
    /(?:let\s+)?cool\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,

    // Generic waiting
    /(?:wait|leave)\s+(?:for\s+)?(?:at\s+least\s+)?(\d+(?:\s*(?:to|-)\s*\d+)?)\s*(hours?|minutes?|mins?|hrs?)/gi,
  ];

  // Track matched spans to avoid double-counting
  const matchedSpans: Array<{ start: number; end: number }> = [];

  for (const pattern of passivePatterns) {
    let match;
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      const matchStart = match.index;
      const matchEnd = match.index + match[0].length;

      // Check for overlap with previous matches
      const overlaps = matchedSpans.some(
        (span) =>
          (matchStart >= span.start && matchStart < span.end) ||
          (matchEnd > span.start && matchEnd <= span.end)
      );

      if (!overlaps) {
        matchedSpans.push({ start: matchStart, end: matchEnd });
        const minutes = parsePassiveTimeToMinutes(match[1], match[2]);
        totalMinutes += minutes;
      }
    }
  }

  // Special case: "overnight" without specific hours (assume 8 hours)
  if (text.includes("overnight") && totalMinutes < 480) {
    const overnightPatterns = [
      /(?:chill|refrigerate|rest|rise|proof|marinate|soak|sit|stand|ferment)\s+overnight/i,
      /overnight\s+(?:in\s+(?:the\s+)?(?:fridge|refrigerator)|chilling|rest)/i,
      /leave\s+overnight/i,
      /let\s+(?:it\s+)?(?:sit|rest|rise)\s+overnight/i,
    ];

    for (const pattern of overnightPatterns) {
      if (pattern.test(text) && totalMinutes < 480) {
        totalMinutes = Math.max(totalMinutes, 480); // 8 hours minimum
        break;
      }
    }
  }

  // Special case: long hours mentioned in context of fridge/refrigerator
  const longHoursMatch = text.match(
    /(\d+)\s*hours?\s*(?:\(|in\s+(?:the\s+)?(?:fridge|refrigerator))/gi
  );
  if (longHoursMatch) {
    for (const match of longHoursMatch) {
      const hoursMatch = match.match(/\d+/);
      const hours = hoursMatch ? parseInt(hoursMatch[0]) : 0;
      if (hours >= 8) {
        totalMinutes = Math.max(totalMinutes, hours * 60);
      }
    }
  }

  return totalMinutes;
}

/**
 * Parse time string to minutes
 * Handles ranges like "1 to 2 hours" by taking the minimum
 */
function parsePassiveTimeToMinutes(timeValue: string, unit: string): number {
  const rangeMatch = timeValue.match(/(\d+)\s*(?:to|-)\s*(\d+)/);
  let value: number;

  if (rangeMatch) {
    value = Math.min(parseInt(rangeMatch[1]), parseInt(rangeMatch[2]));
  } else {
    value = parseInt(timeValue);
  }

  const unitLower = unit.toLowerCase();
  if (
    unitLower.startsWith("hour") ||
    unitLower === "hrs" ||
    unitLower === "hr"
  ) {
    return value * 60;
  }

  return value; // Default to minutes
}

function parseSchemaRecipe(schema: SchemaRecipe): Recipe {
  // Parse instructions - handles various schema.org formats
  let instructions: string[] = [];
  if (schema.recipeInstructions) {
    if (Array.isArray(schema.recipeInstructions)) {
      instructions = flattenInstructions(schema.recipeInstructions);
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
    (text: string) => ({ text: decodeHtmlEntities(text) })
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

  // Decode instructions for return and passive time extraction
  const decodedInstructions = instructions.filter(Boolean).map(decodeHtmlEntities);

  // Extract passive/inactive time from instructions
  const inactiveTime = extractPassiveTimeFromInstructions(decodedInstructions);

  return {
    title: decodeHtmlEntities(schema.name || "Untitled Recipe"),
    description: schema.description ? decodeHtmlEntities(schema.description) : undefined,
    ingredients,
    instructions: decodedInstructions,
    servings: parseServings(schema.recipeYield),
    prepTime: parseTime(schema.prepTime),
    cookTime: parseTime(schema.cookTime),
    totalTime: parseTime(schema.totalTime),
    inactiveTime: inactiveTime > 0 ? inactiveTime : undefined,
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

  // Classify ingredient into category
  const category = handleClassifyIngredient(item || ingredientText);

  return {
    text: ingredientText,
    quantity,
    unit,
    item,
    preparation,
    category,
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
    "black pepper", "white pepper", "pepper flakes", "peppercorn",
    "garlic powder", "onion powder", "chipotle powder", "chili powder",
    "cumin", "paprika", "cinnamon", "nutmeg", "oregano", "cayenne",
    "basil", "thyme", "rosemary", "bay leaf", "curry", "turmeric",
    "seasoning", "spice", "powder",
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

  // Check categories in priority order (more specific first)
  // This prevents "onion" matching before "onion powder"
  const categoryOrder: IngredientCategory[] = [
    "spices",      // Check spices first (onion powder, garlic powder, etc.)
    "canned",      // Check canned goods (canned tomatoes, etc.)
    "condiments",
    "dairy",
    "meat_seafood",
    "bakery",
    "frozen",
    "beverages",
    "pantry",
    "produce",     // Check produce last (has generic terms like onion, garlic)
    "other",
  ];

  for (const category of categoryOrder) {
    const keywords = CATEGORY_KEYWORDS[category];
    // Sort keywords by length (longest first) to match more specific terms
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    for (const keyword of sortedKeywords) {
      if (lower.includes(keyword)) {
        return category;
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
    inactiveTime: recipe.inactiveTime,
    imageUrl: recipe.imageUrl,
    thumbnailUrl: recipe.thumbnailUrl,
    nutrition: recipe.nutrition,
    extractionConfidence: recipe.confidence,
    extractorUsed: recipe.extractorUsed,
    agentsUsed: recipe.agentsUsed,
  });
}
