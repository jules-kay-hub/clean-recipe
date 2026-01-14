// convex/lib/llmTools.ts
// Tool definitions for LLM-Orchestrated extraction (Option C)

import { LLMTool } from "./types";

/**
 * Tools available to the LLM orchestrator for recipe extraction
 */
export const EXTRACTION_TOOLS: LLMTool[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // CACHE TOOL
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: "check_recipe_cache",
    description:
      "Check if a recipe URL has already been extracted and cached. ALWAYS call this first before attempting to fetch or extract. Returns the cached recipe if found, or null if not cached.",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The recipe URL to check in the cache",
        },
      },
      required: ["url"],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH TOOLS
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: "fetch_page",
    description:
      "Fetch the HTML content of a web page. The HTML is stored internally and automatically available to extract_schema_recipe, extract_with_selectors, and extract_generic tools. Returns metadata about the fetch (status, content type, html length) but NOT the raw HTML (to save tokens).",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL to fetch",
        },
        headers: {
          type: "object",
          description: "Optional custom headers to send with the request",
        },
      },
      required: ["url"],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EXTRACTION TOOLS
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: "extract_schema_recipe",
    description:
      "Extract recipe data from schema.org JSON-LD or microdata markup. This is the most reliable extraction method when available. The HTML from the previous fetch_page call is automatically used - you do NOT need to pass html. Returns structured recipe data or null if no schema.org recipe found.",
    input_schema: {
      type: "object",
      properties: {
        html: {
          type: "string",
          description: "Optional - HTML is automatically available from fetch_page. Only pass this if you have HTML from another source.",
        },
      },
      required: [],
    },
  },
  {
    name: "extract_with_selectors",
    description:
      "Extract recipe data using CSS selectors for a known recipe site. Use this when schema.org is not available but we know the site structure. The HTML from fetch_page is automatically used.",
    input_schema: {
      type: "object",
      properties: {
        html: {
          type: "string",
          description: "Optional - HTML is automatically available from fetch_page.",
        },
        siteName: {
          type: "string",
          description:
            "The known site name (e.g., 'allrecipes', 'seriouseats') to use appropriate selectors",
        },
      },
      required: ["siteName"],
    },
  },
  {
    name: "extract_generic",
    description:
      "Extract recipe data using heuristics and pattern matching. Use this as a fallback when schema.org and known site selectors are not available. The HTML from fetch_page is automatically used.",
    input_schema: {
      type: "object",
      properties: {
        html: {
          type: "string",
          description: "Optional - HTML is automatically available from fetch_page.",
        },
      },
      required: [],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INGREDIENT PARSING TOOLS
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: "parse_ingredient",
    description:
      "Parse a single ingredient string into structured data (quantity, unit, item, preparation). Example: '2 cups flour, sifted' -> {quantity: 2, unit: 'cups', item: 'flour', preparation: 'sifted'}",
    input_schema: {
      type: "object",
      properties: {
        ingredientText: {
          type: "string",
          description: "The ingredient text to parse",
        },
      },
      required: ["ingredientText"],
    },
  },
  {
    name: "parse_ingredients_batch",
    description:
      "Parse multiple ingredient strings at once. More efficient than calling parse_ingredient multiple times.",
    input_schema: {
      type: "object",
      properties: {
        ingredients: {
          type: "array",
          items: { type: "string" },
          description: "Array of ingredient texts to parse",
        },
      },
      required: ["ingredients"],
    },
  },
  {
    name: "classify_ingredient",
    description:
      "Classify an ingredient into a shopping category (produce, dairy, meat_seafood, pantry, etc.)",
    input_schema: {
      type: "object",
      properties: {
        ingredient: {
          type: "string",
          description: "The ingredient name to classify",
        },
      },
      required: ["ingredient"],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // IMAGE TOOLS
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: "download_image",
    description:
      "Download and process a recipe image. Resizes, compresses, and generates a thumbnail. Returns URLs for the processed images.",
    input_schema: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          description: "The URL of the image to download",
        },
        skipThumbnail: {
          type: "boolean",
          description: "Skip thumbnail generation (default: false)",
        },
      },
      required: ["imageUrl"],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SAVE TOOL
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: "save_recipe",
    description:
      "Save the extracted recipe to the database. Call this after successful extraction with all the parsed data.",
    input_schema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The original recipe URL",
        },
        title: {
          type: "string",
          description: "Recipe title",
        },
        description: {
          type: "string",
          description: "Recipe description (optional)",
        },
        ingredients: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              quantity: { type: "number" },
              unit: { type: "string" },
              item: { type: "string" },
              preparation: { type: "string" },
              category: { type: "string" },
            },
            required: ["text"],
          },
          description: "Parsed ingredients array",
        },
        instructions: {
          type: "array",
          items: { type: "string" },
          description: "Recipe instructions as array of steps",
        },
        servings: {
          type: "number",
          description: "Number of servings",
        },
        prepTime: {
          type: "number",
          description: "Prep time in minutes",
        },
        cookTime: {
          type: "number",
          description: "Cook time in minutes",
        },
        imageUrl: {
          type: "string",
          description: "Processed image URL",
        },
        thumbnailUrl: {
          type: "string",
          description: "Thumbnail image URL",
        },
        confidence: {
          type: "number",
          description: "Extraction confidence score (0-1)",
        },
      },
      required: ["url", "title", "ingredients", "instructions"],
    },
  },
];

/**
 * System prompt for the LLM orchestrator
 */
export const ORCHESTRATOR_SYSTEM_PROMPT = `You are a recipe extraction agent for the CleanRecipe app. Your job is to extract clean, structured recipe data from web pages.

## IMPORTANT RULES

1. **ALWAYS check the cache first** using check_recipe_cache before fetching any pages. If the recipe is cached, return it immediately without any further extraction.

2. **Follow this extraction order:**
   a. Check cache (REQUIRED FIRST STEP)
   b. Fetch the page HTML
   c. Try schema.org extraction first (most reliable)
   d. Fall back to site-specific selectors if schema.org not found
   e. Use generic extraction as last resort

3. **Parse all ingredients** using parse_ingredients_batch to get structured quantity/unit/item data.

4. **Download images** if available using download_image.

5. **Save the recipe** at the end using save_recipe with all extracted data.

## EXTRACTION PRIORITIES

- Title: Must be extracted
- Ingredients: Must be extracted with quantities when possible
- Instructions: Must be extracted as separate steps
- Servings: Extract if available
- Prep/Cook time: Extract if available
- Image: Download if available

## ERROR HANDLING

- If fetch fails, report the error
- If no recipe is found on the page, report clearly
- If extraction is partial, save what you have with lower confidence

## RESPONSE FORMAT

After extraction, summarize:
- Whether recipe was from cache or freshly extracted
- Extraction method used (schema/site-specific/generic)
- Confidence level (high/medium/low)
- Any issues encountered`;
