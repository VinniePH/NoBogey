import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { colors, fonts, radius, spacing } from "@nobogey/ui";

export type Availability = "booked" | "open" | "off";

export type AvailabilitySlot = {
  day: Day;
  id: string;
  time: string;
  availability: Availability;
};

const days = [
  { id: "mon", label: "MON", date: "25" },
  { id: "tue", label: "TUE", date: "26" },
  { id: "wed", label: "WED", date: "27" },
  { id: "thu", label: "THU", date: "28" },
  { id: "fri", label: "FRI", date: "29" },
  { id: "sat", label: "SAT", date: "30" },
  { id: "sun", label: "SUN", date: "31" }
] as const;

type Day = (typeof days)[number]["id"];

const times = ["6:00 AM", "8:30 AM", "11:00 AM", "1:30 PM", "4:00 PM"];

const availabilityByDay: Record<Day, Availability[]> = {
  mon: ["booked", "open", "open", "off", "open"],
  tue: ["open", "booked", "open", "open", "off"],
  wed: ["off", "open", "booked", "open", "open"],
  thu: ["open", "open", "off", "open", "booked"],
  fri: ["booked", "open", "open", "booked", "open"],
  sat: ["booked", "booked", "booked", "open", "booked"],
  sun: ["off", "off", "open", "off", "open"]
};

export const initialAvailabilitySlots: AvailabilitySlot[] = times.flatMap((time, timeIndex) => days.map((day) => ({
  day: day.id,
  id: `${day.id}-${time}`,
  time,
  availability: availabilityByDay[day.id][timeIndex]
})));

export function normalizeAvailabilitySlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  return initialAvailabilitySlots.map((initialSlot) => {
    const currentSlot = slots.find((slot) => slot.time === initialSlot.time && (slot.day ?? slot.id.split("-")[0]) === initialSlot.day);
    return currentSlot ? { ...initialSlot, ...currentSlot, day: initialSlot.day } : initialSlot;
  });
}

const nextAvailability: Record<Availability, Availability> = { booked: "open", open: "off", off: "booked" };

export function CaddieSchedulePanel({ onEditAvailability, slots }: { onEditAvailability: () => void; slots: AvailabilitySlot[] }) {
  const { width } = useWindowDimensions();
  const isNarrowScreen = width < 420;
  return <View style={styles.card}>
    <View style={[styles.panelHeader, isNarrowScreen && styles.panelHeaderNarrow]}><View><Text accessibilityRole="header" style={styles.title}>Weekly Calendar</Text><Text style={styles.subtitle}>Week of May 25 — 31</Text></View><Pressable accessibilityLabel="Edit availability" accessibilityRole="button" onPress={onEditAvailability} style={[styles.editButton, isNarrowScreen && styles.editButtonNarrow]}><Text adjustsFontSizeToFit minimumFontScale={0.85} numberOfLines={1} style={styles.editIcon}>✎</Text><Text adjustsFontSizeToFit minimumFontScale={0.85} numberOfLines={1} style={styles.editText}>Edit Availability</Text></Pressable></View>
    <View style={styles.calendar}><CalendarGrid slots={slots} /></View>
    <View accessibilityLabel="Availability legend" style={styles.legend}><LegendItem availability="open" label="OPEN" /><LegendItem availability="booked" label="BOOKED" /><LegendItem availability="off" label="OFF" /></View>
  </View>;
}

export function CaddieAvailabilityEditor({ onClose, onSave, slots }: { onClose: () => void; onSave: (slots: AvailabilitySlot[]) => void; slots: AvailabilitySlot[] }) {
  const { width } = useWindowDimensions();
  const isNarrowScreen = width < 420;
  const updateSlot = (id: string) => onSave(slots.map((slot) => slot.id === id ? { ...slot, availability: nextAvailability[slot.availability] } : slot));

  return <Modal animationType="slide" transparent visible onRequestClose={onClose}>
    <View style={styles.backdrop}><View accessibilityViewIsModal style={styles.modalCard}>
      <View style={styles.modalHeader}><View><Text accessibilityRole="header" style={styles.title}>Edit Availability</Text><Text style={styles.subtitle}>Tap a time slot to cycle Booked, Open, and Off.</Text></View><Pressable accessibilityLabel="Close availability editor" accessibilityRole="button" onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable></View>
      <View style={styles.calendar}><CalendarGrid editable onSlotPress={updateSlot} slots={slots} /></View>
      <View style={[styles.modalFooter, isNarrowScreen && styles.modalFooterNarrow]}><View accessibilityLabel="Availability legend" style={[styles.legend, isNarrowScreen && styles.legendNarrow]}><LegendItem availability="open" label="OPEN" /><LegendItem availability="booked" label="BOOKED" /><LegendItem availability="off" label="OFF" /></View><Pressable accessibilityLabel="Done editing availability" accessibilityRole="button" onPress={onClose} style={[styles.doneButton, isNarrowScreen && styles.doneButtonNarrow]}><Text adjustsFontSizeToFit minimumFontScale={0.85} numberOfLines={1} style={styles.doneText}>Done</Text></Pressable></View>
    </View></View>
  </Modal>;
}

