import { router, useLocalSearchParams } from "expo-router";
import type { TeeTimeSlot } from "@nobogey/contracts";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { formatTeeTime } from "@nobogey/utils";
import { EmptyState } from "../../ui/EmptyState";
import { backToPreviousPage } from "../../ui/navigation";
import { PrimaryButton, StickyActionBar } from "../../ui/booking-design";
import { useMobileData } from "../data/useMobileData";
import { clubTeeSheet } from "./clubTeeSheet";

export function TeeTimeConfirmationScreen() {
  const { courses } = useMobileData();
  const { courseId, date, teeTimeId, time } = useLocalSearchParams<{ courseId?: string; date?: string; teeTimeId?: string; time?: string }>();
  const course = courses.find((item) => item.id === courseId);
  const [slot, setSlot] = useState<TeeTimeSlot>();
  useEffect(() => {
    let active = true;
    if (courseId && date && teeTimeId) void clubTeeSheet.getTeeTimes(courseId, date).then((slots) => {
      if (active) setSlot(slots.find((item) => item.id === teeTimeId));
    });
    return () => { active = false; };
  }, [courseId, date, teeTimeId]);
  if (!course || !slot) return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><View style={styles.center}><EmptyState description="The selected tee-time record will appear after the booking service is connected." icon="calendar-remove-outline" minHeight={500} title="Tee time unavailable" /><PrimaryButton label="Back to courses" onPress={() => backToPreviousPage("/golfer/courses")} /></View></SafeAreaView>;
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><ScrollView contentContainerStyle={styles.page}><Text accessibilityRole="header" style={styles.title}>Tee time held.</Text><Text style={styles.subtitle}>This controlled demo holds the tee time while you request a caddie.</Text><View style={styles.card}><Detail label="Course" value={course.name} /><Detail label="Tee time" value={formatTeeTime(time ?? slot.startsAt)} /><Detail label="Date" value={date ?? slot.startsAt.slice(0, 10)} /><Detail label="Status" value="Held locally" /></View></ScrollView><StickyActionBar><PrimaryButton label="Choose a caddie" onPress={() => router.push({ pathname: "/golfer/caddies", params: { courseId, date, teeTimeId, time: slot.startsAt } })} /></StickyActionBar></SafeAreaView>;
}
function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detail}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg, padding: spacing.xl }, center: { flex: 1, gap: spacing.lg, justifyContent: "center", padding: spacing.xl }, detail: { gap: spacing.xs }, label: { color: colors.textMuted, fontSize: typography.small, fontWeight: "800", textTransform: "uppercase" }, page: { gap: spacing.lg, padding: spacing.xl, paddingBottom: 120 }, safe: { backgroundColor: colors.canvas, flex: 1 }, subtitle: { color: colors.textMuted, fontSize: typography.body, lineHeight: 22 }, title: { color: colors.text, fontSize: typography.heading, fontWeight: "900" }, value: { color: colors.fairwayDark, fontSize: typography.body, fontWeight: "700" } });
