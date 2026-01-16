// src/services/offlineStorage.ts
// SQLite service for offline recipe caching

import { Platform } from 'react-native';

// Conditionally import SQLite only on native platforms
// Web doesn't support expo-sqlite without additional wasm configuration
const SQLite = Platform.OS !== 'web' ? require('expo-sqlite') : null;

// Recipe type for offline storage
export interface CachedRecipe {
  id: string;
  userId: string;
  title: string;
  imageUrl?: string;
  sourceUrl?: string;
  prepTime?: number;
  cookTime?: number;
  inactiveTime?: number;
  servings?: number;
  ingredients: Array<{
    text: string;
    quantity?: number;
    unit?: string;
    item?: string;
    preparation?: string;
    category?: string;
  }>;
  instructions: string[];
  urlHash: string;
  extractedAt?: number;
  cachedAt: number;
  lastAccessed: number;
}

// SQLite database instance (null on web)
let db: any = null;

// Check if SQLite is available (native platforms only)
const isSQLiteAvailable = Platform.OS !== 'web' && SQLite !== null;

// Initialize the database
export async function initDatabase(): Promise<void> {
  if (!isSQLiteAvailable) {
    console.log('Offline storage not available on web');
    return;
  }

  if (db) return;

  db = await SQLite.openDatabaseAsync('recipeCache.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cached_recipes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      data TEXT NOT NULL,
      cached_at INTEGER NOT NULL,
      last_accessed INTEGER NOT NULL,
      convex_modified INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_user_id ON cached_recipes(user_id);
    CREATE INDEX IF NOT EXISTS idx_last_accessed ON cached_recipes(last_accessed);
  `);
}

// Cache a single recipe
export async function cacheRecipe(recipe: CachedRecipe): Promise<void> {
  if (!isSQLiteAvailable) return;
  if (!db) await initDatabase();
  if (!db) return;

  const now = Date.now();
  const data = JSON.stringify(recipe);

  await db.runAsync(
    `INSERT OR REPLACE INTO cached_recipes (id, user_id, data, cached_at, last_accessed, convex_modified)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [recipe.id, recipe.userId, data, now, now, recipe.extractedAt || null]
  );
}

// Cache multiple recipes (bulk insert)
export async function cacheRecipes(recipes: CachedRecipe[]): Promise<void> {
  if (!isSQLiteAvailable) return;
  if (!db) await initDatabase();
  if (!db || recipes.length === 0) return;

  const now = Date.now();

  // Use transaction for bulk insert
  await db.withTransactionAsync(async () => {
    for (const recipe of recipes) {
      const data = JSON.stringify(recipe);
      await db.runAsync(
        `INSERT OR REPLACE INTO cached_recipes (id, user_id, data, cached_at, last_accessed, convex_modified)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [recipe.id, recipe.userId, data, now, now, recipe.extractedAt || null]
      );
    }
  });
}

// Get all cached recipes for a user
export async function getCachedRecipes(userId: string): Promise<CachedRecipe[]> {
  if (!isSQLiteAvailable) return [];
  if (!db) await initDatabase();
  if (!db) return [];

  const rows = await db.getAllAsync(
    `SELECT data FROM cached_recipes WHERE user_id = ? ORDER BY last_accessed DESC`,
    [userId]
  );

  return rows.map((row: { data: string }) => JSON.parse(row.data));
}

// Get a single cached recipe by ID
export async function getCachedRecipe(id: string): Promise<CachedRecipe | null> {
  if (!isSQLiteAvailable) return null;
  if (!db) await initDatabase();
  if (!db) return null;

  const row = await db.getFirstAsync(
    `SELECT data FROM cached_recipes WHERE id = ?`,
    [id]
  ) as { data: string } | null;

  if (!row) return null;

  // Update last accessed time
  await db.runAsync(
    `UPDATE cached_recipes SET last_accessed = ? WHERE id = ?`,
    [Date.now(), id]
  );

  return JSON.parse(row.data);
}

// Remove a recipe from cache
export async function removeCachedRecipe(id: string): Promise<void> {
  if (!isSQLiteAvailable) return;
  if (!db) await initDatabase();
  if (!db) return;

  await db.runAsync(`DELETE FROM cached_recipes WHERE id = ?`, [id]);
}

// Clear all cached data
export async function clearCache(): Promise<void> {
  if (!isSQLiteAvailable) return;
  if (!db) await initDatabase();
  if (!db) return;

  await db.runAsync(`DELETE FROM cached_recipes`);
}

// Get cache statistics
export async function getCacheStats(): Promise<{
  count: number;
  totalSize: number;
  oldestAccess: number | null;
  newestAccess: number | null;
}> {
  if (!isSQLiteAvailable) {
    return { count: 0, totalSize: 0, oldestAccess: null, newestAccess: null };
  }
  if (!db) await initDatabase();
  if (!db) {
    return { count: 0, totalSize: 0, oldestAccess: null, newestAccess: null };
  }

  const stats = await db.getFirstAsync(`
    SELECT
      COUNT(*) as count,
      COALESCE(SUM(LENGTH(data)), 0) as total_size,
      MIN(last_accessed) as oldest_access,
      MAX(last_accessed) as newest_access
    FROM cached_recipes
  `) as {
    count: number;
    total_size: number;
    oldest_access: number | null;
    newest_access: number | null;
  } | null;

  return {
    count: stats?.count || 0,
    totalSize: stats?.total_size || 0,
    oldestAccess: stats?.oldest_access || null,
    newestAccess: stats?.newest_access || null,
  };
}
