import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@nobogey/ui';

import { Button } from '../../ui/primitives';
import { requestPasswordReset } from '../../../backend/auth/auth.service';
import type { AppRole } from '../session/AppSession';

export function PasswordResetScreen() {
  const params = useLocalSearchParams<{ email?: string; role?: AppRole }>();
  const role: AppRole = params.role === 'caddie' ? 'caddie' : 'golfer';
  const [email, setEmail] = useState(params.email ?? '');
  const [message, setMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setMessage('Enter a valid email address linked to your account.');
      return;
    }
    setSubmitting(true);
    setMessage(undefined);
    try {
      await requestPasswordReset(email);
      setMessage('Check your email for a secure link to reset your password.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send the reset email.');
    } finally {
      setSubmitting(false);
    }
  };

  return <SafeAreaView edges={['top', 'bottom']} style={styles.safe}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled"><View style={styles.header}><MaterialCommunityIcons color={colors.primary} name="lock-reset" size={34} /><Text accessibilityRole="header" style={styles.title}>Reset your password</Text><Text style={styles.subtitle}>Enter the email linked to your {role} account. We’ll send you a secure reset link.</Text></View><View style={styles.form}><Field autoCapitalize="none" keyboardType="email-address" label="Email address" onChangeText={setEmail} value={email} />{message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}<Button disabled={submitting || !email} onPress={() => void submit()}>{submitting ? 'Sending…' : 'Send reset link'}</Button></View><Pressable accessibilityLabel="Back to login" accessibilityRole="link" onPress={() => router.replace({ pathname: '/sign-in', params: { role } })} style={styles.backLink}><Text style={styles.backText}>Back to login</Text></Pressable></ScrollView></SafeAreaView>;
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholder={`Enter ${label.toLowerCase()}`} placeholderTextColor={colors.textMuted} style={styles.input} {...props} /></View>;
}

const styles = StyleSheet.create({
  backLink: { alignSelf: 'center', paddingVertical: spacing.sm }, backText: { color: colors.primary, fontSize: 15, fontWeight: '800' }, field: { gap: spacing.xs }, form: { gap: spacing.lg }, header: { gap: spacing.sm }, input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 52, paddingHorizontal: 14 }, label: { color: colors.fairwayDark, fontSize: 13, fontWeight: '800' }, message: { color: colors.fairwayDark, fontSize: 14, lineHeight: 20 }, page: { flexGrow: 1, gap: spacing.xl, justifyContent: 'center', padding: spacing.xl }, safe: { backgroundColor: colors.canvas, flex: 1 }, subtitle: { color: colors.textMuted, fontSize: 16, lineHeight: 23 }, title: { color: colors.fairwayDark, fontSize: 34, fontWeight: '900' },
});
