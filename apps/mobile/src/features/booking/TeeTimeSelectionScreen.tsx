import type { TeeTimeSlot } from "@nobogey/contracts";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { formatTeeTime } from "@nobogey/utils";
import { courses } from "../../data/catalog";
import { EmptyState } from "../../ui/EmptyState";
import { BookingStepper, PrimaryButton, StickyActionBar } from "../../ui/booking-design";
import { canSelectTeeTime, clubTeeSheet } from "./clubTeeSheet";
import { ResponsiveContent } from "../../ui/ResponsiveContent";

const partySize = 4;
const dates = [0, 1].map((offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
});

export function TeeTimeSelectionScreen() {
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const course = courses.find((item) => item.id === courseId);
  const [date, setDate] = useState(dates[0]!);
  const [slots, setSlots] = useState<TeeTimeSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>();

  useEffect(() => {
    let active = true;
    setSelectedSlotId(undefined);
    if (course) void clubTeeSheet.getTeeTimes(course.id, date).then((result) => { if (active) setSlots(result); });
    return () => { active = false; };
  }, [course, date]);

  const selectedSlot = useMemo(() => slots.find((slot) => slot.id === selectedSlotId), [selectedSlotId, slots]);
  const friday = new Date(`${date}T12:00:00+08:00`).getDay() === 5;

  if (!course) {
    return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}><View style={styles.emptyPage}><EmptyState description="Choose a course after the catalog service is connected." icon="golf" title="Course unavailable" /></View></SafeAreaView>;
  }

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent style={styles.frame}>
      <BookingStepper step={2} />
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={styles.title}>Choose your tee time.</Text>
        <Text style={styles.subtitle}>Choose a tee time for your foursome before requesting a preferred caddie.</Text>
      </View>
      <View style={styles.card}>
        <Row label="COURSE" value={course.name} />
        <Row label="GROUP" value="4 golfers" />
        <View style={styles.rule} />
        <Text style={styles.policyTitle}>Caddie assignment</Text>
        <Text style={styles.note}>You’ll request a preferred caddie next. The club can assign a different qualified caddie if your preferred person is still on a prior round. {friday ? "Friday rounds require a caddie." : ""}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select a date</Text>
        <View style={styles.dateRow}>{dates.map((value) => <DateButton key={value} selected={date === value} value={value} onPress={() => setDate(value)} />)}</View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Club tee sheet</Text>
        <Text style={styles.sectionNote}>Live club availability · slots need room for all 4 golfers.</Text>
        {slots.length ? <View style={styles.slotList}>{slots.map((slot) => <TeeTimeButton key={slot.id} selected={slot.id === selectedSlotId} slot={slot} onPress={() => canSelectTeeTime(slot, partySize) && setSelectedSlotId(slot.id)} />)}</View> : <Text style={styles.empty}>No tee times are available on this date.</Text>}
      </View>
      {selectedSlot ? <View style={styles.selectedSummary}><Text style={styles.selectedSummaryTitle}>Tee time selected</Text><Text style={styles.selectedSummaryText}>{formatTeeTime(selectedSlot.startsAt)} · Next, choose a preferred caddie</Text></View> : null}
    </ResponsiveContent></ScrollView>
    <StickyActionBar><PrimaryButton disabled={!selectedSlot} label={selectedSlot ? "Confirm tee time" : "Choose a tee time for 4 golfers"} onPress={() => selectedSlot && router.push({ pathname: "/golfer/bookings/new/tee-time-confirmation", params: { courseId: course.id, date, teeTimeId: selectedSlot.id } })} /></StickyActionBar>
  </SafeAreaView>;
}

function DateButton({ onPress, selected, value }: { onPress: () => void; selected: boolean; value: string }) {
  const local = new Date(`${value}T12:00:00+08:00`);
  return <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} style={[styles.dateButton, selected && styles.dateButtonSelected]}><Text style={[styles.dateDay, selected && styles.dateTextSelected]}>{local.toLocaleDateString("en-US", { weekday: "short" })}</Text><Text style={[styles.dateNumber, selected && styles.dateTextSelected]}>{local.getDate()}</Text><Text style={[styles.dateMonth, selected && styles.dateTextSelected]}>{local.toLocaleDateString("en-US", { month: "short" })}</Text></Pressable>;
}

