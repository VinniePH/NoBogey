import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { TeeTimeSlot } from "@nobogey/contracts";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatTeeTime } from "@nobogey/utils";
import { EmptyState } from "../../ui/EmptyState";
import { FindGameScreen, SectionHeading, SelectedCourseSummary, flowColors } from "./components/FindGameUI";
import { canSelectTeeTime, clubTeeSheet } from "./clubTeeSheet";
import { useMobileData } from "../data/useMobileData";
import { mobileDataService } from "../../../backend/mock.service";

const partySize = 4;
const dates: readonly string[] = mobileDataService.listWeekDates();

export function TeeTimeSelectionScreen() {
  const { courses, isLoading: coursesLoading } = useMobileData();
  const { courseId, caddieId, date: initialDate } = useLocalSearchParams<{ courseId?: string; caddieId?: string; date?: string }>();
  const course = courses.find((item) => item.id === courseId);
  const [date, setDate] = useState<string | undefined>(initialDate);
  const [slots, setSlots] = useState<TeeTimeSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => { setDate(initialDate); }, [initialDate]);
  useEffect(() => {
    let active = true;
    setSelectedSlotId(undefined);
    setSlots([]);
    if (course && date) {
      setLoading(true);
      void clubTeeSheet.getTeeTimes(course.id, date).then((result) => { if (active) setSlots(result); }).catch(() => { if (active) setSlots([]); }).finally(() => { if (active) setLoading(false); });
    } else setLoading(false);
    return () => { active = false; };
  }, [course, date]);

  const selectedSlot = useMemo(() => slots.find((slot) => slot.id === selectedSlotId), [selectedSlotId, slots]);
  if (!course) return <FindGameScreen actionDisabled actionLabel="Continue" description="Select your preferred date and time at the club." onAction={() => {}} step={2} title="Choose a tee time">{coursesLoading ? <Text style={styles.prompt}>Loading course…</Text> : <EmptyState description="Choose a course to see its tee times." icon="golf" minHeight={280} title="Course unavailable" />}</FindGameScreen>;

  return <FindGameScreen actionDisabled={!selectedSlot} actionLabel="Continue" description="Select your preferred date and time at the club." onAction={() => selectedSlot && router.push({ pathname: "/golfer/caddies", params: { courseId: course.id, caddieId, date, teeTimeId: selectedSlot.id, time: selectedSlot.startsAt } })} step={2} title="Choose a tee time">
    <SelectedCourseSummary course={course} />
    <View style={styles.section}><SectionHeading title="Select a date" />{dates.length ? <ScrollView horizontal contentContainerStyle={styles.dateRow} showsHorizontalScrollIndicator={false} style={styles.dateScroller}>{dates.map((value) => <DateButton key={value} onPress={() => { if (value !== date) { setSelectedSlotId(undefined); setSlots([]); setDate(value); } }} selected={date === value} value={value} />)}</ScrollView> : <EmptyState description="Dates will appear when the club tee-sheet service is connected." icon="calendar-blank-outline" minHeight={110} title="No dates available" />}</View>
    <View style={styles.section}><SectionHeading title="Available tee times" />{!date ? <Text style={styles.prompt}>Select a date to see available tee times.</Text> : loading ? <Text style={styles.prompt}>Loading tee times…</Text> : slots.length ? <View accessibilityRole="radiogroup" style={styles.slotList}>{slots.map((slot) => <TeeTimeOption key={slot.id} onPress={() => setSelectedSlotId(slot.id)} selected={slot.id === selectedSlotId} slot={slot} />)}</View> : <EmptyState description="No tee times are available for this date." icon="calendar-blank-outline" minHeight={210} title="No tee times available" />}</View>
  </FindGameScreen>;
}

function DateButton({ onPress, selected, value }: { onPress: () => void; selected: boolean; value: string }) {
  const local = new Date(`${value}T12:00:00+08:00`);
  return <Pressable accessibilityLabel={local.toLocaleDateString("en-US", { dateStyle: "full" })} accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.dateButton, selected && styles.dateButtonSelected, pressed && styles.pressed]}><Text style={[styles.dateDay, selected && styles.dateTextSelected]}>{local.toLocaleDateString("en-US", { weekday: "short" })}</Text><Text style={[styles.dateNumber, selected && styles.dateTextSelected]}>{local.getDate()}</Text><Text style={[styles.dateMonth, selected && styles.dateTextSelected]}>{local.toLocaleDateString("en-US", { month: "short" })}</Text></Pressable>;
}

function TeeTimeOption({ onPress, selected, slot }: { onPress: () => void; selected: boolean; slot: TeeTimeSlot }) {
  const eligible = canSelectTeeTime(slot, partySize);
  return <Pressable accessibilityLabel={`${formatTeeTime(slot.startsAt)}, ${eligible ? "available" : "unavailable"}`} accessibilityRole="radio" accessibilityState={{ disabled: !eligible, selected }} disabled={!eligible} onPress={onPress} style={({ pressed }) => [styles.slot, !eligible && styles.slotUnavailable, selected && styles.slotSelected, pressed && styles.pressed]}><View style={styles.slotCopy}><Text style={[styles.slotTime, !eligible && styles.unavailableText]}>{formatTeeTime(slot.startsAt)}</Text><Text style={styles.slotDetail}>{eligible ? "Room for 4 golfers" : "Foursome cannot be accommodated"}</Text></View><View style={styles.slotState}>{selected ? <MaterialCommunityIcons color={flowColors.forest} name="check-circle" size={22} /> : <Text style={[styles.status, !eligible && styles.unavailableText]}>{eligible ? "Available" : "Unavailable"}</Text>}</View></Pressable>;
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  dateScroller: { flexGrow: 0 },
  dateRow: { gap: 9, paddingBottom: 3 },
  dateButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: flowColors.border, borderRadius: 12, borderWidth: 1, gap: 1, justifyContent: "center", minHeight: 82, minWidth: 72, paddingHorizontal: 10, paddingVertical: 8 },
  dateButtonSelected: { backgroundColor: flowColors.forest, borderColor: flowColors.forest },
  dateDay: { color: flowColors.muted, fontSize: 12, fontWeight: "700" },
  dateMonth: { color: flowColors.muted, fontSize: 12 },
  dateNumber: { color: flowColors.ink, fontSize: 22, fontWeight: "800" },
  dateTextSelected: { color: "#FFFFFF" },
  prompt: { backgroundColor: flowColors.sage, borderRadius: 10, color: flowColors.muted, fontSize: 14, lineHeight: 20, padding: 16 },
  slotList: { gap: 9 },
  slot: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: flowColors.border, borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 70, paddingHorizontal: 15, paddingVertical: 11 },
  slotSelected: { backgroundColor: "#F1F7F1", borderColor: flowColors.forest, borderWidth: 2 },
  slotUnavailable: { backgroundColor: "#EFEEE9", opacity: 0.7 },
  slotCopy: { flex: 1, gap: 3, minWidth: 0 },
  slotTime: { color: flowColors.ink, fontSize: 17, fontWeight: "800" },
  slotDetail: { color: flowColors.muted, fontSize: 13, lineHeight: 18 },
  slotState: { alignItems: "flex-end", minWidth: 50 },
  status: { color: flowColors.forest, fontSize: 12, fontWeight: "700" },
  unavailableText: { color: flowColors.muted },
  pressed: { opacity: 0.75 }
});
