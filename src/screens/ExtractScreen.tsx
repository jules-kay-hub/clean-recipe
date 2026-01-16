// src/screens/ExtractScreen.tsx
// Minimal extraction-focused screen

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Text,
  TextInput,
} from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { useQuery, useAction, useMutation } from 'convex/react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { RootStackParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { spacing, typography, borderRadius } from '../styles/theme';
import { URLInput } from '../components/URLInput';
import { ConfirmModal } from '../components/ConfirmModal';
import { JuliennedIcon } from '../components/JuliennedIcon';

interface ExtractScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export function ExtractScreen({ navigation }: ExtractScreenProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const [extractError, setExtractError] = useState<string | undefined>();
  const [isExtracting, setIsExtracting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [urlClearTrigger, setUrlClearTrigger] = useState(0);
  const [shouldFocus, setShouldFocus] = useState(false);
  const urlInputRef = useRef<TextInput>(null);

  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.8)).current;

  const [duplicateConfirm, setDuplicateConfirm] = useState<{
    visible: boolean;
    url: string;
    existingRecipe: { _id: string; title: string } | null;
  }>({ visible: false, url: '', existingRecipe: null });

  // Fetch recipes and get/create demo user
  const extractRecipe = useAction(api.extraction.extractRecipe);
  const getOrCreateDemoUser = useMutation(api.users.getOrCreateDemoUser);
  const recipes = useQuery(api.recipes.list, userId ? { userId } : "skip") || [];

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

  // Auto-focus URL input when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Small delay to ensure screen is fully rendered
      const timer = setTimeout(() => {
        setShouldFocus(true);
      }, 100);
      return () => {
        clearTimeout(timer);
        setShouldFocus(false);
      };
    }, [])
  );

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

  // Duplicate confirmation handlers
  const confirmDuplicateExtract = () => {
    const url = duplicateConfirm.url;
    setDuplicateConfirm({ visible: false, url: '', existingRecipe: null });
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <View style={styles.content}>
        {/* App Icon */}
        <JuliennedIcon size={80} />

        {/* App Name */}
        <Text style={[styles.appName, { color: colors.text }]}>
          Julienned
        </Text>

        {/* URL Input */}
        <View style={styles.inputContainer}>
          <URLInput
            onExtract={handleExtract}
            isLoading={isExtracting}
            error={extractError}
            clearTrigger={urlClearTrigger}
            autoFocus={shouldFocus}
          />
        </View>
      </View>

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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 80, // Account for floating tab bar
  },
  appName: {
    fontFamily: typography.fonts.display,
    fontSize: 28,
    marginTop: spacing.md,
    marginBottom: spacing['2xl'],
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
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
