// src/screens/MealPlannerScreen.tsx
// Weekly meal planning calendar

import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Text,
  Image,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { api } from '../../convex/_generated/api';
import { RootStackParamList, TabParamList } from '../navigation';
import { useColors, useTheme } from '../hooks/useTheme';
import { spacing, borderRadius, typography, shadows } from '../styles/theme';
import {
  ScreenTitle,
  SectionHeader,
  Caption,
  Button,
  Card,
} from '../components/ui';
import { decodeHtmlEntities } from '../utils/textUtils';

type MealPlannerNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'MealPlanner'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface MealPlannerScreenProps {
  navigation: MealPlannerNavigationProp;
}

type MealSlot = 'breakfast' | 'lunch' | 'dinner';

const MEAL_SLOTS: { key: MealSlot; label: string; icon: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { key: 'lunch', label: 'Lunch', icon: '☀️' },
  { key: 'dinner', label: 'Dinner', icon: '🌙' },
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MealPlannerScreen({ navigation }: MealPlannerScreenProps) {
  const colors = useColors();
  const { isDark } = useTheme();

  // Current week state
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculate week dates
  const weekDates = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [weekOffset]);

  // Format date for API
  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date: Date): boolean => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Fetch meal plan for selected date
  const mealPlan = useQuery(api.mealPlans.getByDate, {
    date: formatDateKey(selectedDate),
  });

  // Mutation to remove a meal
  const removeMeal = useMutation(api.mealPlans.removeMeal);

  // Get recipe for a meal slot
  const getMealForSlot = (slot: MealSlot) => {
    return mealPlan?.meals.find((m) => m.slot === slot);
  };

  // Remove a meal from a slot
  const handleRemoveMeal = async (slot: MealSlot) => {
    try {
      await removeMeal({
        date: formatDateKey(selectedDate),
        slot,
      });
    } catch (error) {
      console.error('Failed to remove meal:', error);
    }
  };

  // Navigate to recipe picker
  const handleAddMeal = (slot: MealSlot) => {
    navigation.navigate('RecipePicker', {
      date: formatDateKey(selectedDate),
      slot,
    });
  };

  // Navigate to recipe detail
  const handleMealPress = (recipeId: string) => {
    navigation.navigate('RecipeDetail', { recipeId });
  };

  // Generate shopping list for the week
  const handleGenerateShoppingList = () => {
    navigation.navigate('ShoppingList', {
      weekStart: formatDateKey(weekDates[0]),
      weekEnd: formatDateKey(weekDates[6]),
    });
  };

  const previousWeek = () => setWeekOffset((prev) => prev - 1);
  const nextWeek = () => setWeekOffset((prev) => prev + 1);
  const goToToday = () => {
    setWeekOffset(0);
    setSelectedDate(new Date());
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
          <ScreenTitle>Meal Planner</ScreenTitle>
          <Caption>Plan your week, simplify your shopping</Caption>
        </View>

        {/* Week Navigation */}
        <View style={[styles.weekNav, { backgroundColor: colors.surface }, shadows.sm]}>
          <Pressable
            onPress={previousWeek}
            style={[styles.navButton, { backgroundColor: colors.inputBackground }]}
          >
            <Text style={[styles.navIcon, { color: colors.primary }]}>←</Text>
          </Pressable>

          <Pressable onPress={goToToday} style={styles.weekLabel}>
            <Text style={[styles.weekLabelText, { color: colors.text }]}>
              {weekOffset === 0
                ? 'This Week'
                : weekOffset === 1
                ? 'Next Week'
                : weekOffset === -1
                ? 'Last Week'
                : weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
                  ' - ' +
                  weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
            {weekOffset !== 0 && (
              <Caption style={{ textAlign: 'center' }}>Tap to go to today</Caption>
            )}
          </Pressable>

          <Pressable
            onPress={nextWeek}
            style={[styles.navButton, { backgroundColor: colors.inputBackground }]}
          >
            <Text style={[styles.navIcon, { color: colors.primary }]}>→</Text>
          </Pressable>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelector}>
          {weekDates.map((date, index) => (
            <Pressable
              key={index}
              onPress={() => setSelectedDate(date)}
              style={[
                styles.dayButton,
                {
                  backgroundColor: isSelected(date)
                    ? colors.primary
                    : colors.surface,
                  borderColor: isToday(date) && !isSelected(date)
                    ? colors.accent
                    : 'transparent',
                  borderWidth: isToday(date) && !isSelected(date) ? 2 : 0,
                },
                shadows.sm,
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  { color: isSelected(date) ? colors.textInverse : colors.textSecondary },
                ]}
              >
                {DAYS_OF_WEEK[date.getDay()]}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  { color: isSelected(date) ? colors.textInverse : colors.text },
                ]}
              >
                {date.getDate()}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Selected Date Label */}
        <View style={styles.selectedDateLabel}>
          <SectionHeader>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </SectionHeader>
        </View>

        {/* Meal Slots */}
        <View style={styles.mealSlots}>
          {MEAL_SLOTS.map((slot) => {
            const meal = getMealForSlot(slot.key);

            return (
              <Card
                key={slot.key}
                style={styles.mealCard}
                onPress={() => meal ? handleMealPress(meal.recipeId) : handleAddMeal(slot.key)}
              >
                <View style={styles.mealSlotHeader}>
                  <Text style={styles.mealIcon}>{slot.icon}</Text>
                  <Text style={[styles.mealSlotLabel, { color: colors.textSecondary }]}>
                    {slot.label}
                  </Text>
                </View>

                {meal ? (
                  <View style={styles.mealContent}>
                    {meal.recipeImage && (
                      <Image
                        source={{ uri: meal.recipeImage }}
                        style={styles.mealImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.mealInfo}>
                      <Text
                        style={[styles.recipeName, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {decodeHtmlEntities(meal.recipeName)}
                      </Text>
                      <View style={styles.mealActions}>
                        <Pressable
                          onPress={() => handleAddMeal(slot.key)}
                          style={styles.changeButton}
                        >
                          <Caption style={{ color: colors.primary }}>Change</Caption>
                        </Pressable>
                        <Pressable
                          onPress={() => handleRemoveMeal(slot.key)}
                          style={styles.removeButton}
                        >
                          <Caption style={{ color: colors.error }}>Remove</Caption>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleAddMeal(slot.key)}
                    style={[styles.addMealButton, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.addIcon, { color: colors.primary }]}>+</Text>
                    <Text style={[styles.addText, { color: colors.primary }]}>
                      Add Recipe
                    </Text>
                  </Pressable>
                )}
              </Card>
            );
          })}
        </View>

        {/* Generate Shopping List CTA */}
        <View style={styles.ctaSection}>
          <Button
            onPress={handleGenerateShoppingList}
            variant="accent"
            fullWidth
            icon={<Text>🛒</Text>}
          >
            Generate Shopping List
          </Button>
          <Caption style={{ textAlign: 'center', marginTop: spacing.sm }}>
            Creates a list from all planned meals this week
          </Caption>
        </View>
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
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  weekLabel: {
    flex: 1,
    alignItems: 'center',
  },
  weekLabelText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: 2,
    borderRadius: borderRadius.sm,
  },
  dayName: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.label,
    marginBottom: 2,
  },
  dayNumber: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
  },
  selectedDateLabel: {
    marginBottom: spacing.md,
  },
  mealSlots: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  mealCard: {
    padding: spacing.md,
  },
  mealSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  mealIcon: {
    fontSize: 20,
  },
  mealSlotLabel: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  mealInfo: {
    flex: 1,
  },
  recipeName: {
    fontFamily: typography.fonts.display,
    fontSize: typography.sizes.body,
    marginBottom: spacing.xs,
  },
  mealActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  changeButton: {
    paddingVertical: spacing.xs,
  },
  removeButton: {
    paddingVertical: spacing.xs,
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.sm,
  },
  addIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  addText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.body,
  },
  ctaSection: {
    marginTop: spacing.lg,
  },
});
