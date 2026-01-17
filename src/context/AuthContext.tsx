// src/context/AuthContext.tsx
// Authentication context providing Clerk integration for the app

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface User {
  _id: Id<"users">;
  clerkId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  preferences?: {
    defaultServings?: number;
    theme?: 'light' | 'dark' | 'system';
    measurementSystem?: 'metric' | 'imperial';
  };
  createdAt: number;
  lastActiveAt?: number;
}

interface AuthContextValue {
  // Auth state
  isSignedIn: boolean;
  isLoaded: boolean;
  userId: Id<"users"> | null;
  user: User | null;

  // Clerk user info
  clerkUser: ReturnType<typeof useUser>['user'];

  // Actions
  signOut: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isSignedIn, isLoaded: isClerkLoaded, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);

  // Convex mutations and queries
  const getOrCreateFromClerk = useMutation(api.users.getOrCreateFromClerk);
  const convexUser = useQuery(
    api.users.getCurrent,
    isSignedIn ? {} : "skip"
  );

  // Sync Clerk user with Convex on sign in
  useEffect(() => {
    const syncUser = async () => {
      if (isClerkLoaded && isSignedIn) {
        try {
          await getOrCreateFromClerk();
        } catch (error) {
          console.error('Failed to sync user with Convex:', error);
        }
      }
      setIsLoaded(isClerkLoaded);
    };

    syncUser();
  }, [isClerkLoaded, isSignedIn, getOrCreateFromClerk]);

  // Sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      await clerkSignOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }, [clerkSignOut]);

  const value: AuthContextValue = {
    isSignedIn: !!isSignedIn,
    isLoaded,
    userId: convexUser?._id ?? null,
    user: convexUser as User | null,
    clerkUser: clerkUser ?? null,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook to access authentication state and actions
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to require authentication
 * Returns userId or throws if not authenticated
 */
export function useRequireAuth(): { userId: Id<"users">; user: User } {
  const { isLoaded, isSignedIn, userId, user } = useAuth();

  if (!isLoaded) {
    throw new Error('Auth not loaded');
  }

  if (!isSignedIn || !userId || !user) {
    throw new Error('Not authenticated');
  }

  return { userId, user };
}
