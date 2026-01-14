// src/screens/HomeScreen.tsx
// Main recipe library screen

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useQuery, useAction, useMutation } from 'convex/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../convex/_generated/api';
import { Doc, Id } from '../../convex/_generated/dataModel';
import { RootStackParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { spacing } from '../styles/theme';
import { ScreenTitle, Caption, EmptyState, Spinner } from '../components/ui';
import { URLInput } from '../components/URLInput';
import { RecipeCard } from '../components/RecipeCard';

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [extractError, setExtractError] = useState<string | undefined>();
  const [isExtracting, setIsExtracting] = useState(false);
  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  // Fetch recipes and get/create demo user
  const recipes = useQuery(api.recipes.list) || [];
  const extractRecipe = useAction(api.extraction.extractRecipe);
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

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Convex auto-refetches, just need to wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleExtract = async (url: string) => {
    if (!userId) {
      setExtractError('User not initialized. Please try again.');
      return;
    }

    setExtractError(undefined);
    setIsExtracting(true);

    try {
      const result = await extractRecipe({
        url,
        userId,
      });

      if (result.success && result.recipe) {
        // Navigate to the new recipe
        navigation.navigate('RecipeDetail', { recipeId: result.recipe._id });
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
          <ScreenTitle>My Recipes</ScreenTitle>
          <Caption>{recipes.length} recipes saved</Caption>
        </View>

        {/* URL Input */}
        <URLInput
          onExtract={handleExtract}
          isLoading={isExtracting}
          error={extractError}
        />

        {/* Recipe Grid */}
        {recipes === undefined ? (
          <View style={styles.loading}>
            <Spinner />
          </View>
        ) : recipes.length === 0 ? (
          <EmptyState
            icon={<Caption style={{ fontSize: 48 }}>📖</Caption>}
            title="No recipes yet"
            description="Paste a recipe URL above to get started"
          />
        ) : (
          <View style={styles.grid}>
            {recipes.map((recipe: Doc<"recipes">) => (
              <RecipeCard
                key={recipe._id}
                id={recipe._id}
                title={recipe.title}
                imageUrl={recipe.imageUrl}
                prepTime={recipe.prepTime}
                cookTime={recipe.cookTime}
                servings={recipe.servings}
                onPress={handleRecipePress}
              />
            ))}
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
    marginBottom: spacing.lg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  grid: {
    // Single column on mobile, would use FlatList with numColumns for grid
  },
});
