import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { BookingStepper, PrimaryButton, StickyActionBar } from "../../ui/booking-design";
import { useAppSession } from "../session/AppSession";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { useMobileData } from "../data/useMobileData";

export function BookingSummaryScreen() {
  const { caddies, courses } = useMobileData();
  const { caddieId, courseId, teeTimeId, time } = useLocalSearchParams<{ caddieId?: string; courseId?: string; teeTimeId?: string; time?: string }>();
  const caddie = caddies.find((item) => item.id === caddieId);
  const course = courses.find((item) => item.id === courseId);
  const { golferSignedIn } = useAppSession();
  if (!caddie || !course) return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}><View style={{ padding: spacing.xl }}><EmptyState description="Booking details will appear after the course and caddie services are connected." icon="calendar-remove-outline" minHeight={650} title="Booking request unavailable" /></View></SafeAreaView>;
  const continueToPayment = () => {
    if (!golferSignedIn) {
      router.push({ pathname: "/sign-in", params: { role: "golfer", returnTo: "/golfer/caddies", caddieId: caddie.id, courseId: course.id, teeTimeId, time } });
      return;
    }
    router.push({ pathname: "/golfer/bookings/new/payment", params: { caddieId: caddie.id, courseId: course.id, teeTimeId, time } });
  };
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic"><ResponsiveContent style={{ gap: spacing.xl }}><BookingStepper step={4}/><View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>Review your request.</Text><Text style={styles.subtitle}>Your tee time is reserved for a foursome. Your named caddie is a preferred request.</Text></View><View style={styles.card}><Row label="COURSE" value={course.name}/><Row label="TEE TIME" value={time ?? "Selected tee time"}/><Row label="GROUP" value="4 golfers"/><Row label="PREFERRED CADDIE" value={caddie.displayName}/><View style={styles.rule}/><Text style={styles.notice}>If {caddie.displayName.split(" ")[0]} is still on a prior round, the course will assign the next available qualified caddie.</Text></View></ResponsiveContent></ScrollView><StickyActionBar><PrimaryButton label={golferSignedIn ? "Continue to payment" : "Log in to continue"} onPress={continueToPayment}/></StickyActionBar></SafeAreaView>;
}
function Row({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderColor: "#999890", borderRadius: radius.md, borderWidth: 1, gap: spacing.lg, marginHorizontal: spacing.xl, padding: spacing.xl }, content: { gap: spacing.xl, paddingBottom: spacing.xl }, heading: { gap: spacing.sm, paddingHorizontal: spacing.xl }, label: { color: "#66786D", fontSize: typography.small, fontWeight: "800", letterSpacing: 1 }, notice: { color: "#6E6D67", fontSize: typography.small, lineHeight: 19 }, row: { gap: spacing.xs }, rule: { backgroundColor: "#B9B8B1", height: 1 }, safeArea: { backgroundColor: "#FAF9F6", flex: 1 }, subtitle: { color: "#6E6D67", fontSize: typography.body, lineHeight: 23 }, title: { color: "#000000", fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 42 }, value: { color: "#18382A", fontSize: typography.body, fontWeight: "800" } });
