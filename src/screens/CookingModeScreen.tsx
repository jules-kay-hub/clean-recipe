// src/screens/CookingModeScreen.tsx
// Step-by-step cooking mode with wake lock

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useQuery } from 'convex/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { RootStackParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { spacing, typography, borderRadius } from '../styles/theme';
import { Spinner } from '../components/ui';

// Decode HTML entities in text
function decodeHtmlEntities(text: string): string {
  if (!text) return text;
  let result = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D');

  result = result.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 10))
  );
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );

  return result;
}

interface CookingModeScreenProps {
  route: {
    params: {
      recipeId: string;
      servings: number;
      checkedIngredients: number[];
    };
  };
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export function CookingModeScreen({ route, navigation }: CookingModeScreenProps) {
  const { recipeId, servings, checkedIngredients } = route.params;
  const colors = useColors();
  const { isDark } = useTheme();

  // Keep screen awake while in cooking mode
  useKeepAwake();

  // Fetch recipe data
  const recipe = useQuery(api.recipes.getById, { id: recipeId as Id<"recipes"> });

  // Current step state
  const [currentStep, setCurrentStep] = useState(0);

  // Calculate scaling factor for ingredients
  const scaleFactor = recipe?.servings ? servings / recipe.servings : 1;

  // Navigation handlers
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (recipe && currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  // Loading state
  if (!recipe) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Spinner />
        </View>
      </SafeAreaView>
    );
  }

  const totalSteps = recipe.instructions.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const currentInstruction = recipe.instructions[currentStep];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={goBack} style={styles.closeButton}>
          <Text style={[styles.closeIcon, { color: colors.text }]}>×</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.recipeName, { color: colors.textSecondary }]} numberOfLines={1}>
            {decodeHtmlEntities(recipe.title)}
          </Text>
          <Text style={[styles.stepIndicator, { color: colors.primary }]}>
            Step {currentStep + 1} of {totalSteps}
          </Text>
        </View>
        <View style={styles.closeButton} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.primary,
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Number Badge */}
        <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.stepBadgeText, { color: colors.textInverse }]}>
            {currentStep + 1}
          </Text>
        </View>

        {/* Instruction Text */}
        <Text style={[styles.instructionText, { color: colors.text }]}>
          {decodeHtmlEntities(currentInstruction)}
        </Text>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {/* Previous Button */}
        <Pressable
          onPress={goToPreviousStep}
          disabled={isFirstStep}
          style={({ pressed }) => [
            styles.navButton,
            styles.prevButton,
            {
              backgroundColor: isFirstStep ? colors.border : colors.cardBackground,
              opacity: pressed && !isFirstStep ? 0.8 : 1,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.navButtonIcon,
              { color: isFirstStep ? colors.textSecondary : colors.text },
            ]}
          >
            ←
          </Text>
          <Text
            style={[
              styles.navButtonText,
              { color: isFirstStep ? colors.textSecondary : colors.text },
            ]}
          >
            Previous
          </Text>
        </Pressable>

        {/* Next/Done Button */}
        <Pressable
          onPress={isLastStep ? goBack : goToNextStep}
          style={({ pressed }) => [
            styles.navButton,
            styles.nextButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[styles.navButtonText, { color: colors.textInverse }]}>
            {isLastStep ? 'Done' : 'Next'}
          </Text>
          {!isLastStep && (
            <Text style={[styles.navButtonIcon, { color: colors.textInverse }]}>
              →
            </Text>
          )}
          {isLastStep && (
            <Text style={[styles.navButtonIcon, { color: colors.textInverse }]}>
              ✓
            </Text>
          )}
        </Pressable>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 32,
    fontWeight: '300',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  recipeName: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
    marginBottom: 2,
  },
  stepIndicator: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
  },
  progressContainer: {
    height: 4,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  stepBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  stepBadgeText: {
    fontFamily: typography.fonts.displayBold,
    fontSize: 28,
  },
  instructionText: {
    fontFamily: typography.fonts.sans,
    fontSize: 22,
    lineHeight: 34,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  prevButton: {
    borderWidth: 1,
  },
  nextButton: {},
  navButtonIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  navButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
  },
});
