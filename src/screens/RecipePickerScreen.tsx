// src/screens/RecipePickerScreen.tsx
// Select a recipe to add to meal plan

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Image,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UtensilsCrossed, Clock, Users } from 'lucide-react-native';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { RootStackParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography, shadows } from '../styles/theme';
import { Spinner } from '../components/ui';
import { decodeHtmlEntities } from '../utils/textUtils';

interface RecipePickerScreenProps {
  route: {
    params: {
      date: string;
      slot: 'breakfast' | 'lunch' | 'dinner';
    };
  };
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

// Format slot name for display
function formatSlot(slot: string): string {
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function RecipePickerScreen({ route, navigation }: RecipePickerScreenProps) {
  const { date, slot } = route.params;
  const colors = useColors();
  const { isDark } = useTheme();

  // Get demo user ID for recipe fetching
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const getOrCreateDemoUser = useMutation(api.users.getOrCreateDemoUser);

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

  // Fetch user's saved recipes
  const recipes = useQuery(api.recipes.list, userId ? { userId } : "skip");
  const setMeal = useMutation(api.mealPlans.setMeal);

  // Handle recipe selection
  const handleSelectRecipe = async (recipeId: Id<"recipes">) => {
    try {
      await setMeal({
        date,
        slot,
        recipeId,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to set meal:', error);
    }
  };

  // Render recipe item
  const renderRecipe = ({ item }: { item: any }) => {
    const totalTime = (item.prepTime || 0) + (item.cookTime || 0);

    return (
      <Pressable
        onPress={() => handleSelectRecipe(item._id)}
        style={({ pressed }) => [
          styles.recipeCard,
          {
            backgroundColor: colors.cardBackground,
            opacity: pressed ? 0.8 : 1,
          },
          shadows.sm,
        ]}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.border }]}>
              <UtensilsCrossed size={24} color={colors.textSecondary} strokeWidth={1.5} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {decodeHtmlEntities(item.title)}
          </Text>

          <View style={styles.metaRow}>
            {totalTime > 0 && (
              <View style={styles.metaItem}>
                <Clock size={12} color={colors.textSecondary} strokeWidth={1.5} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {totalTime} min
                </Text>
              </View>
            )}
            {item.servings && (
              <View style={styles.metaItem}>
                <Users size={12} color={colors.textSecondary} strokeWidth={1.5} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {item.servings}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Select indicator */}
        <View style={[styles.selectIndicator, { backgroundColor: colors.primary }]}>
          <Text style={[styles.selectText, { color: colors.textInverse }]}>+</Text>
        </View>
      </Pressable>
    );
  };

  // Empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No recipes
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Add recipes first
      </Text>
      <Pressable
        onPress={() => {
          navigation.goBack();
          // Navigate to home to add recipes
          navigation.navigate('MainTabs');
        }}
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.emptyButtonText, { color: colors.textInverse }]}>
          Add Recipes
        </Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Select Recipe
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {formatSlot(slot)} on {formatDate(date)}
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Recipe List */}
      {recipes === undefined ? (
        <View style={styles.loading}>
          <Spinner />
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fonts.displayBold,
    fontSize: typography.sizes.sectionHeader,
  },
  headerSubtitle: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 80,
    height: 80,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.body,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
  },
  selectIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  selectText: {
    fontSize: 20,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: spacing['2xl'],
  },
  emptyTitle: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.title,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
  },
});
