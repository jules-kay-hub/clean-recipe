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
import { useQuery } from 'convex/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { RootStackParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { spacing, typography, shadows } from '../styles/theme';
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

  // Local state
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

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
              <Text style={styles.backIcon}>←</Text>
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
                <Text style={styles.metaIcon}>⏱</Text>
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

          {/* Source Link */}
          {recipe.sourceUrl && (
            <>
              <Divider />
              <View style={styles.sourceSection}>
                <Caption>
                  Source: {new URL(recipe.sourceUrl).hostname.replace('www.', '')}
                </Caption>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.cta, { backgroundColor: colors.background }, shadows.lg]}>
        <Button onPress={startCooking} variant="accent" fullWidth icon={<Text>🍳</Text>}>
          Start Cooking
        </Button>
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
  backIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
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
  metaIcon: {
    fontSize: 16,
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
  },
  cta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
});
