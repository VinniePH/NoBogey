import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { backToPreviousPage } from "../../ui/navigation";
import { PrimaryButton, StickyActionBar } from "../../ui/booking-design";
import { useMobileData } from "../data/useMobileData";

export function PaymentScreen() {
  const { caddies } = useMobileData();
  const { caddieId, courseId, teeTimeId, time } = useLocalSearchParams<{ caddieId?: string; courseId?: string; teeTimeId?: string; time?: string }>();
  const caddie = caddies.find((item) => item.id === caddieId);
  if (!caddie || !courseId || !teeTimeId) return <Unavailable />;
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><ScrollView contentContainerStyle={styles.page}><Text accessibilityRole="header" style={styles.title}>Confirm mock request</Text><Text style={styles.subtitle}>No payment is collected in Phase 1. This creates a local requested booking for the demo flow.</Text><View style={styles.card}><Text style={styles.name}>{caddie.displayName}</Text><Text style={styles.meta}>Preferred-caddie request · PHP {(caddie.rate.amountInCentavos / 100).toLocaleString("en-PH")}</Text></View></ScrollView><StickyActionBar><PrimaryButton label="Confirm mock booking" onPress={() => router.replace({ pathname: "/golfer/bookings/confirmation", params: { caddieId, courseId, teeTimeId, time } })} /></StickyActionBar></SafeAreaView>;
}
export function ReceiptScreen() { return <Unavailable />; }
function Unavailable() { return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><View style={styles.unavailable}><EmptyState description="Booking details will appear after the booking service is connected." icon="calendar-remove-outline" minHeight={500} title="Booking unavailable" /><PrimaryButton label="Back to bookings" onPress={() => backToPreviousPage("/golfer/bookings")} /></View></SafeAreaView>; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.xl }, meta: { color: colors.textMuted, fontSize: typography.body }, name: { color: colors.fairwayDark, fontSize: typography.title, fontWeight: "800" }, page: { gap: spacing.lg, padding: spacing.xl, paddingBottom: 120 }, safe: { backgroundColor: colors.canvas, flex: 1 }, subtitle: { color: colors.textMuted, fontSize: typography.body, lineHeight: 22 }, title: { color: colors.text, fontSize: typography.heading, fontWeight: "900" }, unavailable: { flex: 1, gap: spacing.lg, justifyContent: "center", padding: spacing.xl } });
