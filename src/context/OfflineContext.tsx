// src/context/OfflineContext.tsx
// Provider managing offline state and database initialization

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import {
  initDatabase,
  cacheRecipe,
  cacheRecipes,
  getCachedRecipes,
  getCachedRecipe,
  removeCachedRecipe,
  clearCache,
  CachedRecipe,
} from '../services/offlineStorage';

interface OfflineContextValue {
  // Network status
  isOnline: boolean;
  isInitialized: boolean;

  // Cache operations
  cacheRecipe: (recipe: CachedRecipe) => Promise<void>;
  cacheRecipes: (recipes: CachedRecipe[]) => Promise<void>;
  getCachedRecipes: (userId: string) => Promise<CachedRecipe[]>;
  getCachedRecipe: (id: string) => Promise<CachedRecipe | null>;
  removeCachedRecipe: (id: string) => Promise<void>;
  clearCache: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

interface OfflineProviderProps {
  children: React.ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const { isOnline } = useNetworkStatus();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize database on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize offline database:', error);
        // Still set initialized to true so app doesn't hang
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  // Wrapped cache operations with error handling
  const handleCacheRecipe = useCallback(async (recipe: CachedRecipe) => {
    try {
      await cacheRecipe(recipe);
    } catch (error) {
      console.error('Failed to cache recipe:', error);
    }
  }, []);

  const handleCacheRecipes = useCallback(async (recipes: CachedRecipe[]) => {
    try {
      await cacheRecipes(recipes);
    } catch (error) {
      console.error('Failed to cache recipes:', error);
    }
  }, []);

  const handleGetCachedRecipes = useCallback(async (userId: string) => {
    try {
      return await getCachedRecipes(userId);
    } catch (error) {
      console.error('Failed to get cached recipes:', error);
      return [];
    }
  }, []);

  const handleGetCachedRecipe = useCallback(async (id: string) => {
    try {
      return await getCachedRecipe(id);
    } catch (error) {
      console.error('Failed to get cached recipe:', error);
      return null;
    }
  }, []);

  const handleRemoveCachedRecipe = useCallback(async (id: string) => {
    try {
      await removeCachedRecipe(id);
    } catch (error) {
      console.error('Failed to remove cached recipe:', error);
    }
  }, []);

  const handleClearCache = useCallback(async () => {
    try {
      await clearCache();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }, []);

  const value: OfflineContextValue = {
    isOnline,
    isInitialized,
    cacheRecipe: handleCacheRecipe,
    cacheRecipes: handleCacheRecipes,
    getCachedRecipes: handleGetCachedRecipes,
    getCachedRecipe: handleGetCachedRecipe,
    removeCachedRecipe: handleRemoveCachedRecipe,
    clearCache: handleClearCache,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
