import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { radius, spacing, typography } from "@nobogey/ui";
import { caddies, courses } from "../../data/mock";
import { ImagePlaceholder, PrimaryButton, StickyActionBar } from "../../ui/booking-design";

const times = [
  { label: "6:00 AM", available: false },
  { label: "7:00 AM", available: true },
  { label: "8:00 AM", available: true },
  { label: "9:00 AM", available: false }
];

export function CaddieProfileScreen() {
  const { id, courseId } = useLocalSearchParams<{ id?: string; courseId?: string }>();
  const caddie = caddies.find((item) => item.id === id) ?? caddies[0]!;
  const [selectedTime, setSelectedTime] = useState<string>();
  const course = courses.find((item) => item.id === (courseId ?? caddie.homeCourseId));
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.pageBody}>
        <ImagePlaceholder label="Caddie profile placeholder" style={styles.photo} />
        <Text style={styles.classLabel}>A - CLASS</Text><Text accessibilityRole="header" selectable style={styles.name}>{caddie.displayName}</Text><Text selectable style={styles.meta}>{caddie.yearsExperience} Years Pro · {caddie.languages.join(", ")}</Text>
        <View style={styles.statGrid}><Stat label="RATING" value={caddie.ratingAverage.toFixed(1)} /><Stat label="ROUNDS" value={String(caddie.completedRounds)} /><Stat label="RATE" value="₱1,500" /><Stat label="HANDICAP" value="Low (0-9)" /></View>
      </View>
      <View style={styles.about}><Section title="ABOUT"><Text selectable style={styles.aboutText}>{caddie.bio}</Text><Text selectable style={styles.homeCourse}>Home Course: <Text style={styles.homeCourseValue}>{course?.name}</Text></Text></Section><Section title="CREDENTIALS"><Text selectable style={styles.listItem}>• PGA Caddie Certified{"\n"}• First Aid / CPR{"\n"}• Rules of Golf Level 2</Text></Section><Section title="SPECIALTIES"><View style={styles.tags}>{caddie.specialties.map((item) => <Text key={item} style={styles.tag}>{item}</Text>)}</View></Section><Section title="OPEN SCHEDULE"><Text selectable style={styles.day}>Sat <Text style={styles.date}>· May 23</Text></Text><Text selectable style={styles.scheduleNote}>Unavailable times are fully booked.</Text><View accessibilityLabel="Available tee times" style={styles.timeGrid}>{times.map((time) => { const selected = selectedTime === time.label; return <Pressable accessibilityHint={time.available ? "Select this tee time" : "This tee time is unavailable"} accessibilityLabel={`${time.label}, ${time.available ? selected ? "selected" : "available" : "unavailable"}`} accessibilityRole="button" accessibilityState={{ disabled: !time.available, selected }} disabled={!time.available} key={time.label} onPress={() => setSelectedTime(time.label)} style={[styles.time, !time.available && styles.timeUnavailable, selected && styles.timeSelected]}><Text style={[styles.timeText, !time.available && styles.timeTextUnavailable, selected && styles.timeTextSelected]}>{time.label}</Text><Text style={[styles.timeState, !time.available && styles.timeStateUnavailable]}>{time.available ? selected ? "Selected" : "Available" : "Unavailable"}</Text></Pressable>; })}</View></Section></View>
    </ScrollView>
    <StickyActionBar><View style={styles.actions}><Pressable accessibilityLabel="Close caddie profile" accessibilityRole="button" onPress={() => router.back()} style={styles.close}><Text style={styles.closeText}>Close</Text></Pressable><View style={styles.book}><PrimaryButton disabled={!selectedTime} label={selectedTime ? `Book ${caddie.displayName} · ${selectedTime}` : "Select a time to book"} onPress={() => router.push({ pathname: "/booking", params: { caddieId: caddie.id, courseId, time: selectedTime } })} /></View></View></StickyActionBar>
  </SafeAreaView>;
}

function Stat({ label, value }: { label: string; value: string }) { return <View style={styles.stat}><Text style={styles.classLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>; }
function Section({ children, title }: { children: React.ReactNode; title: string }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }

const styles = StyleSheet.create({
  about: { backgroundColor: "#F5F2EA", gap: 34, padding: spacing.xl },
  aboutText: { color: "#454742", fontSize: 21, lineHeight: 26 },
  actions: { flexDirection: "row", gap: spacing.md },
  book: { flex: 1 },
  classLabel: { color: "#60766A", fontSize: typography.small, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  close: { alignItems: "center", borderColor: "#999890", borderRadius: radius.md, borderWidth: 1, justifyContent: "center", minHeight: 52, paddingHorizontal: spacing.xl },
  closeText: { color: "#24543D", fontSize: typography.body, fontWeight: "800" },
  content: { paddingBottom: spacing.lg },
  date: { color: "#686760", fontWeight: "400" },
  day: { color: "#18382A", fontSize: typography.body, fontWeight: "800" },
  homeCourse: { color: "#73736E", fontSize: typography.body },
  homeCourseValue: { color: "#417A59", fontWeight: "800" },
  listItem: { color: "#264435", fontSize: 20, lineHeight: 26 },
  meta: { color: "#547165", fontSize: typography.body },
  name: { color: "#000000", fontSize: 36, fontWeight: "800", letterSpacing: -1 },
  pageBody: { gap: spacing.md, padding: spacing.xl },
  photo: { borderRadius: 22, height: 470, width: "100%" },
  safeArea: { backgroundColor: "#F5F2EA", flex: 1 },
  section: { gap: spacing.md },
  sectionTitle: { color: "#60766A", fontSize: typography.body, letterSpacing: 1, textTransform: "uppercase" },
  stat: { backgroundColor: "#E7E5DF", borderRadius: 14, flexBasis: "47%", gap: 3, padding: spacing.md },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.sm },
  statValue: { color: "#000000", fontSize: typography.body, fontWeight: "800" },
  tag: { backgroundColor: "#D9D7CE", borderRadius: 999, color: "#264435", fontSize: typography.small, fontWeight: "700", overflow: "hidden", paddingHorizontal: spacing.sm, paddingVertical: 5 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  scheduleNote: { color: "#686760", fontSize: typography.small },
  time: { alignItems: "center", borderColor: "#D1CCC0", borderRadius: radius.md, borderWidth: 1, flexBasis: "47%", flexGrow: 1, gap: 2, justifyContent: "center", minHeight: 62, paddingHorizontal: spacing.sm },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  timeSelected: { backgroundColor: "#B3C1AA", borderColor: "#B3C1AA" },
  timeState: { color: "#417A59", fontSize: 10, fontWeight: "700" },
  timeStateUnavailable: { color: "#686760" },
  timeText: { color: "#264435", fontSize: typography.body },
  timeTextSelected: { color: "#264435", fontWeight: "800" },
  timeTextUnavailable: { color: "#686760", textDecorationLine: "line-through" },
  timeUnavailable: { backgroundColor: "#E7E5DF", borderColor: "#D1CCC0" }
});
