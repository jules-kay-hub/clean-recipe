// src/screens/HomeScreen.tsx
// Main recipe library screen

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
import { CheckCircle, Search, X, ChevronDown } from 'lucide-react-native';

// Web-specific styles to remove browser focus outlines
const webInputStyle = Platform.OS === 'web' ? { outlineStyle: 'none' } : {};
import { useQuery, useAction, useMutation } from 'convex/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../convex/_generated/api';
import { Doc, Id } from '../../convex/_generated/dataModel';
import { RootStackParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { spacing, typography, borderRadius } from '../styles/theme';
import { timing, easing } from '../utils/animations';
import { ScreenTitle, Caption, EmptyState, Spinner } from '../components/ui';
import { URLInput } from '../components/URLInput';
import { RecipeCard } from '../components/RecipeCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { JuliennedIcon } from '../components/JuliennedIcon';

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

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [extractError, setExtractError] = useState<string | undefined>();
  const [isExtracting, setIsExtracting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.8)).current;
  const [deleteConfirm, setDeleteConfirm] = useState<{
    visible: boolean;
    recipeId: string | null;
    recipeName: string;
  }>({ visible: false, recipeId: null, recipeName: '' });
  const [duplicateConfirm, setDuplicateConfirm] = useState<{
    visible: boolean;
    url: string;
    existingRecipe: { _id: string; title: string } | null;
  }>({ visible: false, url: '', existingRecipe: null });

  // Search and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [sortOption, setSortOption] = useState<'recent' | 'oldest' | 'az' | 'za'>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'quick'>('all');
  const [urlClearTrigger, setUrlClearTrigger] = useState(0);

  // Fetch recipes and get/create demo user
  const extractRecipe = useAction(api.extraction.extractRecipe);
  const getOrCreateDemoUser = useMutation(api.users.getOrCreateDemoUser);
  const deleteRecipe = useMutation(api.recipes.remove);
  // Pass userId to list query so it works without auth (demo mode)
  const recipes = useQuery(api.recipes.list, userId ? { userId } : "skip") || [];

  // Count quick recipes (under 30 min)
  const quickRecipeCount = useMemo(() => {
    return recipes.filter((recipe) => {
      const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
      return totalTime > 0 && totalTime <= 30;
    }).length;
  }, [recipes]);

  // Filter and sort recipes
  const displayedRecipes = useMemo(() => {
    let filtered = [...recipes];

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

  // Initialize demo user on mount
  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await getOrCreateDemoUser();
        if (user) {
          setUserId(user._id);
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    };
    initUser();
  }, [getOrCreateDemoUser]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Convex auto-refetches, just need to wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

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
      setExtractError('User not initialized. Please try again.');
      return;
    }

    // Check for duplicate unless skipped
    if (!skipDuplicateCheck) {
      const existing = findExistingRecipe(url);
      if (existing) {
        setDuplicateConfirm({
          visible: true,
          url,
          existingRecipe: { _id: existing._id, title: existing.title },
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
        // Clear the URL input on success
        setUrlClearTrigger(prev => prev + 1);

        // Show success feedback
        setShowSuccess(true);
        Animated.parallel([
          Animated.timing(successOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(successScale, {
            toValue: 1,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          }),
        ]).start();

        // Navigate after brief delay
        const recipeId = result.recipe._id;
        setTimeout(() => {
          setShowSuccess(false);
          successOpacity.setValue(0);
          successScale.setValue(0.8);
          navigation.navigate('RecipeDetail', { recipeId });
        }, 1200);
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

  const handleRecipePress = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  const handleDeleteRecipe = (recipeId: string) => {
    if (!userId) return;

    // Find recipe title for confirmation message
    const recipe = recipes.find((r) => r._id === recipeId);
    const recipeName = recipe?.title || 'this recipe';

    setDeleteConfirm({
      visible: true,
      recipeId,
      recipeName,
    });
  };

  const confirmDelete = async () => {
    if (!userId || !deleteConfirm.recipeId) return;

    try {
      await deleteRecipe({
        id: deleteConfirm.recipeId as Id<"recipes">,
        userId,
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

  // Duplicate confirmation handlers
  const confirmDuplicateExtract = () => {
    const url = duplicateConfirm.url;
    setDuplicateConfirm({ visible: false, url: '', existingRecipe: null });
    handleExtract(url, true); // Skip duplicate check on retry
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
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleRow}>
              <JuliennedIcon size={36} />
              <View>
                <ScreenTitle>Recipes</ScreenTitle>
                <Caption>{recipes.length} saved</Caption>
              </View>
            </View>

            {/* Expandable Pill Search */}
            {recipes.length > 0 && (
              <Pressable
                onPress={() => !searchExpanded && setSearchExpanded(true)}
                style={[
                  styles.searchPill,
                  searchExpanded && styles.searchPillExpanded,
                  {
                    backgroundColor: colors.surface,
                    borderColor: searchExpanded ? colors.buttonPrimary : colors.border,
                  },
                ]}
              >
                <Search
                  size={18}
                  color={searchExpanded ? colors.buttonPrimary : colors.textSecondary}
                  strokeWidth={1.5}
                />
                {searchExpanded && (
                  <>
                    <TextInput
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search recipes..."
                      placeholderTextColor={colors.textMuted}
                      style={[styles.searchInput, { color: colors.text }, webInputStyle as any]}
                      autoFocus
                      onBlur={() => {
                        if (!searchQuery) setSearchExpanded(false);
                      }}
                    />
                    {searchQuery.length > 0 ? (
                      <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                        <X size={18} color={colors.textMuted} strokeWidth={1.5} />
                      </Pressable>
                    ) : (
                      <Pressable onPress={() => setSearchExpanded(false)} hitSlop={8}>
                        <X size={18} color={colors.textMuted} strokeWidth={1.5} />
                      </Pressable>
                    )}
                  </>
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* URL Input */}
        <URLInput
          onExtract={handleExtract}
          isLoading={isExtracting}
          error={extractError}
          clearTrigger={urlClearTrigger}
        />

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
        {recipes === undefined ? (
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
            {displayedRecipes.map((recipe: Doc<"recipes">, index: number) => (
              <AnimatedGridItem
                key={recipe._id}
                index={index}
                triggerKey={`${sortOption}-${timeFilter}-${searchQuery}`}
              >
                <RecipeCard
                  id={recipe._id}
                  title={recipe.title}
                  imageUrl={recipe.imageUrl}
                  prepTime={recipe.prepTime}
                  cookTime={recipe.cookTime}
                  servings={recipe.servings}
                  onPress={handleRecipePress}
                  onLongPress={handleDeleteRecipe}
                />
              </AnimatedGridItem>
            ))}
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

      {/* Success Overlay */}
      {showSuccess && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              backgroundColor: colors.background,
              opacity: successOpacity,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.successContent,
              { transform: [{ scale: successScale }] },
            ]}
          >
            <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
              <CheckCircle size={48} color={colors.success} strokeWidth={2} />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>
              Recipe Saved!
            </Text>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              Opening your recipe...
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  searchPillExpanded: {
    flex: 1,
    marginLeft: spacing.md,
    paddingHorizontal: spacing.md,
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
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.title,
    marginBottom: spacing.sm,
  },
  successMessage: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
  },
});
