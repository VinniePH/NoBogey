import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, radius, spacing, typography } from "@nobogey/ui";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { CaddieAvailabilityEditor, CaddieSchedulePanel, initialAvailabilitySlots, normalizeAvailabilitySlots } from "./CaddieScheduleScreen";

type DashboardTab = "schedule" | "roster" | "portfolio";

const roster = [
  { name: "Robert Tan", detail: "Sat · 07:30 AM · Manila Southwoods", status: "Confirmed", tone: "confirmed" },
  { name: "Gov. Luis Arana", detail: "Sat · 12:45 PM · Wack Wack G&CC", status: "Pending", tone: "pending" },
  { name: "Maria Reyes", detail: "Sun · 06:15 AM · Tagaytay Highlands", status: "Canceled", tone: "canceled" }
] as const;

const feedback = [
  { name: "Robert Tan", rating: "5★", comment: "Read the greens at #14 perfectly. Saved me three strokes." },
  { name: "Maria R.", rating: "4★", comment: "Professional, on-time, great course knowledge." },
  { name: "Daniel L.", rating: "4★", comment: "Solid club selection advice. Will book again." }
];

export function CaddieDashboardScreen() {
  const [tab, setTab] = useState<DashboardTab>("roster");
  const [clientNotified, setClientNotified] = useState(false);
  const [availabilityEditorVisible, setAvailabilityEditorVisible] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState(initialAvailabilitySlots);
  const scheduleSlots = normalizeAvailabilitySlots(availabilitySlots);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ResponsiveContent style={styles.content}>
          <View style={styles.header}>
            <Pressable accessibilityLabel="Open caddie profile" accessibilityRole="button" onPress={() => router.push("/caddie/profile")}><Text style={styles.back}>‹</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={() => router.push("/caddie/profile")}><Text accessibilityRole="header" style={styles.title}>My Profile</Text></Pressable>
            <Pressable accessibilityLabel="Open settings" accessibilityRole="button" onPress={() => router.push("/caddie/settings")}><Text style={styles.settings}>⚙</Text></Pressable>
          </View>

          <NextClientCard clientNotified={clientNotified} onEditAvailability={() => setAvailabilityEditorVisible(true)} onNotify={() => setClientNotified(true)} />

          <View style={styles.weekHeading}>
            <Text style={styles.eyebrow}>Caddie · Berto</Text>
            <Text style={styles.weekTitle}>This Week’s Loop</Text>
          </View>
          <WeeklyMetrics />

          <View accessibilityRole="tablist" style={styles.tabs}>
            <Tab active={tab === "schedule"} label="Schedule" onPress={() => setTab("schedule")} />
            <Tab active={tab === "roster"} label="Roster" onPress={() => setTab("roster")} />
            <Tab active={tab === "portfolio"} label="Portfolio" onPress={() => setTab("portfolio")} />
          </View>

          {tab === "schedule" ? <CaddieSchedulePanel onEditAvailability={() => setAvailabilityEditorVisible(true)} slots={scheduleSlots} /> : tab === "roster" ? <RosterPanel /> : <PortfolioPanel />}
        </ResponsiveContent>
      </ScrollView>
      {availabilityEditorVisible ? <CaddieAvailabilityEditor onClose={() => setAvailabilityEditorVisible(false)} onSave={setAvailabilitySlots} slots={scheduleSlots} /> : null}
    </SafeAreaView>
  );
}

function NextClientCard({ clientNotified, onEditAvailability, onNotify }: { clientNotified: boolean; onEditAvailability: () => void; onNotify: () => void }) {
  return <View style={styles.nextClient}>
    <View style={styles.clientIcon}><MaterialCommunityIcons color={colors.surface} name="clock-outline" size={24} /></View>
    <View style={styles.clientCopy}><Text style={styles.clientLabel}>NEXT CLIENT</Text><Text style={styles.clientName}>Raf Vincent</Text><Text style={styles.clientDetail}>⌾ 7:30 AM · Manila Golf & Country Club</Text></View>
    <View style={styles.clientActions}><Pressable accessibilityLabel="Notify client" accessibilityRole="button" onPress={onNotify} style={styles.notifyButton}><Text style={styles.notifyText}>{clientNotified ? "Client Notified" : "Notify Client"}</Text></Pressable><Pressable accessibilityLabel="Edit availability" accessibilityRole="button" onPress={onEditAvailability} style={styles.availabilityButton}><Text style={styles.availabilityText}>Edit Availability</Text></Pressable></View>
  </View>;
}

