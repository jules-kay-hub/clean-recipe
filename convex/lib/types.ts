// convex/lib/types.ts
// Type definitions for CleanRecipe

import { Id } from "../_generated/dataModel";

// ═══════════════════════════════════════════════════════════════════════════
// RECIPE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ParsedIngredient {
  text: string;
  quantity?: number;
  unit?: string;
  item?: string;
  preparation?: string;
  category?: IngredientCategory;
}

export type IngredientCategory =
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

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
}

export interface Recipe {
  title: string;
  description?: string;
  ingredients: ParsedIngredient[];
  instructions: string[];
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  nutrition?: Nutrition;
}

/**
 * Recipe with Convex database fields (after being saved/fetched)
 */
export interface SavedRecipe extends Recipe {
  _id: Id<"recipes">;
  _creationTime: number;
  userId: Id<"users">;
  sourceUrl: string;
  urlHash: string;
  extractedAt: number;
  extractionConfidence?: number;
  extractorUsed?: string;
  agentsUsed?: string[];
  userModified?: boolean;
  originalServings?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRACTION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ExtractionRequest {
  url: string;
  userId: Id<"users">;
  options?: {
    skipImages?: boolean;
    parseNutrition?: boolean;
    forceRefresh?: boolean;
  };
}

export interface ExtractionResult {
  success: boolean;
  recipe?: SavedRecipe;
  error?: ExtractionError;
  cached: boolean;
  metadata: ExtractionMetadata;
}

export interface ExtractionError {
  code: ExtractionErrorCode;
  message: string;
  retryable: boolean;
}

export type ExtractionErrorCode =
  | "INVALID_URL"
  | "FETCH_FAILED"
  | "NO_RECIPE_FOUND"
  | "PARSE_ERROR"
  | "RATE_LIMITED"
  | "SITE_BLOCKED"
  | "TIMEOUT"
  | "LLM_ERROR"
  | "UNKNOWN_ERROR";

export interface ExtractionMetadata {
  extractionTimeMs: number;
  source: CacheSource;
  agentsUsed: string[];
  confidence?: number;
  extractorUsed?: ExtractorType;
}

export type CacheSource =
  | "user_cache"
  | "global_cache"
  | "fresh_extraction"
  | "extraction_failed"
  | "error";

export type ExtractorType = "schema" | "schema_fast_path" | "site_specific" | "generic" | "llm";

// ═══════════════════════════════════════════════════════════════════════════
// LLM ORCHESTRATOR TYPES (Option C)
// ═══════════════════════════════════════════════════════════════════════════

export interface LLMTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface LLMToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface LLMToolResult {
  tool_use_id: string;
  content: string;
}

export interface ReconResult {
  siteType: "schema_org" | "known_site" | "unknown" | "blocked";
  siteName?: string;
  hasSchemaRecipe: boolean;
  schemaData?: unknown;
  antiScrapingDetected: boolean;
  recommendedExtractor: ExtractorType;
  confidence: number;
}

export interface FetchResult {
  success: boolean;
  html?: string;
  error?: string;
  statusCode?: number;
  contentType?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AgentMessage {
  id: string;
  timestamp: string;
  source: string;
  target: string;
  type: "request" | "response" | "error";
  payload: unknown;
  metadata: {
    correlationId: string;
    ttl?: number;
    priority?: "low" | "normal" | "high";
  };
}
