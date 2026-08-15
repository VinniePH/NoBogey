import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { radius, spacing, typography } from "@nobogey/ui";
import { formatMoney } from "@nobogey/utils";
import { PrimaryButton, StickyActionBar } from "../../ui/booking-design";
import { EmptyState } from "../../ui/EmptyState";
import { backToPreviousPage } from "../../ui/navigation";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { CaddieAvatar } from "./components/CaddieAvatar";
import { useMobileData } from "../data/useMobileData";

export function CaddieProfileScreen() {
  const { caddies, courses } = useMobileData();
  const { caddieId, courseId } = useLocalSearchParams<{ caddieId?: string; courseId?: string }>();
  const caddie = caddies.find((item) => item.id === caddieId);
  if (!caddie) return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}><View style={styles.emptyPage}><EmptyState description="Caddie details will appear after the directory service is connected." icon="account-off-outline" minHeight={640} title="Caddie unavailable" /></View></SafeAreaView>;
  const course = courses.find((item) => item.id === (courseId ?? caddie.homeCourseId));
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent>
      <View style={styles.pageBody}>
        <View style={styles.avatar}><CaddieAvatar name={caddie.displayName} size="large" /></View>
        <Text style={styles.classLabel}>A - CLASS</Text><Text accessibilityRole="header" selectable style={styles.name}>{caddie.displayName}</Text><Text selectable style={styles.meta}>{caddie.yearsExperience} Years Pro · {caddie.languages.join(", ")}</Text>
        <View style={styles.statGrid}><Stat label="RATING" value={caddie.ratingAverage.toFixed(1)} /><Stat label="ROUNDS" value={String(caddie.completedRounds)} /><Stat label="RATE" value={formatMoney(caddie.rate.amountInCentavos)} /><Stat label="REVIEWS" value={String(caddie.reviewCount)} /></View>
      </View>
      <View style={styles.about}><Section title="ABOUT"><Text selectable style={styles.aboutText}>{caddie.bio}</Text><Text selectable style={styles.homeCourse}>Home Course: <Text style={styles.homeCourseValue}>{course?.name ?? "Not set"}</Text></Text></Section><Section title="SPECIALTIES"><View style={styles.tags}>{caddie.specialties.map((item) => <Text key={item} style={styles.tag}>{item}</Text>)}</View></Section><Section title="PREFERRED-CADDIE REQUEST"><Text selectable style={styles.scheduleNote}>Choose a tee time from the club’s live tee sheet. This caddie is requested first; the course assigns the next qualified caddie if their prior round is still in progress.</Text></Section></View>
    </ResponsiveContent></ScrollView>
    <StickyActionBar><View style={styles.actions}><Pressable accessibilityLabel="Close caddie profile" accessibilityRole="button" onPress={() => backToPreviousPage("/golfer/home")} style={styles.close}><Text style={styles.closeText}>Close</Text></Pressable><View style={styles.book}><PrimaryButton label="Choose tee time" onPress={() => router.push({ pathname: "/golfer/bookings/new/tee-times", params: { caddieId: caddie.id, courseId } })} /></View></View></StickyActionBar>
  </SafeAreaView>;
}

function Stat({ label, value }: { label: string; value: string }) { return <View style={styles.stat}><Text style={styles.classLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>; }
function Section({ children, title }: { children: React.ReactNode; title: string }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }

const styles = StyleSheet.create({
  about: { backgroundColor: "#F5F2EA", gap: 34, padding: spacing.xl },
  aboutText: { color: "#454742", fontSize: 21, lineHeight: 26 },
  avatar: { alignItems: "center", backgroundColor: "#E7EEE9", borderRadius: 22, justifyContent: "center", minHeight: 220 },
  actions: { flexDirection: "row", gap: spacing.md },
  book: { flex: 1 },
  classLabel: { color: "#60766A", fontSize: typography.small, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  close: { alignItems: "center", borderColor: "#999890", borderRadius: radius.md, borderWidth: 1, justifyContent: "center", minHeight: 52, paddingHorizontal: spacing.xl },
  closeText: { color: "#24543D", fontSize: typography.body, fontWeight: "800" },
  content: { paddingBottom: spacing.lg },
  emptyPage: { flex: 1, justifyContent: "center", padding: spacing.xl },
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
});
