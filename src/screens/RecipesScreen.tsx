// src/screens/RecipesScreen.tsx
// Recipe library screen with search and filters

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Text,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { Search, X, ChevronDown } from 'lucide-react-native';

// Web-specific styles to remove browser focus outlines
const webInputStyle = Platform.OS === 'web' ? { outlineStyle: 'none' } : {};
import { useMutation } from 'convex/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../convex/_generated/api';
import { Doc, Id } from '../../convex/_generated/dataModel';
import { RootStackParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { spacing, typography, borderRadius, shadows } from '../styles/theme';
import { timing, easing } from '../utils/animations';
import { ScreenTitle, Caption, EmptyState, Spinner } from '../components/ui';
import { RecipeCard } from '../components/RecipeCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { useOptionalTabBarVisibility } from '../hooks/useTabBarVisibility';
import { useOfflineRecipes } from '../hooks/useOfflineRecipes';
import { OfflineBadge } from '../components/OfflineIndicator';
import { CachedRecipe } from '../services/offlineStorage';

// Animated grid item for stagger effect
interface AnimatedGridItemProps {
  index: number;
  children: React.ReactNode;
  triggerKey: string; // Changes when we need to re-animate
}

function AnimatedGridItem({ index, children, triggerKey }: AnimatedGridItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Reset values
    opacity.setValue(0);
    translateY.setValue(20);

    // Staggered animation delay based on index
    const delay = index * timing.stagger;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: timing.standard,
        delay,
        easing: easing.default,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: timing.standard,
        delay,
        easing: easing.easeOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, [triggerKey]);

  return (
    <Animated.View
      style={[
        styles.gridItem,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

interface RecipesScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export function RecipesScreen({ navigation }: RecipesScreenProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const { onScroll, resetVisibility } = useOptionalTabBarVisibility();
  const { userId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    visible: boolean;
    recipeId: string | null;
    recipeName: string;
  }>({ visible: false, recipeId: null, recipeName: '' });

  // Search and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'recent' | 'oldest' | 'az' | 'za'>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'quick'>('all');

  // Fetch recipes
  const deleteRecipe = useMutation(api.recipes.remove);
  // Use offline-aware hook that falls back to cached recipes when offline
  const {
    recipes,
    isOffline,
    isSyncing,
    isLoading: recipesLoading,
    isUsingCache,
  } = useOfflineRecipes(userId);

  // Count quick recipes (under 30 min)
  const quickRecipeCount = useMemo(() => {
    return recipes.filter((recipe) => {
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      return totalTime > 0 && totalTime <= 30;
    }).length;
  }, [recipes]);

  // Filter and sort recipes (handles both Doc<"recipes"> and CachedRecipe)
  const displayedRecipes = useMemo(() => {
    let filtered = [...recipes] as (Doc<"recipes"> | CachedRecipe)[];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((recipe) =>
        recipe.title.toLowerCase().includes(query)
      );
    }

    // Apply time filter
    if (timeFilter === 'quick') {
      filtered = filtered.filter((recipe) => {
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
        return totalTime > 0 && totalTime <= 30;
      });
    }

    // Apply sorting
    switch (sortOption) {
      case 'recent':
        filtered.sort((a, b) => (b.extractedAt || 0) - (a.extractedAt || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => (a.extractedAt || 0) - (b.extractedAt || 0));
        break;
      case 'az':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'za':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return filtered;
  }, [recipes, searchQuery, sortOption, timeFilter]);

  // Sort option labels
  const sortLabels: Record<typeof sortOption, string> = {
    recent: 'Recent',
    oldest: 'Oldest',
    az: 'A-Z',
    za: 'Z-A',
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Convex auto-refetches, just need to wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleRecipePress = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  const handleDeleteRecipe = (recipeId: string) => {
    // Find recipe title for confirmation message (handle both Convex and cached recipes)
    const recipe = recipes.find((r) => ('_id' in r ? r._id : r.id) === recipeId);
    const recipeName = recipe?.title || 'this recipe';

    setDeleteConfirm({
      visible: true,
      recipeId,
      recipeName,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.recipeId) return;

    try {
      await deleteRecipe({
        id: deleteConfirm.recipeId as Id<"recipes">,
      });
    } catch (error) {
      console.error('Failed to delete recipe:', error);
    } finally {
      setDeleteConfirm({ visible: false, recipeId: null, recipeName: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ visible: false, recipeId: null, recipeName: '' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.titleWithBadge}>
              <ScreenTitle>Recipes</ScreenTitle>
              {isOffline && <OfflineBadge />}
            </View>
            <Caption>
              {recipes.length} saved{isUsingCache && !isOffline ? ' (cached)' : ''}
            </Caption>
          </View>

          {/* Full-width Pill Search Bar */}
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              shadows.sm,
            ]}
          >
            <Search
              size={20}
              color={colors.textSecondary}
              strokeWidth={1.5}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search recipes..."
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, { color: colors.text }, webInputStyle as any]}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <X size={18} color={colors.textMuted} strokeWidth={1.5} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Sort & Filter Bar */}
        {recipes.length > 0 && (
          <View style={styles.sortFilterBar}>
            {/* Sort Dropdown */}
            <View>
              <Pressable
                onPress={() => setShowSortMenu(!showSortMenu)}
                style={[styles.sortButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.sortButtonText, { color: colors.text }]}>
                  {sortLabels[sortOption]}
                </Text>
                <ChevronDown
                  size={16}
                  color={colors.textSecondary}
                  strokeWidth={1.5}
                  style={{ transform: [{ rotate: showSortMenu ? '180deg' : '0deg' }] }}
                />
              </Pressable>

              {/* Inline Sort Menu */}
              {showSortMenu && (
                <View style={[styles.sortMenu, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  {(['recent', 'oldest', 'az', 'za'] as const).map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => {
                        setSortOption(option);
                        setShowSortMenu(false);
                      }}
                      style={[
                        styles.sortMenuItem,
                        sortOption === option && { backgroundColor: colors.surface },
                      ]}
                    >
                      <Text style={[styles.sortMenuItemText, { color: sortOption === option ? colors.primary : colors.text }]}>
                        {sortLabels[option]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Time Filter Chips */}
            <View style={styles.filterChips}>
              <Pressable
                onPress={() => setTimeFilter('all')}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: timeFilter === 'all' ? colors.primary : colors.surface,
                    borderColor: timeFilter === 'all' ? colors.primary : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={[styles.filterChipText, { color: timeFilter === 'all' ? colors.textInverse : colors.text }]}>
                  All
                </Text>
              </Pressable>
              {quickRecipeCount > 0 && (
                <Pressable
                  onPress={() => setTimeFilter(timeFilter === 'quick' ? 'all' : 'quick')}
                  style={({ pressed }) => [
                    styles.filterChip,
                    {
                      backgroundColor: timeFilter === 'quick' ? colors.primary : colors.surface,
                      borderColor: timeFilter === 'quick' ? colors.primary : colors.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.filterChipText, { color: timeFilter === 'quick' ? colors.textInverse : colors.text }]}>
                    Quick ({quickRecipeCount})
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Recipe Grid */}
        {recipesLoading ? (
          <View style={styles.loading}>
            <Spinner />
          </View>
        ) : recipes.length === 0 ? (
          <EmptyState
            messages={[
              { title: "Your cookbook awaits", description: "Paste a recipe URL above to get started" },
              { title: "No ads, no stories", description: "Just the ingredients and instructions you need" },
              { title: "Ready when you are", description: "Save your favorite recipes in one place" },
              { title: "Start your collection", description: "Extract recipes from any website" },
            ]}
          />
        ) : displayedRecipes.length === 0 ? (
          <View style={styles.noResults}>
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
              No recipes found
            </Text>
            <Pressable onPress={() => { setSearchQuery(''); setTimeFilter('all'); }}>
              <Text style={[styles.clearFiltersText, { color: colors.primary }]}>
                Clear filters
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.grid}>
            {displayedRecipes.map((recipe: Doc<"recipes"> | CachedRecipe, index: number) => {
              // Handle both Convex Doc (_id) and CachedRecipe (id)
              const recipeId = '_id' in recipe ? recipe._id : recipe.id;
              return (
                <AnimatedGridItem
                  key={recipeId}
                  index={index}
                  triggerKey={`${sortOption}-${timeFilter}-${searchQuery}`}
                >
                  <RecipeCard
                    id={recipeId}
                    title={recipe.title}
                    imageUrl={recipe.imageUrl}
                    prepTime={recipe.prepTime}
                    cookTime={recipe.cookTime}
                    inactiveTime={recipe.inactiveTime}
                    servings={recipe.servings}
                    instructions={recipe.instructions}
                    onPress={handleRecipePress}
                    onLongPress={isOffline ? undefined : handleDeleteRecipe}
                  />
                </AnimatedGridItem>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteConfirm.visible}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${deleteConfirm.recipeName}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        destructive
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 80, // Account for floating tab bar
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    paddingVertical: spacing.xs,
  },
  sortFilterBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: spacing.xs,
  },
  sortButtonText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.caption,
  },
  filterChips: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
  },
  sortMenu: {
    marginTop: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sortMenuItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sortMenuItemText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.sm,
  },
  noResultsText: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.sectionHeader,
  },
  clearFiltersText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.body,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm / 2, // Negative margin to offset gridItem padding
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: spacing.sm / 2,
    marginBottom: spacing.md,
  },
});
