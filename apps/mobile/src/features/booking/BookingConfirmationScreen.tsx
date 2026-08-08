import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typography } from "@nobogey/ui";
import { BookingStepper, PrimaryButton } from "../../ui/booking-design";

export function BookingConfirmationScreen() {
  const { time, caddieId } = useLocalSearchParams<{ time?: string; caddieId?: string }>();
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}><View style={styles.content}><BookingStepper step={4}/><View style={styles.message}><Text accessibilityRole="header" style={styles.title}>Preferred caddie requested.</Text><Text style={styles.subtitle}>Your {time ?? "tee time"} is pending the club’s confirmation. {caddieId ? "Your requested caddie will be assigned if free; otherwise the course will assign the next available qualified caddie." : "The course will assign the next available qualified caddie."}</Text></View><View style={styles.actions}><PrimaryButton label="View my bookings" onPress={() => router.replace("/golfer/bookings")}/><Pressable accessibilityLabel="Back to home" accessibilityRole="button" onPress={() => router.replace("/golfer/home")}><Text style={styles.homeLink}>Back to home</Text></Pressable></View></View></SafeAreaView>;
}
const styles = StyleSheet.create({ actions: { alignItems: "center", gap: spacing.lg }, content: { flex: 1, justifyContent: "space-between", padding: spacing.xl, paddingBottom: 40 }, homeLink: { color: "#24543D", fontSize: typography.body, fontWeight: "800" }, message: { alignItems: "center", gap: spacing.md }, safeArea: { backgroundColor: "#FAF9F6", flex: 1 }, subtitle: { color: "#6E6D67", fontSize: typography.body, lineHeight: 24, textAlign: "center" }, title: { color: "#000000", fontSize: 28, fontWeight: "800", textAlign: "center" } });