function CalendarGrid({ editable = false, onSlotPress, slots }: { editable?: boolean; onSlotPress?: (id: string) => void; slots: AvailabilitySlot[] }) {
  const { width } = useWindowDimensions();
  const needsHorizontalScroll = width < 600;

  return <ScrollView horizontal contentContainerStyle={[styles.calendarContent, needsHorizontalScroll && styles.calendarContentNarrow]} showsHorizontalScrollIndicator={needsHorizontalScroll} style={styles.calendarScroller}><View style={styles.calendarGrid}><View style={styles.dayHeader}><View style={styles.timeColumn} />{days.map((day) => <View key={day.id} style={styles.day}><Text style={styles.dayLabel}>{day.label}</Text><Text style={styles.dayDate}>{day.date}</Text></View>)}</View>{times.map((time) => <View key={time} style={styles.row}><Text style={styles.time}>{time}</Text>{days.map((day) => {
    const slot = slots.find((candidate) => (candidate.day ?? candidate.id.split("-")[0]) === day.id && candidate.time === time);
    if (!slot) return <View key={`${day.id}-${time}`} style={styles.slot} />;
    return <Pressable key={slot.id} accessibilityLabel={`${day.label} ${day.date}, ${time}: ${slot.availability}${editable ? ". Tap to change availability." : ""}`} accessibilityRole={editable ? "button" : undefined} disabled={!editable} onPress={() => onSlotPress?.(slot.id)} style={[styles.slot, styles[slot.availability]]}><Text style={[styles.slotText, (slot.availability === "booked" || slot.availability === "off") && styles.lightSlotText]}>{slot.availability.toUpperCase()}</Text></Pressable>;
  })}</View>)}</View></ScrollView>;
}

function LegendItem({ availability, label }: { availability: Availability; label: string }) { return <View style={styles.legendItem}><View style={[styles.legendDot, styles[availability]]} /><Text style={styles.legendText}>{label}</Text></View>; }

const styles = StyleSheet.create({
  backdrop: { alignItems: "center", backgroundColor: "rgba(23, 32, 27, 0.45)", flex: 1, justifyContent: "center", padding: spacing.lg }, booked: { backgroundColor: "#236241", borderColor: "#236241" }, calendar: { gap: spacing.sm }, calendarContent: { flexGrow: 1 }, calendarContentNarrow: { minWidth: 560 }, calendarGrid: { gap: spacing.sm, width: "100%" }, calendarScroller: { width: "100%" }, card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 22, borderWidth: 1, gap: spacing.lg, padding: spacing.lg }, closeButton: { alignItems: "center", borderColor: colors.border, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 }, closeText: { color: colors.ink, fontSize: 24, lineHeight: 25 }, day: { alignItems: "center", flex: 1, gap: 2 }, dayDate: { color: colors.ink, fontFamily: fonts.mono, fontSize: 12, fontWeight: "800" }, dayHeader: { flexDirection: "row", marginBottom: spacing.xs }, dayLabel: { color: "#5C7467", fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1 }, doneButton: { alignItems: "center", backgroundColor: "#236241", borderRadius: radius.lg, flexShrink: 0, justifyContent: "center", minHeight: 44, minWidth: 72, paddingHorizontal: spacing.lg }, doneButtonNarrow: { alignSelf: "stretch", width: "100%" }, doneText: { color: colors.surface, fontSize: 13, fontWeight: "800", textAlign: "center" }, editButton: { alignItems: "center", backgroundColor: "#236241", borderRadius: 18, flexDirection: "row", gap: 6, minHeight: 36, paddingHorizontal: spacing.md }, editButtonNarrow: { alignSelf: "stretch", justifyContent: "center" }, editIcon: { color: colors.surface, fontSize: 16 }, editText: { color: colors.surface, fontSize: 12, fontWeight: "800" }, legend: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md }, legendDot: { borderRadius: 99, borderWidth: 1, height: 12, width: 12 }, legendItem: { alignItems: "center", flexDirection: "row", gap: 6 }, legendNarrow: { justifyContent: "center" }, legendText: { color: "#5C7467", fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1 }, lightSlotText: { color: colors.surface }, modalCard: { backgroundColor: colors.surface, borderRadius: 22, gap: spacing.lg, maxWidth: 620, padding: spacing.lg, width: "100%" }, modalFooter: { alignItems: "center", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }, modalFooterNarrow: { alignItems: "stretch", flexDirection: "column" }, modalHeader: { alignItems: "flex-start", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }, off: { backgroundColor: "#61776B", borderColor: "#61776B" }, open: { backgroundColor: "#F6F5F1", borderColor: "#C7D3CB" }, panelHeader: { alignItems: "flex-start", flexDirection: "row", gap: spacing.md, justifyContent: "space-between" }, panelHeaderNarrow: { alignItems: "stretch", flexDirection: "column" }, row: { alignItems: "center", flexDirection: "row", gap: spacing.sm }, slot: { alignItems: "center", borderRadius: radius.lg, borderWidth: 1, flex: 1, height: 56, justifyContent: "center" }, slotText: { color: "#236241", fontFamily: fonts.mono, fontSize: 10, fontWeight: "800" }, subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 3 }, time: { color: "#5C7467", fontFamily: fonts.mono, fontSize: 10, textAlign: "right", width: 62 }, timeColumn: { width: 62 }, title: { color: colors.ink, fontSize: 20, fontWeight: "900" }
});
