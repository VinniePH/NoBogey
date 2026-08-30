import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { backToPreviousPage } from "../../ui/navigation";
import { PrimaryButton } from "../../ui/booking-design";
import { useMobileData } from "../data/useMobileData";

export function BookingConfirmationScreen() {
  const { caddies, courses } = useMobileData();
  const { caddieId, courseId, time } = useLocalSearchParams<{ caddieId?: string; courseId?: string; time?: string }>();
  const caddie = caddies.find((item) => item.id === caddieId); const course = courses.find((item) => item.id === courseId);
  if (!caddie || !course) return <SafeAreaView style={styles.safe}><View style={styles.center}><EmptyState description="Booking confirmation will be available after the booking service is connected." icon="calendar-remove-outline" minHeight={500} title="Booking confirmation unavailable" /><PrimaryButton label="Back to bookings" onPress={() => backToPreviousPage("/golfer/bookings")} /></View></SafeAreaView>;
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><View style={styles.center}><Text accessibilityRole="header" style={styles.title}>Request confirmed</Text><Text style={styles.copy}>Your mock request at {course.name} for {time ?? "the selected tee time"} has been recorded with {caddie.displayName} as your preferred caddie.</Text><Text style={styles.note}>This is local demo data only; the club owns final assignment.</Text><PrimaryButton label="View upcoming bookings" onPress={() => router.replace("/golfer/bookings")} /></View></SafeAreaView>;
}
const styles = StyleSheet.create({ center: { flex: 1, gap: spacing.lg, justifyContent: "center", padding: spacing.xl }, copy: { color: colors.text, fontSize: typography.body, lineHeight: 23 }, note: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19 }, safe: { backgroundColor: colors.canvas, flex: 1 }, title: { color: colors.fairwayDark, fontSize: typography.heading, fontWeight: "900" } });
