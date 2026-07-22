import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { caddies, courses } from "../../data/mock";
import { BookingStepper, PrimaryButton, StickyActionBar } from "../../ui/booking-design";

export function BookingPlaceholderScreen() {
  const { caddieId, courseId, time } = useLocalSearchParams<{ caddieId?: string; courseId?: string; time?: string }>();
  const caddie = caddies.find((item) => item.id === caddieId) ?? caddies[0]!;
  const course = courses.find((item) => item.id === courseId) ?? courses.find((item) => item.id === caddie.homeCourseId) ?? courses[0]!;
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}><BookingStepper step={3}/><View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>Review your booking.</Text><Text style={styles.subtitle}>Everything looks right? Confirm your caddie request below.</Text></View><View style={styles.card}><Row label="COURSE" value={course.name}/><Row label="CADDIE" value={caddie.displayName}/><Row label="TEE TIME" value={time ?? "Choose a time"}/><Row label="RATE" value="₱1,500"/><View style={styles.rule}/><Text style={styles.note}>Payment is collected after the course accepts the caddie request.</Text></View></ScrollView><StickyActionBar><PrimaryButton label="Confirm Booking" onPress={() => router.replace({ pathname: "/confirmation", params: { caddieId: caddie.id, courseId: course.id, time } })}/></StickyActionBar></SafeAreaView>;
}
function Row({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: "#999890", borderRadius: radius.md, borderWidth: 1, gap: spacing.lg, marginHorizontal: spacing.xl, padding: spacing.xl },
  content: { gap: spacing.xl, paddingBottom: spacing.xl },
  heading: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  label: { color: "#66786D", fontSize: typography.small, fontWeight: "800", letterSpacing: 1 },
  note: { color: "#6E6D67", fontSize: typography.small, lineHeight: 19 },
  row: { gap: spacing.xs },
  rule: { backgroundColor: "#B9B8B1", height: 1 },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  subtitle: { color: "#6E6D67", fontSize: typography.body, lineHeight: 23 },
  title: { color: "#000000", fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 42 },
  value: { color: "#18382A", fontSize: typography.title, fontWeight: "800" }
});
