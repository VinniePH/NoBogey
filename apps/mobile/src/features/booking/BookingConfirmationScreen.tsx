import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typography } from "@nobogey/ui";
import { BookingStepper, PrimaryButton } from "../../ui/booking-design";

export function BookingConfirmationScreen() {
  const { time } = useLocalSearchParams<{ time?: string }>();
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}><View style={styles.content}><BookingStepper step={3}/><View style={styles.message}><Text accessibilityRole="header" style={styles.title}>Booking confirmed.</Text><Text style={styles.subtitle}>Your caddie request is in. We’ll notify you when the course confirms your {time ?? "tee time"} booking.</Text></View><PrimaryButton label="Back to Home" onPress={() => router.replace("/")}/></View></SafeAreaView>;
}
const styles = StyleSheet.create({ content: { flex: 1, justifyContent: "space-between", padding: spacing.xl, paddingBottom: 40 }, message: { alignItems: "center", gap: spacing.md }, safeArea: { backgroundColor: "#FAF9F6", flex: 1 }, subtitle: { color: "#6E6D67", fontSize: typography.body, lineHeight: 24, textAlign: "center" }, title: { color: "#000000", fontSize: 28, fontWeight: "800", textAlign: "center" } });
