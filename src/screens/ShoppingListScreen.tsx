// src/screens/ShoppingListScreen.tsx
// Aggregated shopping list from meal plans

import React, { useState, useMemo } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
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
} from '../components/ui';

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

// Category display order and icons
const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'produce', label: 'Produce', icon: '🥬' },
  { key: 'meat_seafood', label: 'Meat & Seafood', icon: '🥩' },
  { key: 'dairy', label: 'Dairy', icon: '🧀' },
  { key: 'bakery', label: 'Bakery', icon: '🍞' },
  { key: 'pantry', label: 'Pantry', icon: '🥫' },
  { key: 'frozen', label: 'Frozen', icon: '❄️' },
  { key: 'spices', label: 'Spices', icon: '🧂' },
  { key: 'condiments', label: 'Condiments', icon: '🍯' },
  { key: 'beverages', label: 'Beverages', icon: '🥤' },
  { key: 'other', label: 'Other', icon: '📦' },
];

export function ShoppingListScreen({ navigation }: ShoppingListScreenProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  // Mock shopping list data for demo
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: '1', ingredient: 'Chicken thighs', quantity: 2, unit: 'lbs', category: 'meat_seafood', checked: false, recipes: ['Creamy Tuscan Chicken'] },
    { id: '2', ingredient: 'Spinach', quantity: 4, unit: 'cups', category: 'produce', checked: false, recipes: ['Creamy Tuscan Chicken', 'Green Smoothie'] },
    { id: '3', ingredient: 'Sun-dried tomatoes', quantity: 1, unit: 'cup', category: 'pantry', checked: true, recipes: ['Creamy Tuscan Chicken'] },
    { id: '4', ingredient: 'Heavy cream', quantity: 1, unit: 'cup', category: 'dairy', checked: false, recipes: ['Creamy Tuscan Chicken'] },
    { id: '5', ingredient: 'Parmesan cheese', quantity: 0.5, unit: 'cup', category: 'dairy', checked: false, recipes: ['Creamy Tuscan Chicken', 'Pasta Primavera'] },
    { id: '6', ingredient: 'Garlic', quantity: 6, unit: 'cloves', category: 'produce', checked: true, recipes: ['Creamy Tuscan Chicken', 'Garlic Bread'] },
    { id: '7', ingredient: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'pantry', checked: false, recipes: ['Multiple recipes'] },
    { id: '8', ingredient: 'Avocados', quantity: 3, unit: undefined, category: 'produce', checked: false, recipes: ['Avocado Toast'] },
    { id: '9', ingredient: 'Sourdough bread', quantity: 1, unit: 'loaf', category: 'bakery', checked: false, recipes: ['Avocado Toast', 'Garlic Bread'] },
    { id: '10', ingredient: 'Eggs', quantity: 12, unit: undefined, category: 'dairy', checked: false, recipes: ['Avocado Toast', 'Breakfast Scramble'] },
    { id: '11', ingredient: 'Italian seasoning', quantity: 1, unit: 'tbsp', category: 'spices', checked: true, recipes: ['Creamy Tuscan Chicken'] },
    { id: '12', ingredient: 'Red pepper flakes', quantity: 0.5, unit: 'tsp', category: 'spices', checked: false, recipes: ['Pasta Primavera'] },
  ]);

  // Toggle item checked state
  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
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
  const handleClearChecked = () => {
    setItems((prev) => prev.filter((item) => !item.checked));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ScreenTitle>Shopping List</ScreenTitle>
          <Caption>
            {checkedCount} of {totalCount} items
          </Caption>
        </View>

        {/* Progress Bar */}
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

        {/* Actions */}
        <View style={styles.actions}>
          <Button onPress={handleShare} variant="secondary" size="sm" icon={<Text>📤</Text>}>
            Share
          </Button>
          {checkedCount > 0 && (
            <Button onPress={handleClearChecked} variant="ghost" size="sm">
              Clear Done ({checkedCount})
            </Button>
          )}
        </View>

        {/* Empty State */}
        {items.length === 0 ? (
          <EmptyState
            icon={<Text style={{ fontSize: 48 }}>🛒</Text>}
            title="Your list is empty"
            description="Plan some meals to generate a shopping list"
            action={{
              label: 'Go to Meal Planner',
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
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
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
                        onPress={() => toggleItem(item.id)}
                        style={styles.itemRow}
                      >
                        <Checkbox
                          checked={item.checked}
                          onToggle={() => toggleItem(item.id)}
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
                              {item.ingredient}
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
                              {item.recipes.join(', ')}
                            </Caption>
                          )}
                        </View>
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
            <Text style={styles.allDoneIcon}>🎉</Text>
            <Text style={[styles.allDoneText, { color: colors.text }]}>
              All done!
            </Text>
            <Button onPress={handleClearChecked} variant="primary">
              Clear List
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
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
  categoryIcon: {
    fontSize: 18,
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
  allDone: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  allDoneIcon: {
    fontSize: 48,
  },
  allDoneText: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.title,
  },
});
