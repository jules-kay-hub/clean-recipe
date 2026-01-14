// convex/extraction.ts
// LLM-Orchestrated Recipe Extraction (Option C)
// Main action that uses Claude to coordinate extraction agents

import { v } from "convex/values";
import { action, ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import Anthropic from "@anthropic-ai/sdk";
import {
  ExtractionResult,
  Recipe,
  ParsedIngredient,
} from "./lib/types";
import { EXTRACTION_TOOLS, ORCHESTRATOR_SYSTEM_PROMPT } from "./lib/llmTools";
import {
  handleCheckCache,
  handleFetchPage,
  handleExtractSchema,
  handleExtractWithSelectors,
  handleExtractGeneric,
  handleParseIngredient,
  handleParseIngredientsBatch,
  handleClassifyIngredient,
  handleDownloadImage,
  handleSaveRecipe,
} from "./lib/toolHandlers";
import { hashUrl, isValidUrl } from "./lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXTRACTION ACTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract a recipe from a URL using LLM-orchestrated agents
 * This implements Option C: Claude decides which tools to call
 */
export const extractRecipe = action({
  args: {
    url: v.string(),
    userId: v.id("users"),
    options: v.optional(
      v.object({
        skipImages: v.optional(v.boolean()),
        parseNutrition: v.optional(v.boolean()),
        forceRefresh: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, { url, userId, options }): Promise<ExtractionResult> => {
    const startTime = Date.now();
    const agentsUsed: string[] = [];

    // ─────────────────────────────────────────────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────────────────────────────────────────────
    if (!isValidUrl(url)) {
      return {
        success: false,
        error: {
          code: "INVALID_URL",
          message: "Please provide a valid HTTP or HTTPS URL",
          retryable: false,
        },
        cached: false,
        metadata: {
          extractionTimeMs: Date.now() - startTime,
          source: "error",
          agentsUsed: [],
        },
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CHECK CACHE FIRST (unless forceRefresh)
    // ─────────────────────────────────────────────────────────────────────────
    if (!options?.forceRefresh) {
      const cacheResult = await handleCheckCache(ctx, userId, url);

      if (cacheResult.found) {
        return {
          success: true,
          recipe: cacheResult.recipe,
          cached: true,
          metadata: {
            extractionTimeMs: Date.now() - startTime,
            source: cacheResult.source === "user_cache" ? "user_cache" : "global_cache",
            agentsUsed: ["cache_agent"],
          },
        };
      }
    }

    agentsUsed.push("cache_agent");

    // ─────────────────────────────────────────────────────────────────────────
    // FAST PATH: Try schema.org extraction without LLM (much faster)
    // ─────────────────────────────────────────────────────────────────────────
    try {
      agentsUsed.push("fetch_agent");
      const fetchResult = await handleFetchPage(url);

      if (fetchResult.success && fetchResult.html) {
        agentsUsed.push("schema_extractor");
        const schemaRecipe = handleExtractSchema(fetchResult.html);

        if (schemaRecipe && schemaRecipe.title && schemaRecipe.ingredients.length > 0) {
          // Parse ingredients for better structure
          const parsedIngredients = handleParseIngredientsBatch(
            schemaRecipe.ingredients.map(i => i.text)
          );

          // Save the recipe
          const recipeToSave = {
            ...schemaRecipe,
            ingredients: parsedIngredients,
            confidence: 0.95,
            extractorUsed: "schema_fast_path",
            agentsUsed,
          };

          const recipeId = await handleSaveRecipe(ctx, userId, url, recipeToSave);

          // Fetch the saved recipe to return
          const savedRecipe = await ctx.runQuery(internal.recipes.getByIdInternal, {
            id: recipeId,
          });

          return {
            success: true,
            recipe: savedRecipe,
            cached: false,
            metadata: {
              extractionTimeMs: Date.now() - startTime,
              source: "fresh_extraction",
              agentsUsed,
              confidence: 0.95,
              extractorUsed: "schema_fast_path",
            },
          };
        }
      }
    } catch (fastPathError) {
      // Fast path failed, fall through to LLM orchestration
      console.log("Fast path extraction failed, falling back to LLM:", fastPathError);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LLM ORCHESTRATION (fallback for sites without schema.org)
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const anthropic = new Anthropic();

      // Context for tool execution
      const toolContext = {
        ctx,
        userId,
        url,
        fetchedHtml: null as string | null,
        extractedRecipe: null as Recipe | null,
      };

      // Start conversation with Claude
      let messages: Anthropic.MessageParam[] = [
        {
          role: "user",
          content: `Extract the recipe from this URL: ${url}

Remember to:
1. Check the cache first (already done - not found)
2. Fetch the page
3. Extract using the best available method
4. Parse all ingredients
5. Download the image if available
6. Save the recipe

Please proceed with the extraction.`,
        },
      ];

      let continueLoop = true;
      let loopCount = 0;
      const maxLoops = 10; // Safety limit

      while (continueLoop && loopCount < maxLoops) {
        loopCount++;

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: ORCHESTRATOR_SYSTEM_PROMPT,
          tools: EXTRACTION_TOOLS.map((tool) => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.input_schema as Anthropic.Tool["input_schema"],
          })),
          messages,
        });

        // Check if we're done
        if (response.stop_reason === "end_turn") {
          continueLoop = false;

          // Extract final message
          const textContent = response.content.find((c: Anthropic.ContentBlock) => c.type === "text");
          if (textContent && textContent.type === "text") {
            // Check if we have a saved recipe
            if (toolContext.extractedRecipe) {
              const recipe = await ctx.runQuery(internal.recipes.getByUrlHash, {
                userId,
                urlHash: hashUrl(url),
              });

              if (recipe) {
                return {
                  success: true,
                  recipe,
                  cached: false,
                  metadata: {
                    extractionTimeMs: Date.now() - startTime,
                    source: "fresh_extraction",
                    agentsUsed,
                    confidence: 0.9,
                    extractorUsed: "llm",
                  },
                };
              }
            }
          }
          break;
        }

        // Process tool calls
        if (response.stop_reason === "tool_use") {
          const toolUseBlocks = response.content.filter(
            (c: Anthropic.ContentBlock) => c.type === "tool_use"
          ) as Anthropic.ToolUseBlock[];

          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const toolUse of toolUseBlocks) {
            const result = await executeToolCall(
              toolUse.name,
              toolUse.input as Record<string, unknown>,
              toolContext,
              agentsUsed
            );

            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify(result),
            });
          }

          // Add assistant response and tool results to messages
          messages = [
            ...messages,
            { role: "assistant", content: response.content },
            { role: "user", content: toolResults },
          ];
        }
      }

      // If we got here without a recipe, something went wrong
      if (!toolContext.extractedRecipe) {
        return {
          success: false,
          error: {
            code: "NO_RECIPE_FOUND",
            message: "Could not extract a recipe from this URL",
            retryable: false,
          },
          cached: false,
          metadata: {
            extractionTimeMs: Date.now() - startTime,
            source: "extraction_failed",
            agentsUsed,
          },
        };
      }

      // Final check - get the saved recipe
      const savedRecipe = await ctx.runQuery(internal.recipes.getByUrlHash, {
        userId,
        urlHash: hashUrl(url),
      });

      return {
        success: true,
        recipe: savedRecipe,
        cached: false,
        metadata: {
          extractionTimeMs: Date.now() - startTime,
          source: "fresh_extraction",
          agentsUsed,
          confidence: 0.85,
          extractorUsed: "llm",
        },
      };
    } catch (error) {
      console.error("Extraction error:", error);

      return {
        success: false,
        error: {
          code: "LLM_ERROR",
          message: error instanceof Error ? error.message : "Extraction failed",
          retryable: true,
        },
        cached: false,
        metadata: {
          extractionTimeMs: Date.now() - startTime,
          source: "error",
          agentsUsed,
        },
      };
    }
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// TOOL EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

interface ToolContext {
  ctx: ActionCtx;
  userId: Id<"users">;
  url: string;
  fetchedHtml: string | null;
  extractedRecipe: Recipe | null;
}

async function executeToolCall(
  toolName: string,
  input: Record<string, unknown>,
  context: ToolContext,
  agentsUsed: string[]
): Promise<unknown> {
  agentsUsed.push(toolName);

  switch (toolName) {
    // ─────────────────────────────────────────────────────────────────────────
    case "check_recipe_cache": {
      const result = await handleCheckCache(
        context.ctx,
        context.userId,
        input.url as string
      );
      return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case "fetch_page": {
      const result = await handleFetchPage(
        input.url as string,
        input.headers as Record<string, string> | undefined
      );
      if (result.success && result.html) {
        context.fetchedHtml = result.html;
        // Don't return full HTML to Claude - it's too large!
        // Return only metadata; extraction tools will use context.fetchedHtml
        return {
          success: true,
          statusCode: result.statusCode,
          contentType: result.contentType,
          htmlLength: result.html.length,
          message: "Page fetched successfully. Use extract_schema_recipe, extract_with_selectors, or extract_generic to extract the recipe.",
        };
      }
      return {
        success: false,
        error: result.error,
        statusCode: result.statusCode,
      };
    }

    // ─────────────────────────────────────────────────────────────────────────
    case "extract_schema_recipe": {
      const html = (input.html as string) || context.fetchedHtml;
      if (!html) {
        return { success: false, error: "No HTML content available" };
      }
      const recipe = handleExtractSchema(html);
      if (recipe) {
        context.extractedRecipe = recipe;
        return { success: true, recipe };
      }
      return { success: false, error: "No schema.org recipe found" };
    }

    // ─────────────────────────────────────────────────────────────────────────
    case "extract_with_selectors": {
      const html = (input.html as string) || context.fetchedHtml;
      if (!html) {
        return { success: false, error: "No HTML content available" };
      }
      const recipe = handleExtractWithSelectors(html, input.siteName as string);
      if (recipe) {
        context.extractedRecipe = recipe;
        return { success: true, recipe };
      }
      return { success: false, error: "Could not extract with selectors" };
    }

    // ─────────────────────────────────────────────────────────────────────────
    case "extract_generic": {
      const html = (input.html as string) || context.fetchedHtml;
      if (!html) {
        return { success: false, error: "No HTML content available" };
      }
      const recipe = handleExtractGeneric(html);
      if (recipe) {
        context.extractedRecipe = recipe;
        return { success: true, recipe };
      }
      return { success: false, error: "Could not extract recipe" };
    }

    // ─────────────────────────────────────────────────────────────────────────
    case "parse_ingredient": {
      const parsed = handleParseIngredient(input.ingredientText as string);
      return { success: true, parsed };
    }

    // ─────────────────────────────────────────────────────────────────────────
    case "parse_ingredients_batch": {
      const parsed = handleParseIngredientsBatch(input.ingredients as string[]);
      return { success: true, parsed };
    }

    // ─────────────────────────────────────────────────────────────────────────
    case "classify_ingredient": {
      const category = handleClassifyIngredient(input.ingredient as string);
      return { success: true, category };
    }

    // ─────────────────────────────────────────────────────────────────────────
    case "download_image": {
      const result = await handleDownloadImage(
        input.imageUrl as string,
        input.skipThumbnail as boolean
      );
      return result
        ? { success: true, ...result }
        : { success: false, error: "Could not download image" };
    }

    // ─────────────────────────────────────────────────────────────────────────
    case "save_recipe": {
      try {
        // Build recipe object from input
        const recipe: Recipe & { confidence?: number } = {
          title: input.title as string,
          description: input.description as string | undefined,
          ingredients: (input.ingredients as ParsedIngredient[]) || [],
          instructions: (input.instructions as string[]) || [],
          servings: input.servings as number | undefined,
          prepTime: input.prepTime as number | undefined,
          cookTime: input.cookTime as number | undefined,
          imageUrl: input.imageUrl as string | undefined,
          thumbnailUrl: input.thumbnailUrl as string | undefined,
          confidence: input.confidence as number | undefined,
        };

        const recipeId = await handleSaveRecipe(
          context.ctx,
          context.userId,
          input.url as string || context.url,
          recipe
        );

        context.extractedRecipe = recipe;

        return { success: true, recipeId: recipeId.toString() };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to save recipe",
        };
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FORCE REFRESH ACTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Force re-extraction of a recipe (ignores cache)
 */
export const forceRefresh = action({
  args: {
    recipeId: v.id("recipes"),
    userId: v.id("users"),
  },
  handler: async (ctx, { recipeId, userId }): Promise<ExtractionResult> => {
    // Get existing recipe
    const recipe = await ctx.runQuery(internal.recipes.getByIdInternal, {
      id: recipeId,
    });

    if (!recipe) {
      return {
        success: false,
        error: {
          code: "NO_RECIPE_FOUND",
          message: "Recipe not found",
          retryable: false,
        },
        cached: false,
        metadata: {
          extractionTimeMs: 0,
          source: "error",
          agentsUsed: [],
        },
      };
    }

    if (recipe.userId !== userId) {
      return {
        success: false,
        error: {
          code: "NO_RECIPE_FOUND",
          message: "Not authorized",
          retryable: false,
        },
        cached: false,
        metadata: {
          extractionTimeMs: 0,
          source: "error",
          agentsUsed: [],
        },
      };
    }

    // Re-extract with forceRefresh option
    return await ctx.runAction(internal.extraction.extractRecipe, {
      url: recipe.sourceUrl,
      userId,
      options: { forceRefresh: true },
    });
  },
});
