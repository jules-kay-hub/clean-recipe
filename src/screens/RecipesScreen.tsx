// src/screens/RecipesScreen.tsx
// Recipe library screen with always-visible extraction and collapsible search

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { Search, X, SlidersHorizontal, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Web-specific styles to remove browser focus outlines
const webInputStyle = Platform.OS === 'web' ? { outlineStyle: 'none' } : {};
import { useMutation, useAction } from 'convex/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../convex/_generated/api';
import { Doc, Id } from '../../convex/_generated/dataModel';
import { RootStackParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';
import { spacing, typography, borderRadius, shadows } from '../styles/theme';
import { timing, easing } from '../utils/animations';
import { Caption, Spinner } from '../components/ui';
import { RecipeCard } from '../components/RecipeCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { useOptionalTabBarVisibility } from '../hooks/useTabBarVisibility';
import { useOfflineRecipes } from '../hooks/useOfflineRecipes';
import { OfflineBadge } from '../components/OfflineIndicator';
import { CachedRecipe } from '../services/offlineStorage';
import { URLInput } from '../components/URLInput';

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
  const { onScroll } = useOptionalTabBarVisibility();
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
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'quick'>('all');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Extract state (always visible at top now)
  const [extractError, setExtractError] = useState<string | undefined>();
  const [isExtracting, setIsExtracting] = useState(false);
  const [urlClearTrigger, setUrlClearTrigger] = useState(0);
  const [urlFocusTrigger, setUrlFocusTrigger] = useState(0);

  // Focus the URL input whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      setUrlFocusTrigger(prev => prev + 1);
    }, [])
  );

  // Duplicate confirmation modal
  const [duplicateConfirm, setDuplicateConfirm] = useState<{
    visible: boolean;
    url: string;
    existingRecipe: { _id: string; title: string } | null;
  }>({ visible: false, url: '', existingRecipe: null });

  // Collapsible search animation
  const searchHeight = useRef(new Animated.Value(0)).current;

  // Check if any filters are active (not default)
  const hasActiveFilters = sortOption !== 'recent' || timeFilter !== 'all';

  // Fetch recipes and extraction action
  const deleteRecipe = useMutation(api.recipes.remove);
  const extractRecipe = useAction(api.extraction.extractRecipe);

  // Use offline-aware hook that falls back to cached recipes when offline
  const {
    recipes,
    isOffline,
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

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRACTION LOGIC
  // ═══════════════════════════════════════════════════════════════════════════

  // Normalize URL for comparison
  const normalizeUrlForCompare = (url: string): string => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      parsed.hostname = parsed.hostname.replace(/^www\./, '');
      return parsed.hostname + parsed.pathname.replace(/\/$/, '');
    } catch {
      return url.toLowerCase();
    }
  };

  // Check if URL already exists in recipes
  const findExistingRecipe = (url: string) => {
    const normalizedInput = normalizeUrlForCompare(url);
    return recipes.find((recipe) => {
      if (!recipe.sourceUrl) return false;
      const normalizedExisting = normalizeUrlForCompare(recipe.sourceUrl);
      return normalizedInput === normalizedExisting;
    });
  };

  const handleExtract = async (url: string, skipDuplicateCheck = false) => {
    if (!userId) {
      setExtractError('Please sign in to extract recipes.');
      return;
    }

    // Check for duplicate unless skipped
    if (!skipDuplicateCheck) {
      const existing = findExistingRecipe(url);
      if (existing) {
        // Show duplicate modal
        setDuplicateConfirm({
          visible: true,
          url,
          existingRecipe: { _id: '_id' in existing ? existing._id : existing.id, title: existing.title },
        });
        return;
      }
    }

    setExtractError(undefined);
    setIsExtracting(true);

    try {
      const result = await extractRecipe({
        url,
        userId,
      });

      if (result.success && result.recipe) {
        // Clear the URL input
        setUrlClearTrigger(prev => prev + 1);

        // Navigate to recipe detail
        const recipeId = result.recipe._id;
        setTimeout(() => {
          navigation.navigate('RecipeDetail', { recipeId });
        }, 300);
      } else {
        setExtractError(result.error?.message || 'Failed to extract recipe');
      }
    } catch (error) {
      setExtractError(
        error instanceof Error ? error.message : 'Failed to extract recipe'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  // Duplicate confirmation handlers
  const confirmDuplicateExtract = () => {
    const url = duplicateConfirm.url;
    setDuplicateConfirm({ visible: false, url: '', existingRecipe: null });
    // Extract immediately
    handleExtract(url, true);
  };

  const viewExistingRecipe = () => {
    const recipeId = duplicateConfirm.existingRecipe?._id;
    setDuplicateConfirm({ visible: false, url: '', existingRecipe: null });
    if (recipeId) {
      navigation.navigate('RecipeDetail', { recipeId });
    }
  };

  const cancelDuplicateCheck = () => {
    setDuplicateConfirm({ visible: false, url: '', existingRecipe: null });
  };

  // Search expand/collapse handlers
  const expandSearch = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsSearchExpanded(true);
    Animated.spring(searchHeight, {
      toValue: 56, // Height of search row
      tension: 200,
      friction: 20,
      useNativeDriver: false, // Height can't use native driver
    }).start();
  };

  const collapseSearch = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.timing(searchHeight, {
      toValue: 0,
      duration: 200,
      easing: easing.easeOut,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchExpanded(false);
      setSearchQuery(''); // Clear search on collapse
    });
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
        {/* Extract Section - Always visible at top */}
        {!isOffline && (
          <View style={[styles.extractCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.extractCardTitle, { color: colors.text }]}>Add Recipe</Text>
            <Text style={[styles.extractCardSubtitle, { color: colors.textSecondary }]}>
              Paste a URL to extract the recipe
            </Text>
            <URLInput
              onExtract={(url) => handleExtract(url)}
              isLoading={isExtracting}
              error={extractError}
              clearTrigger={urlClearTrigger}
              focusTrigger={urlFocusTrigger}
            />
          </View>
        )}

        {/* Spacer between extract and recipes sections */}
        <View style={styles.sectionSpacer} />

        {/* Recipes Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.titleWithBadge}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recipes</Text>
              {isOffline && <OfflineBadge />}
            </View>
            {/* Search button (or X when expanded) */}
            {recipes.length > 0 && (
              <Pressable
                onPress={isSearchExpanded ? collapseSearch : expandSearch}
                style={({ pressed }) => [
                  styles.searchIconButton,
                  {
                    backgroundColor: pressed
                      ? `${colors.primary}15`
                      : isSearchExpanded
                      ? `${colors.primary}10`
                      : 'transparent',
                  },
                ]}
                hitSlop={8}
              >
                {isSearchExpanded ? (
                  <X size={20} color={colors.primary} strokeWidth={2} />
                ) : (
                  <Search size={20} color={colors.textSecondary} strokeWidth={1.5} />
                )}
              </Pressable>
            )}
          </View>
          <Caption>
            {recipes.length} saved{isUsingCache && !isOffline ? ' (cached)' : ''}
          </Caption>

          {/* Collapsible Search Row */}
          <Animated.View style={[styles.collapsibleSearch, { height: searchHeight }]}>
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
              {/* Filter Button with Badge */}
              <View style={[styles.filterDivider, { backgroundColor: colors.border }]} />
              <Pressable
                onPress={() => setShowFilterPopover(!showFilterPopover)}
                style={({ pressed }) => [
                  styles.filterIconButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                hitSlop={8}
              >
                {/* Green badge circle - always visible, more prominent when active */}
                <View
                  style={[
                    styles.filterBadge,
                    {
                      backgroundColor: hasActiveFilters
                        ? `${colors.primary}30`  // 30% opacity when active
                        : `${colors.primary}10`, // 10% opacity when inactive
                    },
                  ]}
                />
                <SlidersHorizontal
                  size={18}
                  color={hasActiveFilters ? colors.primary : colors.textSecondary}
                  strokeWidth={1.5}
                />
              </Pressable>
            </View>
          </Animated.View>
        </View>

        {/* Recipe Grid */}
        {recipesLoading ? (
          <View style={styles.loading}>
            <Spinner />
          </View>
        ) : recipes.length === 0 ? (
          // Empty state (extract is already visible above)
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>
              {'\uD83C\uDF73'}
            </Text>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              No recipes yet!
            </Text>
            <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
              Paste a URL above to extract your first recipe
            </Text>
          </View>
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

      {/* Filter Popover */}
      {showFilterPopover && (
        <>
          {/* Invisible backdrop to catch taps outside */}
          <Pressable
            style={styles.popoverBackdrop}
            onPress={() => setShowFilterPopover(false)}
          />
          <View
            style={[
              styles.filterPopover,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
              shadows.md,
            ]}
          >
            {/* Sort Options */}
            <Text style={[styles.popoverLabel, { color: colors.textSecondary }]}>
              Sort
            </Text>
            {(['recent', 'oldest', 'az', 'za'] as const).map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setSortOption(option);
                  setShowFilterPopover(false);
                }}
                style={({ pressed }) => [
                  styles.popoverOption,
                  sortOption === option && { backgroundColor: `${colors.primary}15` },
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.popoverOptionText,
                    { color: sortOption === option ? colors.primary : colors.text },
                  ]}
                >
                  {sortLabels[option]}
                </Text>
                {sortOption === option && (
                  <Check size={16} color={colors.primary} strokeWidth={2} />
                )}
              </Pressable>
            ))}

            {/* Time Filter (if quick recipes exist) */}
            {quickRecipeCount > 0 && (
              <>
                <View style={[styles.popoverDivider, { backgroundColor: colors.border }]} />
                <Text style={[styles.popoverLabel, { color: colors.textSecondary }]}>
                  Time
                </Text>
                <Pressable
                  onPress={() => {
                    setTimeFilter(timeFilter === 'quick' ? 'all' : 'quick');
                    setShowFilterPopover(false);
                  }}
                  style={({ pressed }) => [
                    styles.popoverOption,
                    timeFilter === 'quick' && { backgroundColor: `${colors.primary}15` },
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.popoverOptionText,
                      { color: timeFilter === 'quick' ? colors.primary : colors.text },
                    ]}
                  >
                    Quick (≤30 min)
                  </Text>
                  {timeFilter === 'quick' && (
                    <Check size={16} color={colors.primary} strokeWidth={2} />
                  )}
                </Pressable>
              </>
            )}
          </View>
        </>
      )}

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

      {/* Duplicate Recipe Modal */}
      <ConfirmModal
        visible={duplicateConfirm.visible}
        title="Recipe Already Saved"
        message={`You already have "${duplicateConfirm.existingRecipe?.title || 'this recipe'}" in your collection.`}
        confirmText="Add Anyway"
        cancelText="Cancel"
        onConfirm={confirmDuplicateExtract}
        onCancel={cancelDuplicateCheck}
        secondaryText="View Existing Recipe"
        onSecondary={viewExistingRecipe}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 100,
  },
  // Extract card (matches Settings page card style)
  extractCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  extractCardTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.sectionHeader,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  extractCardSubtitle: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  // Spacer between extract and recipes sections
  sectionSpacer: {
    height: spacing.xl,
  },
  // Section header
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.sectionHeader,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Collapsible search container
  collapsibleSearch: {
    overflow: 'hidden',
    marginTop: spacing.sm,
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
  filterDivider: {
    width: 1,
    height: 24,
    marginHorizontal: spacing.xs,
  },
  // Filter badge (green circle behind icon)
  filterBadge: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  filterIconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Popover styles
  popoverBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  filterPopover: {
    position: 'absolute',
    top: 200, // Below extract section + section header + search bar
    right: spacing.lg,
    minWidth: 160,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    zIndex: 999,
  },
  popoverLabel: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.label,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  popoverOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  popoverOptionText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
  },
  popoverDivider: {
    height: 1,
    marginVertical: spacing.sm,
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
  // Empty state styles
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    textAlign: 'center',
  },
});
