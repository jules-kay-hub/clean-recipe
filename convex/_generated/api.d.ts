/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as extraction from "../extraction.js";
import type * as lib_llmTools from "../lib/llmTools.js";
import type * as lib_toolHandlers from "../lib/toolHandlers.js";
import type * as lib_types from "../lib/types.js";
import type * as lib_utils from "../lib/utils.js";
import type * as recipes from "../recipes.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  extraction: typeof extraction;
  "lib/llmTools": typeof lib_llmTools;
  "lib/toolHandlers": typeof lib_toolHandlers;
  "lib/types": typeof lib_types;
  "lib/utils": typeof lib_utils;
  recipes: typeof recipes;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
