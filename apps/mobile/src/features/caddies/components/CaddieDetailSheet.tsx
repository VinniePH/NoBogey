import type { Caddie, GolfCourse } from "@nobogey/contracts";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatMoney } from "@nobogey/utils";
import { colors, spacing, typography } from "@nobogey/ui";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CaddieAvatar } from "./CaddieAvatar";

type CaddieDetailSheetProps = { caddie: Caddie | null; course?: GolfCourse | undefined; onBook: () => void; onClose: () => void; visible: boolean };

export function CaddieDetailSheet({ caddie, course, onBook, onClose, visible }: CaddieDetailSheetProps) {
  const insets = useSafeAreaInsets();
  if (!caddie) return null;

  return <Modal animationType="slide" onRequestClose={onClose} presentationStyle="overFullScreen" transparent visible={visible}>
    <View style={styles.backdrop}>
      <Pressable accessibilityLabel="Close caddie details" accessibilityRole="button" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View accessibilityLabel={`${caddie.displayName} booking details`} accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}><View /><Pressable accessibilityLabel="Close caddie details" accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.closeButton}><MaterialCommunityIcons color={colors.fairwayDark} name="close" size={22} /></Pressable></View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator>
          <View style={styles.identity}><CaddieAvatar name={caddie.displayName} size="large" /><View style={styles.identityCopy}><Text accessibilityRole="header" numberOfLines={1} selectable style={styles.name}>{caddie.displayName}</Text><View style={styles.verifiedLabel}><MaterialCommunityIcons color={colors.fairwayDark} name="check-circle" size={15} /><Text style={styles.classLabel}>Verified caddie</Text></View><Text selectable style={styles.meta}>{caddie.yearsExperience} years experience · {course?.name ?? "Course to be confirmed"}</Text><Text selectable style={styles.rating}><MaterialCommunityIcons color="#B89452" name="star" size={16} /> {caddie.ratingAverage.toFixed(1)} · {caddie.reviewCount} {caddie.reviewCount === 1 ? "review" : "reviews"}</Text></View></View>
          <View style={styles.stats}><Stat icon="cash-multiple" label="Rate" value={formatMoney(caddie.rate.amountInCentavos)} /><Stat icon="flag-outline" label="Rounds" value={String(caddie.completedRounds)} /></View>
          <Section title="About"><Text selectable style={styles.body}>{caddie.bio || "Profile details will be shared by the caddie soon."}</Text></Section>
          <Section title="Specialties"><View style={styles.tags}>{caddie.specialties.length ? caddie.specialties.map((specialty) => <Text key={specialty} style={styles.tag}>{specialty}</Text>) : <Text style={styles.meta}>Specialties not listed</Text>}</View></Section>
          <Section title="Languages"><Text selectable style={styles.body}>{caddie.languages.join(", ") || "Not listed"}</Text></Section>
        </ScrollView>
        <View style={styles.actionArea}><Pressable accessibilityLabel={`Start booking with ${caddie.displayName}`} accessibilityRole="button" onPress={onBook} style={styles.bookButton}><Text style={styles.bookText}>Start booking with {caddie.displayName.split(" ")[0]}</Text><MaterialCommunityIcons color={colors.surface} name="arrow-right" size={19} /></Pressable><Text style={styles.scheduleNote}>A preferred caddie is a request. The club confirms the final assignment.</Text></View>
      </View>
    </View>
  </Modal>;
}

function Section({ children, title }: { children: React.ReactNode; title: string }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }
function Stat({ icon, label, value }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; label: string; value: string }) { return <View style={styles.stat}><View style={styles.statIcon}><MaterialCommunityIcons color={colors.fairwayDark} name={icon} size={21} /></View><View style={styles.statCopy}><Text style={styles.statLabel}>{label}</Text><Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} selectable style={styles.statValue}>{value}</Text></View></View>; }

const styles = StyleSheet.create({
  actionArea: { backgroundColor: colors.canvas, gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.md }, backdrop: { backgroundColor: "rgba(23, 32, 27, 0.45)", flex: 1, justifyContent: "flex-end" }, body: { color: colors.ink, fontSize: typography.body, lineHeight: 23 }, bookButton: { alignItems: "center", backgroundColor: colors.fairwayDark, borderCurve: "continuous", borderRadius: 11, boxShadow: "0 5px 12px rgba(23, 63, 53, 0.2)", flexDirection: "row", gap: spacing.sm, justifyContent: "center", minHeight: 50, paddingHorizontal: spacing.md }, bookText: { color: colors.surface, fontSize: typography.body, fontWeight: "800", textAlign: "center" }, classLabel: { color: colors.fairwayDark, fontSize: 10, fontWeight: "800", letterSpacing: 1.1, textTransform: "uppercase" }, closeButton: { alignItems: "center", backgroundColor: "#EFF5EF", borderRadius: 99, height: 40, justifyContent: "center", width: 40 }, content: { gap: 18, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, paddingTop: spacing.sm }, handle: { alignSelf: "center", backgroundColor: "#C9CDCA", borderRadius: 999, height: 4, marginTop: spacing.sm, width: 48 }, identity: { alignItems: "center", flexDirection: "row", gap: spacing.md }, identityCopy: { flex: 1, gap: 4, minWidth: 0 }, meta: { color: colors.muted, fontSize: 12, lineHeight: 17 }, name: { color: colors.ink, fontSize: 22, fontWeight: "800", letterSpacing: -0.55 }, rating: { alignItems: "center", color: colors.fairwayDark, flexDirection: "row", fontSize: 14, fontWeight: "700" }, scheduleNote: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: "center" }, section: { borderTopColor: "#E9E8E2", borderTopWidth: StyleSheet.hairlineWidth, gap: spacing.sm, paddingTop: 14 }, sectionTitle: { color: "#5F665F", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase" }, sheet: { alignSelf: "center", maxWidth: 720, width: "100%", backgroundColor: colors.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%", minHeight: "70%", overflow: "hidden" }, sheetHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.xs }, stat: { alignItems: "center", backgroundColor: "#D4E2D5", borderCurve: "continuous", borderRadius: 10, flex: 1, flexDirection: "row", gap: 10, minHeight: 74, padding: spacing.md }, statCopy: { flex: 1, gap: 2, minWidth: 0 }, statIcon: { alignItems: "center", backgroundColor: "#BDD2BF", borderRadius: 99, height: 44, justifyContent: "center", width: 44 }, statLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" }, statValue: { color: colors.ink, fontSize: 16, fontWeight: "800" }, stats: { flexDirection: "row", gap: spacing.sm }, tag: { alignItems: "center", backgroundColor: "#EAF4EB", borderRadius: 99, color: colors.fairwayDark, fontSize: typography.small, fontWeight: "700", overflow: "hidden", paddingHorizontal: 12, paddingVertical: 8 }, tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, verifiedLabel: { alignItems: "center", flexDirection: "row", gap: 5 }
});
