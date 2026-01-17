// src/screens/SignInScreen.tsx
// Sign in screen with email/password and OAuth options

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { useColors, useTheme } from '../hooks/useTheme';
import { typography, spacing, borderRadius } from '../styles/theme';
import { JuliennedIcon } from '../components/JuliennedIcon';
import { AuthStackParamList } from '../navigation';

// Handle OAuth redirects
WebBrowser.maybeCompleteAuthSession();

interface SignInScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;
}

export function SignInScreen({ navigation }: SignInScreenProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const { signIn, setActive, isLoaded } = useSignIn();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OAuth hooks
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });

  // Email/password sign in
  const handleSignIn = useCallback(async () => {
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        // Handle additional steps if needed (e.g., 2FA)
        console.log('Sign in requires additional steps:', result.status);
        setError('Additional verification required. Please try again.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Failed to sign in. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, email, password, setActive]);

  // Google OAuth
  const handleGoogleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { createdSessionId, setActive: oauthSetActive } = await startGoogleOAuth();

      if (createdSessionId && oauthSetActive) {
        await oauthSetActive({ session: createdSessionId });
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      if (!err.message?.includes('cancelled')) {
        setError('Google sign in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [startGoogleOAuth]);

  // Apple OAuth
  const handleAppleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { createdSessionId, setActive: oauthSetActive } = await startAppleOAuth();

      if (createdSessionId && oauthSetActive) {
        await oauthSetActive({ session: createdSessionId });
      }
    } catch (err: any) {
      console.error('Apple OAuth error:', err);
      if (!err.message?.includes('cancelled')) {
        setError('Apple sign in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [startAppleOAuth]);

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <JuliennedIcon size={80} />
            <Text style={[styles.appName, { color: colors.text }]}>Julienned</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Just the recipe. Beautifully.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Mail size={20} color={colors.textSecondary} strokeWidth={1.5} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Lock size={20} color={colors.textSecondary} strokeWidth={1.5} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.textSecondary} strokeWidth={1.5} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} strokeWidth={1.5} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
                (!isFormValid || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            {/* OAuth Buttons */}
            <TouchableOpacity
              style={[styles.oauthButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Text style={[styles.oauthButtonText, { color: colors.text }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.oauthButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleAppleSignIn}
                disabled={isLoading}
              >
                <Text style={[styles.oauthButtonText, { color: colors.text }]}>
                  Continue with Apple
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.signUpLink, { color: colors.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  appName: {
    fontFamily: typography.fonts.display,
    fontSize: 32,
    marginTop: spacing.md,
  },
  tagline: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    marginTop: spacing.xs,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    height: 52,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.caption,
  },
  errorContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
    textAlign: 'center',
  },
  primaryButton: {
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  primaryButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.caption,
    marginHorizontal: spacing.md,
  },
  oauthButton: {
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  oauthButtonText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.body,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  signUpText: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
  },
  signUpLink: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
  },
});
