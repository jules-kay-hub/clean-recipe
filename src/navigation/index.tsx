// src/navigation/index.tsx
// Main navigation setup using React Navigation

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColors } from '../hooks/useTheme';
import { typography, spacing } from '../styles/theme';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { MealPlannerScreen } from '../screens/MealPlannerScreen';
import { ShoppingListScreen } from '../screens/ShoppingListScreen';
import { ExtractingScreen } from '../screens/ExtractingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CookingModeScreen } from '../screens/CookingModeScreen';
import { RecipePickerScreen } from '../screens/RecipePickerScreen';

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type RootStackParamList = {
  MainTabs: undefined;
  RecipeDetail: { recipeId: string };
  Extracting: { url: string };
  RecipePicker: { date: string; slot: 'breakfast' | 'lunch' | 'dinner' };
  CookingMode: {
    recipeId: string;
    servings: number;
    checkedIngredients: number[];
  };
};

export type TabParamList = {
  Home: undefined;
  MealPlanner: undefined;
  ShoppingList: {
    weekStart?: string;
    weekEnd?: string;
  } | undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ═══════════════════════════════════════════════════════════════════════════
// TAB ICON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface TabIconProps {
  focused: boolean;
  icon: string;
  label: string;
}

function TabIcon({ focused, icon, label }: TabIconProps) {
  const colors = useColors();

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.6 }]}>
        {icon}
      </Text>
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? colors.tabBarActive : colors.tabBarInactive },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

function MainTabs() {
  const colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          height: 60 + 20, // 60px + safe area
          paddingTop: spacing.sm,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="📖" label="Recipes" />
          ),
        }}
      />
      <Tab.Screen
        name="MealPlanner"
        component={MealPlannerScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="📅" label="Plan" />
          ),
        }}
      />
      <Tab.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🛒" label="Shop" />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="⚙️" label="Settings" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

export function RootNavigator() {
  const colors = useColors();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontFamily: typography.fonts.sansBold,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RecipeDetail"
          component={RecipeDetailScreen}
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="Extracting"
          component={ExtractingScreen as React.ComponentType}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="RecipePicker"
          component={RecipePickerScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="CookingMode"
          component={CookingModeScreen}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabLabel: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 10,
  },
});
