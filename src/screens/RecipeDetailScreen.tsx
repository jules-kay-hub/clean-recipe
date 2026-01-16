// src/screens/RecipeDetailScreen.tsx
// Full recipe view with ingredients and instructions

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Text,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Clock, ShoppingCart } from 'lucide-react-native';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { RootStackParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { spacing, typography, shadows } from '../styles/theme';
import { formatRelativeTime } from '../utils/dateUtils';
import {
  HeroTitle,
  SectionHeader,
  Caption,
  Button,
  Divider,
  Spinner,
} from '../components/ui';
import { IngredientItem } from '../components/IngredientItem';
import { ServingsAdjuster } from '../components/ServingsAdjuster';
import { decodeHtmlEntities } from '../utils/textUtils';

interface RecipeDetailScreenProps {
  route: { params: { recipeId: string } };
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export function RecipeDetailScreen({ route, navigation }: RecipeDetailScreenProps) {
  const { recipeId } = route.params;
  const colors = useColors();
  const { isDark } = useTheme();

  // Fetch recipe
  const recipe = useQuery(api.recipes.getById, { id: recipeId as Id<"recipes"> });

  // Mutations
  const addToShoppingList = useMutation(api.shoppingLists.addRecipeToList);

  // Local state
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [addedToList, setAddedToList] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);

  // Update servings when recipe loads
  useEffect(() => {
    if (recipe?.servings) {
      setServings(recipe.servings);
    }
  }, [recipe?.servings]);

  // Calculate scaling factor
  const scaleFactor = useMemo(() => {
    if (!recipe?.servings) return 1;
    return servings / recipe.servings;
  }, [servings, recipe?.servings]);

  // Scale ingredient quantity
  const scaleQuantity = (quantity: number | undefined): number | undefined => {
    if (quantity === undefined) return undefined;
    const scaled = quantity * scaleFactor;
    // Round to reasonable precision
    return Math.round(scaled * 100) / 100;
  };

  // Toggle ingredient checked state
  const toggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Start cooking mode
  const startCooking = () => {
    navigation.navigate('CookingMode', {
      recipeId,
      servings,
      checkedIngredients: Array.from(checkedIngredients),
    });
  };

  // Add to shopping list
  const handleAddToShoppingList = async () => {
    if (isAddingToList || addedToList) return;

    setIsAddingToList(true);
    try {
      // Get current week start date
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const weekStart = startOfWeek.toISOString().split('T')[0];

      await addToShoppingList({
        weekStart,
        recipeId: recipeId as Id<"recipes">,
      });
      setAddedToList(true);

      // Reset after a few seconds
      setTimeout(() => setAddedToList(false), 3000);
    } catch (error) {
      console.error('Failed to add to shopping list:', error);
    } finally {
      setIsAddingToList(false);
    }
  };

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Spinner />
        </View>
      </SafeAreaView>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        {recipe.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: recipe.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {/* Back Button Overlay */}
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.backButton, { backgroundColor: colors.overlay }]}
            >
              <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2} />
            </Pressable>
          </View>
        )}

        <View style={styles.content}>
          {/* Title */}
          <HeroTitle style={styles.title}>{decodeHtmlEntities(recipe.title)}</HeroTitle>

          {/* Meta Info */}
          <View style={styles.metaRow}>
            {totalTime > 0 && (
              <View style={styles.metaItem}>
                <Clock size={16} color={colors.textSecondary} strokeWidth={1.5} />
                <Caption>{totalTime} min</Caption>
              </View>
            )}
            {recipe.prepTime && (
              <View style={styles.metaItem}>
                <Caption>Prep: {recipe.prepTime}m</Caption>
              </View>
            )}
            {recipe.cookTime && (
              <View style={styles.metaItem}>
                <Caption>Cook: {recipe.cookTime}m</Caption>
              </View>
            )}
          </View>

          <Divider />

          {/* Servings Adjuster */}
          {recipe.servings && (
            <View style={styles.servingsSection}>
              <ServingsAdjuster
                value={servings}
                originalValue={recipe.servings}
                onChange={setServings}
              />
            </View>
          )}

          <Divider />

          {/* Ingredients */}
          <View style={styles.section}>
            <SectionHeader>Ingredients</SectionHeader>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient: { text: string; quantity?: number; unit?: string; item?: string; preparation?: string; category?: string }, index: number) => (
                <IngredientItem
                  key={index}
                  text={ingredient.text}
                  quantity={scaleQuantity(ingredient.quantity)}
                  unit={ingredient.unit}
                  item={ingredient.item}
                  checked={checkedIngredients.has(index)}
                  onToggle={() => toggleIngredient(index)}
                />
              ))}
            </View>
          </View>

          <Divider />

          {/* Instructions */}
          <View style={styles.section}>
            <SectionHeader>Instructions</SectionHeader>
            <View style={styles.instructionsList}>
              {recipe.instructions.map((instruction: string, index: number) => (
                <View key={index} style={styles.instructionItem}>
                  <View
                    style={[
                      styles.stepNumber,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Text style={[styles.stepNumberText, { color: colors.textInverse }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    {decodeHtmlEntities(instruction)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Source Link & Added Date */}
          {(recipe.sourceUrl || recipe.extractedAt) && (
            <>
              <Divider />
              <View style={styles.sourceSection}>
                {recipe.sourceUrl && (
                  <Caption>
                    Source: {new URL(recipe.sourceUrl).hostname.replace('www.', '')}
                  </Caption>
                )}
                {recipe.extractedAt && (
                  <Caption style={styles.addedCaption}>
                    Added {formatRelativeTime(recipe.extractedAt)}
                  </Caption>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.cta, { backgroundColor: colors.background }, shadows.lg]}>
        <View style={styles.ctaRow}>
          <Pressable
            onPress={handleAddToShoppingList}
            disabled={isAddingToList}
            style={({ pressed }) => [
              styles.shopButton,
              {
                backgroundColor: addedToList ? colors.success : colors.surface,
                borderColor: addedToList ? colors.success : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <ShoppingCart
              size={20}
              color={addedToList ? colors.textInverse : colors.text}
              strokeWidth={1.5}
            />
            {addedToList && (
              <Text style={[styles.shopButtonText, { color: colors.textInverse }]}>
                Added!
              </Text>
            )}
          </Pressable>
          <View style={styles.ctaButtonFlex}>
            <Button onPress={startCooking} variant="accent" fullWidth>
              Cook
            </Button>
          </View>
        </View>
      </View>
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
    paddingBottom: 100, // Space for sticky CTA
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: spacing.xl + 20, // Account for status bar
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  servingsSection: {
    paddingVertical: spacing.md,
  },
  section: {
    paddingVertical: spacing.md,
  },
  ingredientsList: {
    marginTop: spacing.md,
  },
  instructionsList: {
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.caption,
  },
  instructionText: {
    flex: 1,
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    lineHeight: typography.sizes.body * typography.lineHeights.body,
  },
  sourceSection: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  addedCaption: {
    marginTop: spacing.xs,
  },
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 48,
  },
  shopButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.caption,
  },
  ctaButtonFlex: {
    flex: 1,
  },
});
