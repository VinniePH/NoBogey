import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@nobogey/ui';

import { establishSessionFromMobileAuthCallback, parseMobileAuthCallback } from '../../../backend/auth/auth-callback';
import { requestPasswordReset, updatePassword } from '../../../backend/auth/auth.service';
import { completeMobileCaptcha } from '../../../backend/auth/captcha';
import { getPasswordPolicyError, PASSWORD_REQUIREMENTS } from '../../../backend/auth/password-policy';
import { Button } from '../../ui/primitives';
import type { AppRole } from '../session/AppSession';

export function PasswordResetScreen() {
  const params = useLocalSearchParams<{ email?: string; role?: AppRole }>();
  const callbackUrl = Linking.useURL();
  const pathname = usePathname();
  const handledCallback = useRef<string | undefined>(undefined);
  const role: AppRole = params.role === 'caddie' ? 'caddie' : 'golfer';
  const [email, setEmail] = useState(params.email ?? '');
  const [message, setMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [completed, setCompleted] = useState(false);
  const parsedCallback = callbackUrl ? parseMobileAuthCallback(callbackUrl) : null;
  const isRecoveryCallback = parsedCallback?.kind === 'recovery' || pathname === '/mobile-auth/recovery';

  useEffect(() => {
    if (!callbackUrl || parsedCallback?.kind !== 'recovery' || handledCallback.current === callbackUrl) return;
    handledCallback.current = callbackUrl;
    setSubmitting(true);
    setMessage('Verifying your secure reset link…');
    void establishSessionFromMobileAuthCallback(callbackUrl, 'recovery')
      .then(() => {
        setRecoveryReady(true);
        setMessage(undefined);
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : 'This reset link is invalid or has expired.'))
      .finally(() => setSubmitting(false));
  }, [callbackUrl, parsedCallback?.kind]);

  const requestReset = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setMessage('Enter a valid email address linked to your account.');
      return;
    }
    setSubmitting(true);
    setMessage('Complete the security check in your browser, then return to NoBogey.');
    try {
      const captchaToken = await completeMobileCaptcha();
      await requestPasswordReset(email, captchaToken);
      setMessage('If an account matches that address, a secure reset link is on its way.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send the reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  const savePassword = async () => {
    const passwordError = getPasswordPolicyError(newPassword);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('The passwords do not match.');
      return;
    }
    setSubmitting(true);
    setMessage(undefined);
    try {
      await updatePassword(newPassword);
      setCompleted(true);
      setMessage('Your password has been updated. Sign in with your new password.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update your password. Request a new reset link and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const recoveryForm = recoveryReady && !completed
    ? <View style={styles.form}><Field autoCapitalize="none" label="New password" onChangeText={setNewPassword} secureTextEntry value={newPassword} /><Field autoCapitalize="none" label="Confirm new password" onChangeText={setConfirmPassword} secureTextEntry value={confirmPassword} /><Text style={styles.hint}>{PASSWORD_REQUIREMENTS}</Text>{message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}<Button disabled={submitting || !newPassword || !confirmPassword} onPress={() => void savePassword()}>{submitting ? 'Updating…' : 'Update password'}</Button></View>
    : null;
  const requestForm = !isRecoveryCallback
    ? <View style={styles.form}><Field autoCapitalize="none" keyboardType="email-address" label="Email address" onChangeText={setEmail} value={email} />{message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}<Button disabled={submitting || !email} onPress={() => void requestReset()}>{submitting ? 'Sending…' : 'Send reset link'}</Button></View>
    : null;

  return <SafeAreaView edges={['top', 'bottom']} style={styles.safe}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled"><View style={styles.header}><MaterialCommunityIcons color={colors.primary} name="lock-reset" size={34} /><Text accessibilityRole="header" style={styles.title}>{isRecoveryCallback ? 'Choose a new password' : 'Reset your password'}</Text><Text style={styles.subtitle}>{isRecoveryCallback ? 'Secure your NoBogey account with a new password.' : `Enter the email linked to your ${role} account. We’ll send you a secure reset link.`}</Text></View>{requestForm}{recoveryForm}{isRecoveryCallback && !recoveryReady && message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}{completed && message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}<Pressable accessibilityLabel="Back to login" accessibilityRole="link" onPress={() => router.replace({ pathname: '/sign-in', params: { role } })} style={styles.backLink}><Text style={styles.backText}>{completed ? 'Sign in now' : 'Back to login'}</Text></Pressable></ScrollView></SafeAreaView>;
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholder={`Enter ${label.toLowerCase()}`} placeholderTextColor={colors.textMuted} style={styles.input} {...props} /></View>;
}

const styles = StyleSheet.create({
  backLink: { alignSelf: 'center', paddingVertical: spacing.sm }, backText: { color: colors.primary, fontSize: 15, fontWeight: '800' }, field: { gap: spacing.xs }, form: { gap: spacing.lg }, header: { gap: spacing.sm }, hint: { color: colors.textMuted, fontSize: 13, lineHeight: 19 }, input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 52, paddingHorizontal: 14 }, label: { color: colors.fairwayDark, fontSize: 13, fontWeight: '800' }, message: { color: colors.fairwayDark, fontSize: 14, lineHeight: 20 }, page: { alignSelf: 'center', flexGrow: 1, gap: spacing.xl, justifyContent: 'center', maxWidth: 560, padding: spacing.xl, width: '100%' }, safe: { backgroundColor: colors.canvas, flex: 1 }, subtitle: { color: colors.textMuted, fontSize: 16, lineHeight: 23 }, title: { color: colors.fairwayDark, fontSize: 34, fontWeight: '900' },
});
