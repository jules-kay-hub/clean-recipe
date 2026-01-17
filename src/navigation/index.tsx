// src/navigation/index.tsx
// Main navigation setup with authentication flow

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Animated, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Link, BookOpen, Calendar, ShoppingCart, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors, useTheme } from '../hooks/useTheme';
import { typography, spacing, borderRadius } from '../styles/theme';
import { TabBarVisibilityProvider, useOptionalTabBarVisibility } from '../hooks/useTabBarVisibility';
import { useAuth } from '../context/AuthContext';

// Screens
import { ExtractScreen } from '../screens/ExtractScreen';
import { RecipesScreen } from '../screens/RecipesScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { MealPlannerScreen } from '../screens/MealPlannerScreen';
import { ShoppingListScreen } from '../screens/ShoppingListScreen';
import { ExtractingScreen } from '../screens/ExtractingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CookingModeScreen } from '../screens/CookingModeScreen';
import { RecipePickerScreen } from '../screens/RecipePickerScreen';

// Auth Screens
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

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
  Extract: undefined;
  Recipes: undefined;
  MealPlanner: undefined;
  ShoppingList: {
    weekStart?: string;
    weekEnd?: string;
  } | undefined;
  Settings: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ═══════════════════════════════════════════════════════════════════════════
// TAB CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const TAB_CONFIG = [
  { name: 'Extract' as const, Icon: Link, label: 'Extract' },
  { name: 'Recipes' as const, Icon: BookOpen, label: 'Recipes' },
  { name: 'MealPlanner' as const, Icon: Calendar, label: 'Plan' },
  { name: 'ShoppingList' as const, Icon: ShoppingCart, label: 'Shop' },
  { name: 'Settings' as const, Icon: Settings, label: 'Settings' },
];

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING TAB BAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

// Web-specific frosted glass styles
const webFrostedGlass = Platform.OS === 'web' ? {
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)', // Safari support
} : {};

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isVisible, resetVisibility } = useOptionalTabBarVisibility();

  // Animation for hide/show
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isVisible ? 0 : 100,
      friction: 20,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [isVisible, translateY]);

  // Frosted glass background - semi-transparent with blur
  const frostedBackground = isDark
    ? 'rgba(30, 30, 30, 0.85)'  // Dark mode: dark semi-transparent
    : 'rgba(255, 255, 255, 0.85)'; // Light mode: white semi-transparent

  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.08)';

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        { paddingBottom: insets.bottom + 16 },
        { transform: [{ translateY }] },
      ]}
    >
      <View
        style={[
          styles.floatingBar,
          {
            backgroundColor: frostedBackground,
            borderColor: borderColor,
            borderWidth: 1,
            // Shadow for depth
            shadowColor: isDark ? '#000' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.15,
            shadowRadius: 12,
            elevation: 8,
          },
          webFrostedGlass as any,
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const tabConfig = TAB_CONFIG.find(t => t.name === route.name);
          const isFocused = state.index === index;

          if (!tabConfig) return null;

          const onPress = () => {
            // Haptic feedback on tab press
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Reset tab bar visibility when switching tabs
              resetVisibility();
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const IconComponent = tabConfig.Icon;
          const iconTextColor = isFocused ? colors.primary : colors.tabBarInactive;
          const bgColor = isFocused ? `${colors.primary}20` : 'transparent';

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tabItem,
                {
                  backgroundColor: bgColor,
                  transform: [{ scale: pressed ? 0.95 : isFocused ? 1.05 : 1 }],
                },
              ]}
            >
              <IconComponent
                size={22}
                color={iconTextColor}
                strokeWidth={isFocused ? 2 : 1.5}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: iconTextColor },
                ]}
              >
                {tabConfig.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

function MainTabs() {
  return (
    <TabBarVisibilityProvider>
      <Tab.Navigator
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Extract" component={ExtractScreen} />
        <Tab.Screen name="Recipes" component={RecipesScreen} />
        <Tab.Screen name="MealPlanner" component={MealPlannerScreen} />
        <Tab.Screen name="ShoppingList" component={ShoppingListScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </TabBarVisibilityProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

function AuthNavigator() {
  const colors = useColors();

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN STACK NAVIGATOR (authenticated users)
// ═══════════════════════════════════════════════════════════════════════════

function MainNavigator() {
  const colors = useColors();

  return (
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
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

export function RootNavigator() {
  const colors = useColors();
  const { isLoaded, isSignedIn } = useAuth();

  // Show loading state while auth is initializing
  if (!isLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isSignedIn ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  floatingBar: {
    flexDirection: 'row',
    borderRadius: 9999, // Pill shape
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    minWidth: 56,
  },
  tabLabel: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: 10,
  },
});
