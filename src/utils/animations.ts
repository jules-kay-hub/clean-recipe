// src/utils/animations.ts
// Animation constants and utilities for Julienned

import { Animated, Easing } from 'react-native';

/**
 * Timing durations (in milliseconds)
 */
export const timing = {
  /** Quick transitions - button feedback, micro-interactions */
  quick: 150,
  /** Standard transitions - most UI changes */
  standard: 250,
  /** Page transitions - screen changes, modals */
  page: 300,
  /** Slow transitions - emphasis, celebration */
  slow: 500,
  /** Stagger delay between items */
  stagger: 50,
} as const;

/**
 * Spring configurations for react-native Animated.spring()
 */
export const spring = {
  /** Gentle spring - subtle movements */
  gentle: {
    tension: 40,
    friction: 7,
    useNativeDriver: true,
  },
  /** Bouncy spring - playful feedback */
  bouncy: {
    tension: 50,
    friction: 5,
    useNativeDriver: true,
  },
  /** Snappy spring - quick, responsive */
  snappy: {
    tension: 100,
    friction: 10,
    useNativeDriver: true,
  },
  /** Stiff spring - controlled motion */
  stiff: {
    tension: 200,
    friction: 20,
    useNativeDriver: true,
  },
} as const;

/**
 * Easing functions
 */
export const easing = {
  /** Default ease-out - natural deceleration */
  default: Easing.bezier(0.4, 0, 0.2, 1),
  /** Ease-in - acceleration */
  easeIn: Easing.bezier(0.4, 0, 1, 1),
  /** Ease-out - deceleration */
  easeOut: Easing.bezier(0, 0, 0.2, 1),
  /** Ease-in-out - symmetric */
  easeInOut: Easing.bezier(0.4, 0, 0.6, 1),
  /** Bounce - playful overshoot */
  bounce: Easing.bounce,
  /** Elastic - spring-like */
  elastic: Easing.elastic(1),
} as const;

/**
 * Animation presets for common use cases
 */
export const presets = {
  /** Fade in animation */
  fadeIn: (value: Animated.Value, duration = timing.standard) => {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      easing: easing.default,
      useNativeDriver: true,
    });
  },

  /** Fade out animation */
  fadeOut: (value: Animated.Value, duration = timing.standard) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: easing.default,
      useNativeDriver: true,
    });
  },

  /** Slide up animation (for modals) */
  slideUp: (value: Animated.Value, duration = timing.page) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: easing.easeOut,
      useNativeDriver: true,
    });
  },

  /** Slide down animation (for dismissing) */
  slideDown: (value: Animated.Value, toValue: number, duration = timing.page) => {
    return Animated.timing(value, {
      toValue,
      duration,
      easing: easing.easeIn,
      useNativeDriver: true,
    });
  },

  /** Scale bounce animation (for buttons, checkboxes) */
  scaleBounce: (value: Animated.Value) => {
    return Animated.sequence([
      Animated.timing(value, {
        toValue: 0.95,
        duration: timing.quick / 2,
        easing: easing.easeIn,
        useNativeDriver: true,
      }),
      Animated.spring(value, {
        toValue: 1,
        ...spring.bouncy,
      }),
    ]);
  },

  /** Stagger animation for lists */
  staggeredFadeIn: (
    animations: Animated.CompositeAnimation[],
    staggerDelay = timing.stagger
  ) => {
    return Animated.stagger(staggerDelay, animations);
  },
} as const;

/**
 * Create a staggered animation for a list of items
 * @param count Number of items
 * @param createAnimation Function to create animation for each item
 * @param staggerDelay Delay between each item
 */
export function createStaggeredAnimations(
  count: number,
  createAnimation: (index: number) => Animated.CompositeAnimation,
  staggerDelay = timing.stagger
): Animated.CompositeAnimation {
  const animations = Array.from({ length: count }, (_, i) => createAnimation(i));
  return Animated.stagger(staggerDelay, animations);
}

/**
 * Create fade + slide animation for list items
 */
export function createItemEntryAnimation(
  opacity: Animated.Value,
  translateY: Animated.Value,
  delay = 0
): Animated.CompositeAnimation {
  return Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration: timing.standard,
      delay,
      easing: easing.default,
      useNativeDriver: true,
    }),
    Animated.timing(translateY, {
      toValue: 0,
      duration: timing.standard,
      delay,
      easing: easing.easeOut,
      useNativeDriver: true,
    }),
  ]);
}
