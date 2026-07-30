import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { caddies, courses } from "../../data/mock";
import { formatMoney } from "@nobogey/utils";
import { Button } from "../../ui/primitives";

export function PaymentScreen() {
  const params = useLocalSearchParams<{ caddieId?: string; courseId?: string; teeTimeId?: string; time?: string }>();
  const caddie = caddies.find((item) => item.id === params.caddieId) ?? caddies[0]!;
  const course = courses.find((item) => item.id === params.courseId) ?? courses[0]!;
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><ScrollView contentContainerStyle={styles.content}><View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>Payment</Text><Text style={styles.subtitle}>Mock payment gateway — no payment details are collected in this frontend pass.</Text></View><View style={styles.card}><Row label="Course" value={course.name} /><Row label="Tee time" value={params.time ?? "Selected tee time"} /><Row label="Preferred caddie" value={caddie.displayName} /><View style={styles.total}><Text style={styles.totalLabel}>Caddie fee</Text><Text selectable style={styles.totalValue}>{formatMoney(caddie.rate.amountInCentavos)}</Text></View></View><Button accessibilityLabel="Pay booking fee" onPress={() => router.replace({ pathname: "/receipt", params })}>Pay {formatMoney(caddie.rate.amountInCentavos)}</Button></ScrollView></SafeAreaView>;
}

export function ReceiptScreen() {
  const params = useLocalSearchParams<{ caddieId?: string; courseId?: string; time?: string }>();
  const caddie = caddies.find((item) => item.id === params.caddieId) ?? caddies[0]!;
  const course = courses.find((item) => item.id === params.courseId) ?? courses[0]!;
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><View style={styles.receipt}><Text style={styles.success}>✓</Text><Text accessibilityRole="header" style={styles.title}>Booking receipt</Text><Text style={styles.subtitle}>Your payment is recorded and your preferred-caddie request has been sent to the club.</Text><View style={styles.card}><Row label="Receipt" value="NB-MOCK-1025" /><Row label="Course" value={course.name} /><Row label="Tee time" value={params.time ?? "Selected tee time"} /><Row label="Preferred caddie" value={caddie.displayName} /></View><Button accessibilityLabel="Back to home" onPress={() => router.replace("/home")}>Back to Home</Button></View></SafeAreaView>;
}

function Row({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text selectable style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg, padding: spacing.xl }, content: { gap: spacing.xl, padding: spacing.xl }, heading: { gap: spacing.sm }, label: { color: colors.textMuted, fontSize: typography.small, fontWeight: "800", textTransform: "uppercase" }, receipt: { flex: 1, gap: spacing.xl, justifyContent: "center", padding: spacing.xl }, row: { gap: spacing.xs }, safe: { backgroundColor: colors.canvas, flex: 1 }, subtitle: { color: colors.textMuted, fontSize: typography.body, lineHeight: 23 }, success: { alignSelf: "center", backgroundColor: colors.primary, borderRadius: 40, color: colors.surface, fontSize: 36, fontWeight: "900", height: 80, lineHeight: 80, textAlign: "center", width: 80 }, title: { color: colors.text, fontSize: 32, fontWeight: "900", letterSpacing: -0.8 }, total: { borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingTop: spacing.lg }, totalLabel: { color: colors.text, fontSize: typography.body, fontWeight: "800" }, totalValue: { color: colors.primary, fontSize: typography.title, fontWeight: "900" }, value: { color: colors.text, fontSize: typography.body, fontWeight: "700" } });