function WeeklyMetrics() {
  return <View style={styles.metrics}>
    <Metric label="EARNINGS (WEEK)" value="₱18,400" change="+12%" positive />
    <Metric label="BOOKED SLOTS" value="7" change="21 Open" positive />
    <Metric label="AVG. RATING" value="4.9" change="-1%" />
    <Metric label="REPEAT CLIENTS" value="6" change="-7%" />
  </View>;
}

function Metric({ change, label, positive = false, value }: { change: string; label: string; positive?: boolean; value: string }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><View style={styles.metricValueRow}><Text style={styles.metricValue}>{value}</Text><Text style={[styles.metricChange, positive ? styles.positive : styles.negative]}>{change}</Text></View></View>;
}

function RosterPanel() {
  return <View style={styles.panelStack}>
    <View style={styles.panel}><View style={styles.panelHeader}><Text style={styles.panelTitle}>Upcoming Roster</Text><Text style={styles.panelCount}>3 BOOKINGS</Text></View>{roster.map((booking, index) => <View key={booking.name} style={[styles.booking, index > 0 && styles.bookingDivider]}><View style={styles.bookingCopy}><Text style={styles.bookingName}>{booking.name}</Text><Text style={styles.bookingDetail}>{booking.detail}</Text></View><Text style={[styles.status, styles[booking.tone]]}>{booking.status.toUpperCase()}</Text></View>)}</View>
    <View style={styles.panel}><Text style={styles.panelTitle}>Recent Feedback</Text>{feedback.map((item) => <View key={item.name} style={styles.feedback}><View style={styles.feedbackHeading}><Text style={styles.bookingName}>{item.name}</Text><Text style={styles.rating}>{item.rating}</Text></View><Text style={styles.feedbackComment}>{item.comment}</Text></View>)}</View>
  </View>;
}

function PortfolioPanel() {
  return <View style={styles.panelStack}>
    <View style={[styles.profileCard, { alignSelf: "stretch", maxWidth: "100%" }]}><Image accessibilityLabel="Berto caddie profile photo" source={{ uri: "https://i.pravatar.cc/320?img=57" }} style={styles.avatar} /><View style={styles.profileTop}><View><Text style={styles.profileName}>Berto</Text><Text style={styles.profileMeta}>12 Years Pro · English, Tagalog</Text></View><Text style={styles.profileRating}>4.9 ★★★★★</Text></View><View style={styles.profileStats}><ProfileChip label="READING" value="Expert Greens" /><ProfileChip label="ROUNDS" value="142" /><ProfileChip label="RATING" value="₱1,500" /><ProfileChip label="HANDICAP" value="Low (0-10)" /></View><Pressable accessibilityLabel="Share portfolio" accessibilityRole="button" style={styles.shareButton}><Text style={styles.shareText}>Share Portfolio</Text></Pressable></View>
    <View style={styles.portfolioHero}><Text style={styles.heroEyebrow}>PROFESSIONAL PORTFOLIO</Text><Text style={styles.heroTitle}>A-Class certified looper.</Text><Text style={styles.heroText}>Berto has looped at Manila Southwoods since 2013. Known for ice-cold green reads and a calming presence under pressure.</Text></View>
    <View style={styles.panel}><Text style={styles.portfolioLabel}>CREDENTIALS</Text><Text style={styles.bullet}>•  PGA Caddie Certified</Text><Text style={styles.bullet}>•  First Aid / CPR</Text><Text style={styles.bullet}>•  Rules of Golf Level 2</Text></View>
    <View style={styles.panel}><Text style={styles.portfolioLabel}>SPECIALTIES</Text><View style={styles.specialties}><Pill label="Bermuda greens" /><Pill label="Wind play" /><Pill label="Low-handicap strategy" /></View></View>
    <View style={styles.panel}><Text style={styles.portfolioLabel}>PERFORMANCE HIGHLIGHTS</Text><View style={styles.highlights}><Highlight label="Tier" value="A-CLASS" /><Highlight label="Tenure" value="12 years" /><Highlight label="Total Rounds" value="142" /><Highlight label="Repeat Rate" value="67%" /><Highlight label="ON-TIME" value="98%" /><Highlight label="AVG HCP" value="Low (0-9)" /><Highlight label="Languages" value="English, Filipino" /><Highlight label="Specialty" value="Expert Greens" /></View></View>
  </View>;
}

