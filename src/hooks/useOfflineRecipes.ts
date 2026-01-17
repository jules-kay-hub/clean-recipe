// src/hooks/useOfflineRecipes.ts
// Hybrid hook combining Convex queries with local SQLite cache

import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id, Doc } from '../../convex/_generated/dataModel';
import { useOffline } from '../context/OfflineContext';
import { CachedRecipe } from '../services/offlineStorage';

interface UseOfflineRecipesResult {
  recipes: Doc<"recipes">[] | CachedRecipe[];
  isOffline: boolean;
  isSyncing: boolean;
  isLoading: boolean;
  isUsingCache: boolean;
}

// Convert Convex recipe to cached format
function toCachedRecipe(recipe: Doc<"recipes">, userId: string): CachedRecipe {
  return {
    id: recipe._id,
    userId,
    title: recipe.title,
    imageUrl: recipe.imageUrl,
    sourceUrl: recipe.sourceUrl,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    inactiveTime: recipe.inactiveTime,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    urlHash: recipe.urlHash,
    extractedAt: recipe.extractedAt,
    cachedAt: Date.now(),
    lastAccessed: Date.now(),
  };
}

export function useOfflineRecipes(userId: Id<"users"> | null): UseOfflineRecipesResult {
  const { isOnline, isInitialized, cacheRecipes, getCachedRecipes } = useOffline();
  const [cachedRecipes, setCachedRecipes] = useState<CachedRecipe[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const lastSyncRef = useRef<string | null>(null);

  // Convex query - skip when offline or no userId
  const convexRecipes = useQuery(
    api.recipes.list,
    userId && isOnline ? {} : "skip"
  );

  // Load cached recipes when offline or initializing
  useEffect(() => {
    const loadCached = async () => {
      if (!userId || !isInitialized) return;

      try {
        const cached = await getCachedRecipes(userId);
        setCachedRecipes(cached);
      } catch (error) {
        console.error('Failed to load cached recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCached();
  }, [userId, isInitialized, getCachedRecipes]);

  // Sync Convex recipes to cache when online
  useEffect(() => {
    const syncToCache = async () => {
      if (!convexRecipes || !userId || !isOnline || convexRecipes.length === 0) {
        return;
      }

      // Create a sync key to avoid redundant syncs
      const syncKey = convexRecipes.map((r) => r._id).sort().join(',');
      if (syncKey === lastSyncRef.current) {
        return;
      }

      setIsSyncing(true);
      lastSyncRef.current = syncKey;

      try {
        // Convert and cache all recipes
        const recipesToCache = convexRecipes.map((recipe) =>
          toCachedRecipe(recipe, userId)
        );
        await cacheRecipes(recipesToCache);

        // Update local state with fresh cache
        setCachedRecipes(recipesToCache);
      } catch (error) {
        console.error('Failed to sync recipes to cache:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncToCache();
  }, [convexRecipes, userId, isOnline, cacheRecipes]);

  // Determine which data source to use
  const isUsingCache = !isOnline || convexRecipes === undefined;
  const recipes = isUsingCache ? cachedRecipes : (convexRecipes || []);

  return {
    recipes,
    isOffline: !isOnline,
    isSyncing,
    isLoading: isLoading && !convexRecipes,
    isUsingCache,
  };
}

// Hook for getting a single recipe with offline support
interface UseOfflineRecipeResult {
  recipe: Doc<"recipes"> | CachedRecipe | null;
  isOffline: boolean;
  isLoading: boolean;
  isFromCache: boolean;
}

export function useOfflineRecipe(recipeId: string | null): UseOfflineRecipeResult {
  const { isOnline, isInitialized, getCachedRecipe, cacheRecipe } = useOffline();
  const [cachedRecipe, setCachedRecipe] = useState<CachedRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convex query - skip when offline or no recipeId
  const convexRecipe = useQuery(
    api.recipes.getById,
    recipeId && isOnline ? { id: recipeId as Id<"recipes"> } : "skip"
  );

  // Load from cache when offline
  useEffect(() => {
    const loadCached = async () => {
      if (!recipeId || !isInitialized) return;

      try {
        const cached = await getCachedRecipe(recipeId);
        setCachedRecipe(cached);
      } catch (error) {
        console.error('Failed to load cached recipe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCached();
  }, [recipeId, isInitialized, getCachedRecipe]);

  // Cache recipe when loaded from Convex
  useEffect(() => {
    const cacheConvexRecipe = async () => {
      if (!convexRecipe || !isOnline) return;

      try {
        const toCache = toCachedRecipe(convexRecipe, convexRecipe.userId);
        await cacheRecipe(toCache);
        setCachedRecipe(toCache);
      } catch (error) {
        console.error('Failed to cache recipe:', error);
      }
    };

    cacheConvexRecipe();
  }, [convexRecipe, isOnline, cacheRecipe]);

  // Determine which data source to use
  const isFromCache = !isOnline || convexRecipe === undefined;
  const recipe = isFromCache ? cachedRecipe : (convexRecipe || null);

  return {
    recipe,
    isOffline: !isOnline,
    isLoading: isLoading && convexRecipe === undefined,
    isFromCache,
  };
}
