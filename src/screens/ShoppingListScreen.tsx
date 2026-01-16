// src/screens/ShoppingListScreen.tsx
// Aggregated shopping list from meal plans

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Text,
  Share,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { Share2, Trash2 } from 'lucide-react-native';
import { api } from '../../convex/_generated/api';
import { RootStackParamList, TabParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { spacing, typography } from '../styles/theme';
import {
  ScreenTitle,
  SectionHeader,
  Caption,
  Button,
  Card,
  Checkbox,
  Divider,
  EmptyState,
  Spinner,
} from '../components/ui';
import { decodeHtmlEntities } from '../utils/textUtils';
import { useOptionalTabBarVisibility } from '../hooks/useTabBarVisibility';

type ShoppingListNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'ShoppingList'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ShoppingListScreenProps {
  navigation: ShoppingListNavigationProp;
  route?: {
    params?: {
      weekStart?: string;
      weekEnd?: string;
    };
  };
}

interface ShoppingItem {
  id: string;
  ingredient: string;
  quantity?: number;
  unit?: string;
  category: string;
  checked: boolean;
  recipes: string[];
}

// Category display order with subtle color chips
const CATEGORIES: { key: string; label: string; color: string }[] = [
  { key: 'produce', label: 'Produce', color: '#5C7C5A' },      // Sage green
  { key: 'meat_seafood', label: 'Meat & Seafood', color: '#C45A5A' }, // Muted red
  { key: 'dairy', label: 'Dairy', color: '#5A8AC4' },          // Soft blue
  { key: 'bakery', label: 'Bakery', color: '#D4A84A' },        // Warm gold
  { key: 'pantry', label: 'Pantry', color: '#8B7355' },        // Warm brown
  { key: 'frozen', label: 'Frozen', color: '#7AAAE4' },        // Ice blue
  { key: 'canned', label: 'Canned Goods', color: '#7A6B5A' },  // Taupe
  { key: 'spices', label: 'Spices', color: '#B86A4A' },        // Rust
  { key: 'condiments', label: 'Condiments', color: '#9B7CB4' }, // Soft purple
  { key: 'beverages', label: 'Beverages', color: '#4A8C8C' },  // Teal
  { key: 'other', label: 'Other', color: '#6B6B6B' },          // Gray
];

// Get current week dates
function getCurrentWeekDates(): { weekStart: string; weekEnd: string } {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return {
    weekStart: startOfWeek.toISOString().split('T')[0],
    weekEnd: endOfWeek.toISOString().split('T')[0],
  };
}

// Create a stable key for an ingredient
function ingredientKey(item: ShoppingItem): string {
  return `${item.ingredient.toLowerCase()}|${item.unit || ''}`;
}

export function ShoppingListScreen({ navigation, route }: ShoppingListScreenProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const { onScroll } = useOptionalTabBarVisibility();

  // Get week dates from route params or use current week
  const { weekStart, weekEnd } = useMemo(() => {
    if (route?.params?.weekStart && route?.params?.weekEnd) {
      return {
        weekStart: route.params.weekStart,
        weekEnd: route.params.weekEnd,
      };
    }
    return getCurrentWeekDates();
  }, [route?.params?.weekStart, route?.params?.weekEnd]);

  // Fetch shopping list from meal plans
  const shoppingData = useQuery(api.shoppingLists.generateFromMealPlans, {
    startDate: weekStart,
    endDate: weekEnd,
  });

  // Fetch saved checked state
  const savedState = useQuery(api.shoppingLists.getSaved, {
    weekStart,
  });

  // Mutation to save checked items
  const saveCheckedItems = useMutation(api.shoppingLists.saveCheckedItems);

  // Mutation to remove items
  const removeItem = useMutation(api.shoppingLists.removeItem);

  // Mutation to clear all meal plans
  const clearAllMealPlans = useMutation(api.mealPlans.clearAll);

  // Local checked state
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());

  // Initialize checked state from saved data
  useEffect(() => {
    if (savedState?.checkedItems) {
      setCheckedKeys(new Set(savedState.checkedItems));
    }
  }, [savedState]);

  // Combine generated items with checked state
  const items: ShoppingItem[] = useMemo(() => {
    if (!shoppingData?.items) return [];

    return shoppingData.items.map((item) => ({
      ...item,
      checked: checkedKeys.has(ingredientKey(item as ShoppingItem)),
    }));
  }, [shoppingData?.items, checkedKeys]);

  // Toggle item checked state
  const toggleItem = async (item: ShoppingItem) => {
    const key = ingredientKey(item);
    const newCheckedKeys = new Set(checkedKeys);

    if (newCheckedKeys.has(key)) {
      newCheckedKeys.delete(key);
    } else {
      newCheckedKeys.add(key);
    }

    setCheckedKeys(newCheckedKeys);

    // Save to backend
    try {
      await saveCheckedItems({
        weekStart,
        checkedItems: Array.from(newCheckedKeys),
      });
    } catch (error) {
      console.error('Failed to save checked state:', error);
    }
  };

  // Delete item from shopping list
  const handleDeleteItem = async (item: ShoppingItem) => {
    const key = ingredientKey(item);

    try {
      await removeItem({
        weekStart,
        ingredientKey: key,
      });

      // Also remove from local checked state
      const newCheckedKeys = new Set(checkedKeys);
      newCheckedKeys.delete(key);
      setCheckedKeys(newCheckedKeys);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};

    items.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    // Sort each category: unchecked first, then alphabetically
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return a.ingredient.localeCompare(b.ingredient);
      });
    });

    return groups;
  }, [items]);

  // Calculate progress
  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  // Format quantity for display
  const formatQuantity = (quantity?: number, unit?: string): string => {
    if (!quantity) return '';
    const qStr = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);
    return unit ? `${qStr} ${unit}` : qStr;
  };

  // Share list as text
  const handleShare = async () => {
    const listText = CATEGORIES.filter((cat) => groupedItems[cat.key]?.length > 0)
      .map((cat) => {
        const categoryItems = groupedItems[cat.key]
          .filter((item) => !item.checked)
          .map((item) => {
            const qty = formatQuantity(item.quantity, item.unit);
            return `  ${qty ? qty + ' ' : ''}${item.ingredient}`;
          })
          .join('\n');
        return categoryItems ? `${cat.label}:\n${categoryItems}` : '';
      })
      .filter(Boolean)
      .join('\n\n');

    try {
      await Share.share({
        message: `Shopping List\n\n${listText}`,
        title: 'Shopping List',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Clear all checked items
  const handleClearChecked = async () => {
    setCheckedKeys(new Set());
    try {
      await saveCheckedItems({
        weekStart,
        checkedItems: [],
      });
    } catch (error) {
      console.error('Failed to clear checked state:', error);
    }
  };

  // Clear all meal plans (removes all meal plan items from shopping list)
  const handleClearMealPlans = async () => {
    try {
      await clearAllMealPlans({});
      setCheckedKeys(new Set());
    } catch (error) {
      console.error('Failed to clear meal plans:', error);
    }
  };

  // Loading state
  if (shoppingData === undefined) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <View style={styles.loading}>
          <Spinner />
          <Caption style={{ marginTop: spacing.md }}>Generating shopping list...</Caption>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <ScreenTitle>Shopping List</ScreenTitle>
          <Caption>
            {totalCount > 0
              ? `${checkedCount} of ${totalCount} items`
              : shoppingData.mealCount > 0
                ? `${shoppingData.mealCount} meals planned`
                : 'No meals planned this week'
            }
          </Caption>
        </View>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.primary,
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        )}

        {/* Actions */}
        {totalCount > 0 && (
          <View style={styles.actions}>
            <Button onPress={handleShare} variant="secondary" size="sm">
              Share
            </Button>
            {checkedCount > 0 && (
              <Button onPress={handleClearChecked} variant="ghost" size="sm">
                Clear Done ({checkedCount})
              </Button>
            )}
            {shoppingData.mealCount > 0 && (
              <Button onPress={handleClearMealPlans} variant="ghost" size="sm">
                Clear Meals
              </Button>
            )}
          </View>
        )}

        {/* Empty State */}
        {items.length === 0 ? (
          <EmptyState
            messages={[
              { title: "Nothing to shop for", description: "Plan some meals to build your list" },
              { title: "Your list is empty", description: "Add recipes to your meal plan" },
              { title: "Ready to shop?", description: "Plan your week's meals first" },
            ]}
            action={{
              label: 'Plan Meals',
              onPress: () => navigation.navigate('MealPlanner'),
            }}
          />
        ) : (
          /* Category Sections */
          CATEGORIES.filter((cat) => groupedItems[cat.key]?.length > 0).map(
            (category) => (
              <View key={category.key} style={styles.categorySection}>
                {/* Category Header */}
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryChip, { backgroundColor: category.color }]} />
                  <SectionHeader>{category.label}</SectionHeader>
                  <Caption style={styles.categoryCount}>
                    {groupedItems[category.key].filter((i) => !i.checked).length}
                  </Caption>
                </View>

                {/* Items */}
                <Card style={styles.itemsCard}>
                  {groupedItems[category.key].map((item, index) => (
                    <React.Fragment key={item.id}>
                      {index > 0 && <Divider style={styles.itemDivider} />}
                      <Pressable
                        onPress={() => toggleItem(item)}
                        style={styles.itemRow}
                      >
                        <Checkbox
                          checked={item.checked}
                          onToggle={() => toggleItem(item)}
                        />
                        <View style={styles.itemContent}>
                          <View style={styles.itemMain}>
                            {item.quantity && (
                              <Text
                                style={[
                                  styles.itemQuantity,
                                  {
                                    color: item.checked
                                      ? colors.textMuted
                                      : colors.text,
                                  },
                                ]}
                              >
                                {formatQuantity(item.quantity, item.unit)}
                              </Text>
                            )}
                            <Text
                              style={[
                                styles.itemName,
                                {
                                  color: item.checked
                                    ? colors.textMuted
                                    : colors.text,
                                  textDecorationLine: item.checked
                                    ? 'line-through'
                                    : 'none',
                                },
                              ]}
                            >
                              {decodeHtmlEntities(item.ingredient)}
                            </Text>
                          </View>
                          {item.recipes.length > 0 && (
                            <Caption
                              numberOfLines={1}
                              style={{
                                color: item.checked
                                  ? colors.textMuted
                                  : colors.textSecondary,
                              }}
                            >
                              {item.recipes.length > 2
                                ? `${item.recipes.slice(0, 2).map(decodeHtmlEntities).join(', ')} +${item.recipes.length - 2} more`
                                : item.recipes.map(decodeHtmlEntities).join(', ')
                              }
                            </Caption>
                          )}
                        </View>
                        <Pressable
                          onPress={() => handleDeleteItem(item)}
                          style={({ pressed }) => [
                            styles.deleteButton,
                            { opacity: pressed ? 0.5 : 1 },
                          ]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Trash2
                            size={18}
                            color={colors.textMuted}
                            strokeWidth={1.5}
                          />
                        </Pressable>
                      </Pressable>
                    </React.Fragment>
                  ))}
                </Card>
              </View>
            )
          )
        )}

        {/* All Done State */}
        {items.length > 0 && checkedCount === totalCount && (
          <View style={styles.allDone}>
            <Text style={[styles.allDoneText, { color: colors.text }]}>
              List complete
            </Text>
            <Button onPress={handleClearChecked} variant="accent">
              Clear
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 80, // Account for floating tab bar
  },
  header: {
    marginBottom: spacing.md,
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryChip: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryCount: {
    marginLeft: 'auto',
  },
  itemsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemDivider: {
    marginVertical: 0,
    marginHorizontal: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  itemQuantity: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
  },
  itemName: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    flex: 1,
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  allDone: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  allDoneText: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.title,
  },
});
