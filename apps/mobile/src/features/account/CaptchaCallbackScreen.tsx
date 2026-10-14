import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@nobogey/ui';

export function CaptchaCallbackScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace('/sign-in');
    }, 350);
    return () => clearTimeout(timeout);
  }, []);

  return <SafeAreaView style={styles.safe}><View style={styles.card}><ActivityIndicator color={colors.primary} size="large" /><Text accessibilityRole="header" style={styles.title}>Security check complete</Text><Text style={styles.body}>Returning you to NoBogey…</Text></View></SafeAreaView>;
}

const styles = StyleSheet.create({
  body: { color: colors.textMuted, fontSize: 16, textAlign: 'center' },
  card: { alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  safe: { alignItems: 'center', backgroundColor: colors.canvas, flex: 1, justifyContent: 'center' },
  title: { color: colors.fairwayDark, fontSize: 24, fontWeight: '900', textAlign: 'center' },
});