function TeeTimeButton({ onPress, selected, slot }: { onPress: () => void; selected: boolean; slot: TeeTimeSlot }) {
  const eligible = canSelectTeeTime(slot, partySize);
  const detail = eligible ? "Room for 4 golfers" : "Foursome cannot be accommodated";
  return <Pressable accessibilityLabel={`${formatTeeTime(slot.startsAt)}, ${eligible ? "eligible" : detail}`} accessibilityRole="radio" accessibilityState={{ disabled: !eligible, selected }} disabled={!eligible} onPress={onPress} style={[styles.slot, !eligible && styles.slotUnavailable, selected && styles.slotSelected]}><View><Text style={[styles.slotTime, !eligible && styles.slotTextUnavailable]}>{formatTeeTime(slot.startsAt)}</Text><Text style={[styles.slotDetail, !eligible && styles.slotTextUnavailable]}>{detail}</Text></View><Text style={[styles.slotStatus, !eligible && styles.slotStatusUnavailable]}>{selected ? "Selected" : eligible ? "Available" : "Unavailable"}</Text></Pressable>;
}

function Row({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }

const styles = StyleSheet.create({
  frame: { gap: spacing.xl },
  emptyPage: { flex: 1, justifyContent: "center", padding: spacing.xl },
  card: { backgroundColor: colors.surface, borderColor: "#999890", borderRadius: radius.md, borderWidth: 1, gap: spacing.md, marginHorizontal: spacing.xl, padding: spacing.xl },
  content: { gap: spacing.xl, paddingBottom: spacing.xl }, dateButton: { alignItems: "center", borderColor: "#B9B8B1", borderRadius: radius.md, borderWidth: 1, gap: 2, minWidth: 82, padding: spacing.md }, dateButtonSelected: { backgroundColor: "#B3C1AA", borderColor: colors.fairwayDark }, dateDay: { color: "#66786D", fontSize: 11, fontWeight: "800", textTransform: "uppercase" }, dateMonth: { color: "#66786D", fontSize: 12 }, dateNumber: { color: colors.ink, fontSize: 24, fontWeight: "800" }, dateRow: { flexDirection: "row", gap: spacing.md }, dateTextSelected: { color: colors.fairwayDark }, empty: { color: "#6E6D67", fontSize: typography.body }, heading: { gap: spacing.sm, paddingHorizontal: spacing.xl }, label: { color: "#66786D", fontSize: typography.small, fontWeight: "800", letterSpacing: 1 }, note: { color: "#6E6D67", fontSize: typography.small, lineHeight: 19 }, policyTitle: { color: colors.fairwayDark, fontSize: typography.small, fontWeight: "800" }, row: { gap: spacing.xs }, rule: { backgroundColor: "#B9B8B1", height: 1 }, safeArea: { backgroundColor: "#FAF9F6", flex: 1 }, section: { gap: spacing.sm, paddingHorizontal: spacing.xl }, sectionNote: { color: "#6E6D67", fontSize: typography.small, lineHeight: 19 }, sectionTitle: { color: colors.fairwayDark, fontSize: typography.body, fontWeight: "800" }, selectedSummary: { backgroundColor: "#E7EEE9", borderRadius: radius.md, gap: spacing.xs, marginHorizontal: spacing.xl, padding: spacing.lg }, selectedSummaryText: { color: "#24543D", fontSize: typography.body }, selectedSummaryTitle: { color: colors.fairwayDark, fontSize: typography.small, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" }, slot: { alignItems: "center", backgroundColor: colors.surface, borderColor: "#B9B8B1", borderRadius: radius.md, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: spacing.lg }, slotDetail: { color: "#66786D", fontSize: typography.small, marginTop: 3 }, slotList: { gap: spacing.sm }, slotSelected: { backgroundColor: "#E7EEE9", borderColor: colors.fairwayDark, borderWidth: 2 }, slotStatus: { color: colors.fairway, fontSize: typography.small, fontWeight: "800" }, slotStatusUnavailable: { color: "#6E6D67" }, slotTextUnavailable: { color: "#6E6D67" }, slotTime: { color: colors.ink, fontSize: typography.body, fontWeight: "800" }, slotUnavailable: { backgroundColor: "#EFEEE9" }, subtitle: { color: "#6E6D67", fontSize: typography.body, lineHeight: 23 }, title: { color: "#000000", fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 42 }, value: { color: "#18382A", fontSize: typography.body, fontWeight: "800" }
});
