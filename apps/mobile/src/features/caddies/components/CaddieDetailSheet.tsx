import type { Caddie, GolfCourse } from "@nobogey/contracts";
import { formatMoney } from "@nobogey/utils";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaddieAvatar } from "./CaddieAvatar";

type CaddieDetailSheetProps = { caddie: Caddie | null; course?: GolfCourse | undefined; onBook: (timeSlot: string) => void; onClose: () => void; visible: boolean };
type TimeSlot = { label: string; available: boolean };

const timeSlots: TimeSlot[] = [
  { label: "6:00 AM", available: false },
  { label: "7:00 AM", available: true },
  { label: "8:00 AM", available: true },
  { label: "9:00 AM", available: false }
];

export function CaddieDetailSheet({ caddie, course, onBook, onClose, visible }: CaddieDetailSheetProps) {
  const [selectedTime, setSelectedTime] = useState<string>();
  const insets = useSafeAreaInsets();
  useEffect(() => { if (!visible) setSelectedTime(undefined); }, [visible]);
  if (!caddie) return null;

  return <Modal animationType="slide" onRequestClose={onClose} presentationStyle="overFullScreen" transparent visible={visible}>
    <View style={styles.backdrop}>
      <Pressable accessibilityLabel="Close caddie details" accessibilityRole="button" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View accessibilityLabel={`${caddie.displayName} booking details`} accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}><Text accessibilityRole="header" style={styles.sheetTitle}>Book a caddie</Text><Pressable accessibilityLabel="Close caddie details" accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.closeButton}><Text style={styles.closeText}>Close</Text></Pressable></View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator>
          <View style={styles.identity}><CaddieAvatar name={caddie.displayName} size="large" source={caddie.avatarUrl} /><View style={styles.identityCopy}><Text style={styles.classLabel}>A-class caddie</Text><Text accessibilityRole="header" selectable style={styles.name}>{caddie.displayName}</Text><Text selectable style={styles.meta}>{caddie.yearsExperience} years pro · {caddie.languages.join(", ")}</Text></View></View>
          <View style={styles.stats}><Stat label="Rating" value={caddie.ratingAverage.toFixed(1)} /><Stat label="Rounds" value={String(caddie.completedRounds)} /><Stat label="Rate" value={formatMoney(caddie.rate.amountInCentavos)} /><Stat label="Reviews" value={String(caddie.reviewCount)} /></View>
          <Section title="About"><Text selectable style={styles.body}>{caddie.bio}</Text><Text selectable style={styles.course}>Home course: <Text style={styles.courseValue}>{course?.name ?? "Course to be confirmed"}</Text></Text></Section>
          <Section title="Specialties"><View style={styles.tags}>{caddie.specialties.map((specialty) => <Text key={specialty} style={styles.tag}>{specialty}</Text>)}</View></Section>
          <Section title="Choose a tee time"><Text selectable style={styles.scheduleNote}>Saturday · May 23. Unavailable times are fully booked.</Text><View accessibilityLabel="Available tee times" style={styles.timeGrid}>{timeSlots.map((slot) => { const selected = selectedTime === slot.label; return <Pressable accessibilityHint={slot.available ? "Select this tee time" : "This tee time is unavailable"} accessibilityLabel={`${slot.label}, ${slot.available ? selected ? "selected" : "available" : "unavailable"}`} accessibilityRole="button" accessibilityState={{ disabled: !slot.available, selected }} disabled={!slot.available} key={slot.label} onPress={() => setSelectedTime(slot.label)} style={[styles.time, !slot.available && styles.timeUnavailable, selected && styles.timeSelected]}><Text style={[styles.timeText, !slot.available && styles.timeTextUnavailable, selected && styles.timeTextSelected]}>{slot.label}</Text><Text style={[styles.timeState, !slot.available && styles.timeStateUnavailable]}>{slot.available ? selected ? "Selected" : "Available" : "Unavailable"}</Text></Pressable>; })}</View></Section>
        </ScrollView>
        <View style={styles.actionArea}><Pressable accessibilityHint={selectedTime ? "Continue to the booking form" : "Select an available time to enable booking"} accessibilityLabel={selectedTime ? `Book ${caddie.displayName} at ${selectedTime}` : `Book ${caddie.displayName}. Select a time first`} accessibilityRole="button" accessibilityState={{ disabled: !selectedTime }} disabled={!selectedTime} onPress={() => selectedTime && onBook(selectedTime)} style={[styles.bookButton, !selectedTime && styles.bookButtonDisabled]}><Text style={styles.bookText}>{selectedTime ? `Book ${caddie.displayName} · ${selectedTime}` : "Select a time to book"}</Text></Pressable></View>
      </View>
    </View>
  </Modal>;
}

