import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@nobogey/ui';

import { establishSessionFromMobileAuthCallback, parseMobileAuthCallback } from '../../../backend/auth/auth-callback';

export function AuthCallbackScreen() {
  const callbackUrl = Linking.useURL();
  const handledCallback = useRef<string | undefined>(undefined);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!callbackUrl || parseMobileAuthCallback(callbackUrl)?.kind !== 'confirmation' || handledCallback.current === callbackUrl) return;
    handledCallback.current = callbackUrl;
    void establishSessionFromMobileAuthCallback(callbackUrl, 'confirmation')
      .then(() => router.replace({ pathname: '/sign-in', params: { confirmed: '1' } }))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'This confirmation link is invalid or has expired.'));
  }, [callbackUrl]);

  return <SafeAreaView style={styles.safe}><View style={styles.card}>{error ? <><Text accessibilityRole="header" style={styles.title}>We couldn’t confirm that link</Text><Text accessibilityLiveRegion="polite" style={styles.body}>{error}</Text><Pressable accessibilityRole="button" onPress={() => router.replace('/sign-in')} style={styles.button}><Text style={styles.buttonText}>Back to sign in</Text></Pressable></> : <><ActivityIndicator color={colors.primary} size="large" /><Text accessibilityRole="header" style={styles.title}>Confirming your email</Text><Text style={styles.body}>Please wait while NoBogey securely verifies your account.</Text></>}</View></SafeAreaView>;
}

const styles = StyleSheet.create({
  body: { color: colors.textMuted, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  buttonText: { color: colors.surface, fontSize: 15, fontWeight: '800' },
  card: { alignItems: 'center', gap: spacing.md, maxWidth: 520, padding: spacing.xl },
  safe: { alignItems: 'center', backgroundColor: colors.canvas, flex: 1, justifyContent: 'center' },
  title: { color: colors.fairwayDark, fontSize: 26, fontWeight: '900', textAlign: 'center' },
});
