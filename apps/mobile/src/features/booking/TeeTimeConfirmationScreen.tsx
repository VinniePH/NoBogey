import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { courses, teeTimeSlots } from "../../data/mock";
import { formatTeeTime } from "@nobogey/utils";
import { BookingStepper, PrimaryButton, StickyActionBar } from "../../ui/booking-design";
import { ResponsiveContent } from "../../ui/ResponsiveContent";

export function TeeTimeConfirmationScreen() {
  const { courseId, date, teeTimeId } = useLocalSearchParams<{ courseId?: string; date?: string; teeTimeId?: string }>();
  const course = courses.find((item) => item.id === courseId) ?? courses[0]!;
  const teeTime = teeTimeSlots.find((item) => item.id === teeTimeId);
  const time = teeTime ? formatTeeTime(teeTime.startsAt) : "Selected tee time";
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic"><ResponsiveContent style={{ gap: spacing.xl }}><BookingStepper step={2} /><View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>Confirm your tee time.</Text><Text style={styles.subtitle}>Review this single tee time before choosing a preferred caddie.</Text></View><View style={styles.card}><Detail label="COURSE" value={course.name} /><Detail label="TEE TIME" value={time} /><Detail label="OPEN PLAYER SLOTS" value={String(teeTime?.remainingPlayerCapacity ?? 0)} /><Text style={styles.note}>A preferred caddie does not block tee-time selection. The club makes the final caddie assignment.</Text></View></ResponsiveContent></ScrollView><StickyActionBar><PrimaryButton label="Choose a caddie" onPress={() => router.push({ pathname: "/golfer/caddies", params: { courseId: course.id, date, teeTimeId, time } })} /></StickyActionBar></SafeAreaView>;
}

function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detail}><Text style={styles.label}>{label}</Text><Text selectable style={styles.value}>{value}</Text></View>; }

const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg, marginHorizontal: spacing.xl, padding: spacing.xl }, content: { gap: spacing.xl, paddingBottom: spacing.xl }, detail: { gap: spacing.xs }, heading: { gap: spacing.sm, paddingHorizontal: spacing.xl }, label: { color: colors.textMuted, fontSize: typography.small, fontWeight: "800", letterSpacing: 1 }, note: { borderTopColor: colors.border, borderTopWidth: 1, color: colors.textMuted, fontSize: typography.small, lineHeight: 19, paddingTop: spacing.lg }, safeArea: { backgroundColor: colors.canvas, flex: 1 }, subtitle: { color: colors.textMuted, fontSize: typography.body, lineHeight: 23 }, title: { color: colors.text, fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 42 }, value: { color: colors.fairwayDark, fontSize: typography.body, fontWeight: "800" } });