function Section({ children, title }: { children: React.ReactNode; title: string }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }
function Stat({ label, value }: { label: string; value: string }) { return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text selectable style={styles.statValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  actionArea: { backgroundColor: colors.canvas, borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.lg, paddingTop: spacing.md }, backdrop: { backgroundColor: "rgba(23, 32, 27, 0.45)", flex: 1, justifyContent: "flex-end" }, body: { color: colors.ink, fontSize: typography.body, lineHeight: 23 }, bookButton: { alignItems: "center", backgroundColor: colors.fairwayDark, borderRadius: radius.md, justifyContent: "center", minHeight: 52, paddingHorizontal: spacing.md }, bookButtonDisabled: { backgroundColor: colors.line }, bookText: { color: colors.surface, fontSize: typography.body, fontWeight: "800", textAlign: "center" }, classLabel: { color: colors.fairway, fontSize: 11, fontWeight: "800", letterSpacing: 1.3, textTransform: "uppercase" }, closeButton: { alignItems: "center", justifyContent: "center", minHeight: 44, paddingHorizontal: spacing.sm }, closeText: { color: colors.fairwayDark, fontSize: typography.small, fontWeight: "800" }, content: { gap: spacing.xl, padding: spacing.lg, paddingBottom: spacing.xxl }, course: { color: colors.muted, fontSize: typography.small }, courseValue: { color: colors.fairwayDark, fontWeight: "800" }, handle: { alignSelf: "center", backgroundColor: colors.line, borderRadius: 999, height: 5, marginTop: spacing.sm, width: 40 }, identity: { alignItems: "center", flexDirection: "row", gap: spacing.md }, identityCopy: { flex: 1, gap: spacing.xs }, meta: { color: colors.muted, fontSize: typography.small, lineHeight: 18 }, name: { color: colors.ink, fontSize: typography.heading, fontWeight: "800", letterSpacing: -0.7 }, scheduleNote: { color: colors.muted, fontSize: typography.small, lineHeight: 18 }, section: { gap: spacing.sm }, sectionTitle: { color: colors.fairwayDark, fontSize: typography.small, fontWeight: "800", letterSpacing: 1.1, textTransform: "uppercase" }, sheet: { backgroundColor: colors.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%", minHeight: "72%", overflow: "hidden" }, sheetHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }, sheetTitle: { color: colors.ink, fontSize: typography.title, fontWeight: "800" }, stat: { backgroundColor: "#E7E5DF", borderRadius: radius.md, flexBasis: "47%", flexGrow: 1, gap: spacing.xs, padding: spacing.md }, statLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" }, statValue: { color: colors.ink, fontSize: typography.body, fontWeight: "800" }, stats: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, tag: { backgroundColor: "#DEDCD4", borderRadius: 999, color: colors.fairwayDark, fontSize: typography.small, fontWeight: "700", overflow: "hidden", paddingHorizontal: spacing.sm, paddingVertical: spacing.xs }, tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, time: { alignItems: "center", borderColor: colors.fairway, borderRadius: radius.md, borderWidth: 1, flexBasis: "47%", flexGrow: 1, gap: 2, justifyContent: "center", minHeight: 62, padding: spacing.sm }, timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, timeSelected: { backgroundColor: "#B3C1AA", borderColor: colors.fairwayDark }, timeState: { color: colors.fairway, fontSize: 10, fontWeight: "700" }, timeStateUnavailable: { color: colors.muted }, timeText: { color: colors.ink, fontSize: typography.body, fontWeight: "800" }, timeTextSelected: { color: colors.fairwayDark }, timeTextUnavailable: { color: colors.muted, textDecorationLine: "line-through" }, timeUnavailable: { backgroundColor: "#EFEEE9", borderColor: colors.line }
});
