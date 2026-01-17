// src/screens/ForgotPasswordScreen.tsx
// Password reset flow screen

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
import { useSignIn } from '@clerk/clerk-expo';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors, useTheme } from '../hooks/useTheme';
import { typography, spacing, borderRadius } from '../styles/theme';
import { AuthStackParamList } from '../navigation';

interface ForgotPasswordScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
}

type Step = 'email' | 'code' | 'password' | 'success';

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const { signIn, setActive, isLoaded } = useSignIn();

  // State
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Request reset code
  const handleRequestCode = useCallback(async () => {
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError(null);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setStep('code');
    } catch (err: any) {
      console.error('Reset request error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Failed to send reset code. Please check your email.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, email]);

  // Step 2: Verify code
  const handleVerifyCode = useCallback(async () => {
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
      });

      if (result.status === 'needs_new_password') {
        setStep('password');
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (err: any) {
      console.error('Code verification error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Invalid verification code.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, code]);

  // Step 3: Set new password
  const handleResetPassword = useCallback(async () => {
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.resetPassword({
        password: newPassword,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setStep('success');
      } else {
        setError('Password reset incomplete. Please try again.');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      const errorMessage = err.errors?.[0]?.message || 'Failed to reset password.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signIn, newPassword, setActive]);

  // Resend code
  const handleResendCode = useCallback(async () => {
    if (!isLoaded || !signIn) return;

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setError(null);
    } catch (err: any) {
      console.error('Resend code error:', err);
      setError('Failed to resend code. Please try again.');
    }
  }, [isLoaded, signIn, email]);

  const renderContent = () => {
    switch (step) {
      case 'email':
        return (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Enter your email and we'll send you a code to reset your password.
              </Text>
            </View>

            <View style={styles.form}>
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

              {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  (email.length === 0 || isLoading) && styles.buttonDisabled,
                ]}
                onPress={handleRequestCode}
                disabled={email.length === 0 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                    Send Reset Code
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        );

      case 'code':
        return (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Check Your Email</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                We sent a code to {email}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, styles.codeInput, { color: colors.text }]}
                    placeholder="000000"
                    placeholderTextColor={colors.textSecondary}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  (code.length !== 6 || isLoading) && styles.buttonDisabled,
                ]}
                onPress={handleVerifyCode}
                disabled={code.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                    Verify Code
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendButton} onPress={handleResendCode}>
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  Didn't receive a code? Resend
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 'password':
        return (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>New Password</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Enter your new password below.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Lock size={20} color={colors.textSecondary} strokeWidth={1.5} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="New password (min 8 characters)"
                    placeholderTextColor={colors.textSecondary}
                    value={newPassword}
                    onChangeText={setNewPassword}
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

              {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  (newPassword.length < 8 || isLoading) && styles.buttonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={newPassword.length < 8 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                    Reset Password
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        );

      case 'success':
        return (
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
              <CheckCircle size={48} color={colors.success} strokeWidth={2} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Password Reset!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your password has been reset successfully. You're now signed in.
            </Text>
          </View>
        );
    }
  };

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
          {step !== 'success' && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (step === 'email') {
                  navigation.goBack();
                } else if (step === 'code') {
                  setStep('email');
                } else if (step === 'password') {
                  setStep('code');
                }
              }}
            >
              <ArrowLeft size={24} color={colors.text} strokeWidth={1.5} />
            </TouchableOpacity>
          )}

          {renderContent()}
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
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  title: {
    fontFamily: typography.fonts.display,
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fonts.sans,
    fontSize: typography.sizes.body,
    lineHeight: 22,
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
    paddingVertical: spacing.lg,
  },
  resendText: {
    fontFamily: typography.fonts.sansMedium,
    fontSize: typography.sizes.caption,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
});
