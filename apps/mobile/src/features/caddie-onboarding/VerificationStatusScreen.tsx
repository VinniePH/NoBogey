import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { ResponsiveContent } from "../../ui/ResponsiveContent";

/** Displays no verification result until the club review service is connected. */
export function VerificationStatusScreen() {
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scroll}><ResponsiveContent style={styles.content}><Text accessibilityRole="header" style={styles.title}>Verification unavailable</Text><Text style={styles.subtitle}>Caddie verification will appear here once the club review service is connected.</Text><EmptyState description="No local approval, reviewer, club status, or verification timeline is displayed while the service is unavailable." icon="shield-account-outline" minHeight={420} title="No verification data" /></ResponsiveContent></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ content: { gap: spacing.xl, padding: spacing.lg, paddingBottom: 36 }, safe: { backgroundColor: colors.canvas, flex: 1 }, scroll: { flexGrow: 1 }, subtitle: { color: colors.textMuted, fontSize: 16, lineHeight: 23 }, title: { color: colors.text, fontSize: 32, fontWeight: "900", letterSpacing: -1 } });
