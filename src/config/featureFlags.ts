// src/config/featureFlags.ts
// Feature flags for controlling feature availability in the app

/**
 * Feature flags configuration
 * Set to true to enable a feature, false to disable
 *
 * For MVP launch, MealPlanner and ShoppingList are disabled.
 * Enable them by setting the flags to true.
 */
export const featureFlags = {
  /**
   * Meal Planner feature - allows users to plan meals for the week
   * Includes: MealPlannerScreen, RecipePickerScreen, meal plan API calls
   */
  mealPlanner: false,

  /**
   * Shopping List feature - generates shopping lists from meal plans
   * Includes: ShoppingListScreen, shopping list API calls
   * Note: Depends on mealPlanner feature for full functionality
   */
  shoppingList: false,
} as const;

// Type for feature flag keys
export type FeatureFlag = keyof typeof featureFlags;

// Helper function to check if a feature is enabled
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
