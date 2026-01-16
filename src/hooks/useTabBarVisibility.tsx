// src/hooks/useTabBarVisibility.tsx
// Context and hook for controlling tab bar visibility on scroll

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface TabBarVisibilityContextType {
  isVisible: boolean;
  setVisible: (visible: boolean) => void;
  // Scroll handler to connect to ScrollView/FlatList
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  // Reset visibility (e.g., when changing tabs)
  resetVisibility: () => void;
}

const TabBarVisibilityContext = createContext<TabBarVisibilityContextType | undefined>(undefined);

interface TabBarVisibilityProviderProps {
  children: React.ReactNode;
}

export function TabBarVisibilityProvider({ children }: TabBarVisibilityProviderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 10; // Minimum scroll distance before triggering

  const setVisible = useCallback((visible: boolean) => {
    setIsVisible(visible);
  }, []);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;

    // Only trigger if scrolled past threshold
    if (Math.abs(diff) > scrollThreshold) {
      if (diff > 0 && currentScrollY > 50) {
        // Scrolling down and past top - hide
        setIsVisible(false);
      } else if (diff < 0) {
        // Scrolling up - show
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    }

    // Always show when near top
    if (currentScrollY <= 0) {
      setIsVisible(true);
      lastScrollY.current = 0;
    }
  }, []);

  const resetVisibility = useCallback(() => {
    setIsVisible(true);
    lastScrollY.current = 0;
  }, []);

  return (
    <TabBarVisibilityContext.Provider value={{ isVisible, setVisible, onScroll, resetVisibility }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility() {
  const context = useContext(TabBarVisibilityContext);
  if (context === undefined) {
    throw new Error('useTabBarVisibility must be used within a TabBarVisibilityProvider');
  }
  return context;
}

// Optional hook that returns a no-op for screens that don't need hide-on-scroll
export function useOptionalTabBarVisibility() {
  const context = useContext(TabBarVisibilityContext);
  return context || {
    isVisible: true,
    setVisible: () => {},
    onScroll: () => {},
    resetVisibility: () => {},
  };
}