function Tab({ active, disabled = false, label, onPress }: { active: boolean; disabled?: boolean; label: string; onPress?: () => void }) { return <Pressable accessibilityRole="tab" accessibilityState={{ disabled, selected: active }} disabled={disabled} onPress={onPress} style={[styles.tab, active && styles.tabActive]}><Text style={[styles.tabText, active && styles.tabTextActive, disabled && styles.tabTextDisabled]}>{label}</Text></Pressable>; }
function ProfileChip({ label, value }: { label: string; value: string }) { return <View style={styles.profileChip}><Text style={styles.chipLabel}>{label}</Text><Text style={styles.chipValue}>{value}</Text></View>; }
function Pill({ label }: { label: string }) { return <View style={styles.pill}><Text style={styles.pillText}>{label}</Text></View>; }
function Highlight({ label, value }: { label: string; value: string }) { return <View style={[styles.highlight, { alignItems: "flex-start", justifyContent: "center" }]}><Text style={[styles.highlightLabel, { fontWeight: "600", textAlign: "left" }]}>{label}</Text><Text style={[styles.highlightValue, { fontWeight: "700", textAlign: "left" }]}>{value}</Text></View>; }

const styles = StyleSheet.create({
  availabilityButton: { alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.lg, justifyContent: "center", minHeight: 38, paddingHorizontal: spacing.md }, availabilityText: { color: colors.fairwayDark, fontSize: 12, fontWeight: "800" }, avatar: { borderRadius: radius.sm, height: 150, width: "100%" }, back: { color: colors.ink, fontSize: 42, fontWeight: "300", lineHeight: 40 }, booking: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm, justifyContent: "space-between", paddingVertical: spacing.md }, bookingCopy: { flex: 1, gap: 3 }, bookingDetail: { color: "#4A6256", fontSize: typography.body, lineHeight: 23 }, bookingDivider: { borderTopColor: "#B7BAB5", borderTopWidth: 1 }, bookingName: { color: "#16372A", fontSize: typography.title, fontWeight: "800" }, bullet: { color: "#264336", fontSize: typography.body, lineHeight: 27 }, canceled: { backgroundColor: "#FFD0D0", color: "#982326" }, chipLabel: { color: "#5D7868", fontFamily: fonts.mono, fontSize: 7, fontWeight: "700" }, chipValue: { color: "#264336", fontSize: 9, fontWeight: "700" }, clientActions: { flexDirection: "row", gap: spacing.md, marginLeft: 50, marginTop: spacing.lg }, clientCopy: { marginLeft: 50 }, clientDetail: { color: "#D6E3D9", fontSize: 12 }, clientIcon: { alignItems: "center", backgroundColor: "#39725B", borderRadius: radius.lg, height: 42, justifyContent: "center", left: spacing.lg, position: "absolute", top: 48, width: 42 }, clientIconText: { color: colors.surface, fontSize: 28 }, clientLabel: { color: "#CADBD0", fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2 }, clientName: { color: colors.surface, fontSize: 24, fontWeight: "800" }, confirmed: { backgroundColor: "#C5F2CE", color: "#316F42" }, content: { gap: spacing.xl }, eyebrrow: {}, eyebrow: { color: "#5B8871", fontFamily: fonts.mono, fontSize: 11 }, feedback: { gap: 4, paddingTop: spacing.lg }, feedbackComment: { color: "#4B6256", fontSize: typography.body, lineHeight: 23 }, feedbackHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.xs }, highlight: { backgroundColor: "#E8E6DF", borderRadius: 18, flexBasis: "48%", flexGrow: 1, gap: 2, minHeight: 78, padding: spacing.md }, highlightLabel: { color: "#5D806C", fontFamily: fonts.mono, fontSize: 10 }, highlightValue: { color: "#264336", fontFamily: fonts.mono, fontSize: 15, fontWeight: "800" }, highlights: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm }, heroEyebrow: { color: "#C8D8CB", fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2 }, heroText: { color: "#D8E3DA", fontSize: 12, lineHeight: 15 }, heroTitle: { color: colors.surface, fontSize: 23, fontWeight: "900" }, metric: { backgroundColor: colors.surface, borderColor: "#B7BAB5", borderRadius: 22, borderWidth: 1, gap: spacing.md, minHeight: 108, padding: spacing.lg }, metricChange: { fontFamily: fonts.mono, fontSize: 11, fontWeight: "800", marginBottom: 4 }, metricLabel: { color: "#518064", fontSize: 12, fontWeight: "800" }, metricValue: { color: colors.ink, fontSize: 30, fontWeight: "900" }, metricValueRow: { alignItems: "baseline", flexDirection: "row", gap: 5 }, metrics: { gap: spacing.md }, negative: { color: "#FF5252" }, nextClient: { backgroundColor: "#123F2D", borderRadius: 22, padding: spacing.lg, paddingVertical: spacing.xl }, notifyButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radius.lg, justifyContent: "center", minHeight: 38, paddingHorizontal: spacing.lg }, notifyText: { color: colors.surface, fontSize: 12, fontWeight: "800" }, panel: { backgroundColor: colors.surface, borderColor: "#B7BAB5", borderRadius: 22, borderWidth: 1, gap: spacing.sm, padding: spacing.xl }, panelCount: { color: "#6D8276", fontFamily: fonts.mono, fontSize: 13, letterSpacing: 1 }, panelHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, panelStack: { gap: spacing.xl }, panelTitle: { color: "#16372A", fontSize: 24, fontWeight: "900" }, pending: { backgroundColor: "#FFF6B7", color: "#8D7413" }, pill: { alignItems: "center", backgroundColor: "#DFDBD1", borderRadius: radius.md, flexGrow: 1, justifyContent: "center", minHeight: 28, paddingHorizontal: spacing.md }, pillText: { color: "#264336", fontSize: 13, fontWeight: "700" }, portfolioHero: { backgroundColor: "#123F2D", borderRadius: 22, gap: spacing.sm, padding: spacing.xl }, portfolioLabel: { color: "#70857A", fontFamily: fonts.mono, fontSize: 13, letterSpacing: 1 }, positive: { color: "#478E68" }, profileCard: { alignSelf: "center", backgroundColor: colors.surface, borderColor: "#888B85", borderRadius: radius.md, borderWidth: 1, gap: spacing.sm, maxWidth: 270, padding: spacing.sm, width: "100%" }, profileChip: { backgroundColor: "#E8E6DF", borderRadius: radius.sm, flex: 1, gap: 2, padding: 6 }, profileMeta: { color: "#879087", fontSize: 8 }, profileName: { color: colors.ink, fontSize: 15, fontWeight: "900" }, profileRating: { color: "#2D5944", fontSize: 9, fontWeight: "800", textAlign: "right" }, profileStats: { flexDirection: "row", flexWrap: "wrap", gap: 4 }, profileTop: { flexDirection: "row", justifyContent: "space-between" }, rating: { color: "#16372A", fontSize: 24, fontWeight: "900" }, safeArea: { backgroundColor: colors.canvas, flex: 1 }, scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl }, settings: { color: "#285640", fontSize: 26 }, shareButton: { alignItems: "center", backgroundColor: "#417C5B", borderRadius: radius.sm, minHeight: 26, justifyContent: "center" }, shareText: { color: colors.surface, fontSize: 9, fontWeight: "800" }, specialties: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm }, status: { borderRadius: radius.sm, fontFamily: fonts.mono, fontSize: 12, fontWeight: "800", overflow: "hidden", paddingHorizontal: spacing.sm, paddingVertical: 4 }, tab: { alignItems: "center", borderRadius: radius.sm, flex: 1, justifyContent: "center", minHeight: 34 }, tabActive: { backgroundColor: "#123F2D" }, tabText: { color: "#42765A", fontFamily: fonts.mono, fontSize: 12, fontWeight: "800" }, tabTextActive: { color: colors.surface }, tabTextDisabled: { opacity: 0.55 }, tabs: { backgroundColor: "#DFE0E0", borderRadius: radius.md, flexDirection: "row", padding: 4 }, title: { color: "#050806", fontSize: 28, fontWeight: "900" }, weekHeading: { gap: spacing.sm }, weekTitle: { color: colors.ink, fontSize: 29, fontWeight: "900" }
});
