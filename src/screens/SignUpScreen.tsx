// src/screens/SignUpScreen.tsx
// Sign up screen with email/password and OAuth options

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
} from 'react-native';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { useColors, useTheme } from '../hooks/useTheme';
import { typography, spacing, borderRadius } from '../styles/theme';
import { JuliennedIcon } from '../components/JuliennedIcon';
import { AuthStackParamList } from '../navigation';

// Handle OAuth redirects
WebBrowser.maybeCompleteAuthSession();

interface SignUpScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
}

export function SignUpScreen({ navigation }: SignUpScreenProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const { signUp, setActive, isLoaded } = useSignUp();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // OAuth hooks
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });

  // Email/password sign up
  const handleSignUp = useCallback(async () => {
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || undefined,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Failed to create account. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signUp, email, password, name]);

  // Verify email
  const handleVerify = useCallback(async () => {
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        console.log('Verification requires additional steps:', result.status);
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Invalid verification code.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signUp, verificationCode, setActive]);

  // Resend verification code
  const handleResendCode = useCallback(async () => {
    if (!isLoaded || !signUp) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setError(null);
    } catch (err: any) {
      console.error('Resend code error:', err);
      setError('Failed to resend code. Please try again.');
    }
  }, [isLoaded, signUp]);

  // Google OAuth
  const handleGoogleSignUp = useCallback(async () => {
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
        setError('Google sign up failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [startGoogleOAuth]);

  // Apple OAuth
  const handleAppleSignUp = useCallback(async () => {
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
        setError('Apple sign up failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [startAppleOAuth]);

  const isFormValid = email.length > 0 && password.length >= 8;
  const isVerificationValid = verificationCode.length === 6;

  // Verification screen
  if (pendingVerification) {
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
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setPendingVerification(false)}
            >
              <ArrowLeft size={24} color={colors.text} strokeWidth={1.5} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.verifyHeader}>
              <Text style={[styles.title, { color: colors.text }]}>Verify Email</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                We sent a verification code to{'\n'}{email}
              </Text>
            </View>

            {/* Verification Code Input */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, styles.codeInput, { color: colors.text }]}
                    placeholder="000000"
                    placeholderTextColor={colors.textSecondary}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Error Message */}
              {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              )}

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  (!isVerificationValid || isLoading) && styles.buttonDisabled,
                ]}
                onPress={handleVerify}
                disabled={!isVerificationValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                    Verify Email
                  </Text>
                )}
              </TouchableOpacity>

              {/* Resend Code */}
              <TouchableOpacity style={styles.resendButton} onPress={handleResendCode}>
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  Didn't receive a code? Resend
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Sign up form
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
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={colors.text} strokeWidth={1.5} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <JuliennedIcon size={64} />
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <User size={20} color={colors.textSecondary} strokeWidth={1.5} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Name (optional)"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  textContentType="name"
                  editable={!isLoading}
                />
              </View>
            </View>

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
                  placeholder="Password (min 8 characters)"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
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

            {/* Error Message */}
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            )}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
                (!isFormValid || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleSignUp}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                  Create Account
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
              onPress={handleGoogleSignUp}
              disabled={isLoading}
            >
              <Text style={[styles.oauthButtonText, { color: colors.text }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.oauthButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleAppleSignUp}
                disabled={isLoading}
              >
                <Text style={[styles.oauthButtonText, { color: colors.text }]}>
                  Continue with Apple
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sign In Link */}
          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={[styles.signUpLink, { color: colors.primary }]}>Sign In</Text>
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
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: 28,
    marginTop: spacing.md,
  },
  verifyHeader: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  subtitle: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    textAlign: 'center',
    marginTop: spacing.sm,
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
  codeInput: {
    fontFamily: typography.fonts.sansBold,
    fontSize: 24,
    letterSpacing: 8,
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
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryButtonText: {
    fontFamily: typography.fonts.sansBold,
    fontSize: typography.sizes.body,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  resendText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.caption,
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
    marginTop: spacing.lg,
    paddingBottom: spacing.lg,
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
