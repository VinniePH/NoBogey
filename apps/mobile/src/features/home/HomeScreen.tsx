import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "@nobogey/ui";
import homeCourseHero from "../../../assets/images/home-course-hero.jpg";
import { useMobileData } from "../data/useMobileData";
import { CaddieCard, CourseCard } from "../booking/components/MarketplaceCards";
import { CaddieDetailSheet } from "../caddies/components/CaddieDetailSheet";
import { EmptyState } from "../../ui/EmptyState";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { MOBILE_BOTTOM_NAVIGATION_HEIGHT, MobileBottomNavigation } from "../../ui/MobileBottomNavigation";
import { InAppAlertBanner } from "../notifications/InAppAlertBanner";
import { NotificationBell } from "../notifications/NotificationBell";
import { useNotificationAlerts } from "../notifications/NotificationAlertProvider";
import { TourTarget, useAutomaticGuidedTour } from "../guided-tour/GuidedTour";

const forest = "#173F35";
const cream = "#F7F5EF";
const ink = "#151515";
const muted = "#62645F";
const sage = "#F0F5EF";

const benefits = [
  { icon: "account-check-outline", title: "Trusted Caddies", detail: "Vetted & trained" },
  { icon: "lightning-bolt", title: "Instant Booking", detail: "In just a few taps" },
  { icon: "shield-check-outline", title: "Play with Confidence", detail: "Safe & seamless" }
] as const;

export function HomeScreen() {
  useAutomaticGuidedTour("golfer");
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const { caddies, courses } = useMobileData();
  const { dismissBanner, getUnreadCount, getVisibleAlert, markBookingOpened } = useNotificationAlerts();
  const [selectedCaddieId, setSelectedCaddieId] = useState<string>();
  const selectedCaddie = caddies.find((caddie) => caddie.id === selectedCaddieId) ?? null;
  const alert = getVisibleAlert("golfer");
  const contentWidth = Math.min(width, 720);
  const gutter = Math.max(16, Math.min(24, contentWidth * 0.055));
  const narrowBenefits = contentWidth < 390 || fontScale > 1.2;
  const cardWidth = Math.max(240, Math.min(320, contentWidth * 0.72));
  const wordmarkSize = Math.max(34, Math.min(44, contentWidth * 0.1));
  const subtitleSize = Math.max(22, Math.min(28, contentWidth * 0.065));

  return <SafeAreaView edges={["top"]} style={styles.safeArea}><ScrollView contentContainerStyle={[styles.content, { paddingBottom: MOBILE_BOTTOM_NAVIGATION_HEIGHT + insets.bottom + spacing.xl }]} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent style={styles.page}>
    {alert ? <InAppAlertBanner actionLabel="View booking" body={alert.body} onAction={() => { markBookingOpened(alert.bookingId, "golfer"); router.push({ pathname: "/golfer/bookings/[bookingId]", params: { bookingId: alert.bookingId } }); }} onDismiss={() => dismissBanner(alert.id)} title={alert.title} /> : null}
    <TourTarget id="golfer-home"><ImageBackground imageStyle={styles.heroImage} resizeMode="cover" source={homeCourseHero} style={[styles.hero, { minHeight: Math.max(252, Math.min(310, contentWidth * 0.74)) }]}><View style={[styles.heroCopy, { paddingHorizontal: gutter, paddingTop: Math.max(16, gutter) }]}>
      <View style={styles.brandRow}><Text accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit style={[styles.wordmark, { fontSize: wordmarkSize, lineHeight: wordmarkSize * 1.1 }]}>NoBogey</Text><NotificationBell count={getUnreadCount("golfer")} onPress={() => router.push("/golfer/bookings")} /></View>
      <View style={styles.heroMessage}><Text style={[styles.subtitle, { fontSize: subtitleSize, lineHeight: subtitleSize * 1.15 }]}>The perfect walk, arranged <Text style={styles.subtitleAccent}>on-demand.</Text></Text><Text style={styles.heroDescription}>Professional caddies for every skill level. Book your preferred bagman at any course in the metro, instantly.</Text></View>
    </View></ImageBackground></TourTarget>
    <View style={[styles.searchCard, { marginHorizontal: gutter, padding: Math.max(14, gutter * 0.8) }]}><SearchDetail icon="map-marker" label="Location" value="No course selected" /><View style={styles.divider} /><SearchDetail icon="calendar-month-outline" label="Date" value="No date selected" /><Pressable accessibilityLabel="Choose a course" accessibilityRole="button" onPress={() => router.push("/golfer/courses")} style={({ pressed }) => [styles.searchButton, pressed && styles.searchButtonPressed]}><Text style={styles.searchButtonText}>Choose a course</Text><MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={19} /></Pressable></View>
    <View style={[styles.benefits, { marginHorizontal: gutter }]}>{benefits.map((benefit, index) => <View key={benefit.title} style={[styles.benefit, narrowBenefits && styles.benefitNarrow, narrowBenefits && index === 2 && styles.benefitFull]}><MaterialCommunityIcons color={forest} name={benefit.icon} size={22} /><Text style={styles.benefitTitle}>{benefit.title}</Text><Text style={styles.benefitDetail}>{benefit.detail}</Text></View>)}</View>
    <HomeSection actionLabel="See All" onAction={() => router.push("/golfer/courses/all")} subtitle="Popular courses around you" title="Courses" gutter={gutter}>{courses.length ? <ScrollView horizontal contentContainerStyle={[styles.horizontalList, { paddingHorizontal: gutter }]} showsHorizontalScrollIndicator={false}>{courses.map((course) => <CourseCard compact compactWidth={cardWidth} course={course} key={course.id} onPress={() => router.push({ pathname: "/golfer/courses/[courseId]", params: { courseId: course.id } })} />)}</ScrollView> : <View style={{ paddingHorizontal: gutter }}><EmptyState description="Courses will appear after the catalog service is connected." icon="golf" minHeight={390} title="No courses available" /></View>}</HomeSection>
    <HomeSection actionLabel="See All" onAction={() => router.push("/golfer/caddies/all")} title="Caddies" gutter={gutter}>{caddies.length ? <ScrollView horizontal contentContainerStyle={[styles.horizontalList, { paddingHorizontal: gutter }]} showsHorizontalScrollIndicator={false}>{caddies.map((caddie) => <CaddieCard caddie={caddie} compact compactWidth={cardWidth} key={caddie.id} onPress={() => setSelectedCaddieId(caddie.id)} />)}</ScrollView> : <View style={{ paddingHorizontal: gutter }}><EmptyState description="Caddies will appear after the directory service is connected." icon="account-group-outline" minHeight={470} title="No caddies available" /></View>}</HomeSection>
  </ResponsiveContent></ScrollView><MobileBottomNavigation active="home" /><CaddieDetailSheet caddie={selectedCaddie} course={courses.find((course) => course.id === selectedCaddie?.homeCourseId)} onBook={() => router.push({ pathname: "/golfer/courses", params: { caddieId: selectedCaddie?.id, courseId: selectedCaddie?.homeCourseId } })} onClose={() => setSelectedCaddieId(undefined)} visible={Boolean(selectedCaddie)} /></SafeAreaView>;
}

function SearchDetail({ icon, label, value }: { icon: "map-marker" | "calendar-month-outline"; label: string; value: string }) {
  return <View style={styles.searchDetail}><View style={styles.searchIcon}><MaterialCommunityIcons color={forest} name={icon} size={21} /></View><View style={styles.searchCopy}><Text style={styles.fieldLabel}>{label}</Text><Text selectable style={styles.fieldValue}>{value}</Text></View></View>;
}

function HomeSection({ actionLabel, children, gutter, onAction, subtitle, title }: { actionLabel: string; children: React.ReactNode; gutter: number; onAction: () => void; subtitle?: string; title: string }) {
  return <View style={styles.section}><View style={[styles.sectionHeader, { paddingHorizontal: gutter }]}><View style={styles.sectionHeading}><Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>{subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}</View><Pressable accessibilityLabel={`${actionLabel} ${title.toLowerCase()}`} accessibilityRole="button" hitSlop={8} onPress={onAction} style={styles.seeAllButton}><Text style={styles.seeAll}>{actionLabel}</Text><MaterialCommunityIcons color={forest} name="chevron-right" size={17} /></Pressable></View>{children}</View>;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: cream, flex: 1 },
  content: { paddingTop: 0 },
  page: { gap: 26 },
  hero: { backgroundColor: sage, overflow: "hidden", width: "100%" },
  heroImage: { width: "100%" },
  heroCopy: { backgroundColor: "rgba(247, 245, 239, 0.78)", flex: 1, gap: 8, paddingBottom: 48 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between" },
  wordmark: { color: forest, flexShrink: 1, fontStyle: "italic", fontWeight: "900", letterSpacing: -1.8 },
  heroMessage: { gap: 8, maxWidth: 570 },
  subtitle: { color: ink, fontWeight: "700", letterSpacing: -0.55, maxWidth: 390 },
  subtitleAccent: { color: forest },
  heroDescription: { color: "#444B45", fontSize: 15, lineHeight: 21, maxWidth: 370 },
  searchCard: { backgroundColor: "#FFFFFF", borderColor: "#E5E1D8", borderCurve: "continuous", borderRadius: 20, borderWidth: 1, boxShadow: "0 5px 18px rgba(23, 63, 53, 0.09)", gap: 4, marginTop: -90 },
  searchDetail: { alignItems: "center", flexDirection: "row", gap: 12, minHeight: 55, paddingVertical: 5 },
  searchIcon: { alignItems: "center", backgroundColor: sage, borderRadius: 20, height: 38, justifyContent: "center", width: 38 },
  searchCopy: { flex: 1, gap: 2, minWidth: 0 },
  fieldLabel: { color: "#59665E", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  fieldValue: { color: ink, fontSize: 15, lineHeight: 21 },
  divider: { backgroundColor: "#EBE9E2", height: 1, marginLeft: 50 },
  searchButton: { alignItems: "center", backgroundColor: forest, borderCurve: "continuous", borderRadius: 11, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 48, marginTop: 8, paddingHorizontal: 18 },
  searchButtonPressed: { backgroundColor: "#10332B" },
  searchButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  benefits: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  benefit: { alignItems: "center", backgroundColor: "#DDE9DF", borderRadius: 6, flex: 1, gap: 4, minHeight: 100, minWidth: 0, paddingHorizontal: 6, paddingVertical: 12 },
  benefitNarrow: { flexBasis: "45%", paddingHorizontal: 12 },
  benefitFull: { flexBasis: "100%" },
  benefitTitle: { color: ink, fontSize: 14, fontWeight: "800", lineHeight: 18, textAlign: "center" },
  benefitDetail: { color: muted, fontSize: 13, lineHeight: 17, textAlign: "center" },
  section: { gap: 13 },
  sectionHeader: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between" },
  sectionHeading: { flex: 1, minWidth: 0 },
  sectionTitle: { color: ink, fontSize: 25, fontWeight: "800", letterSpacing: -0.65 },
  sectionSubtitle: { color: muted, fontSize: 13, lineHeight: 18 },
  seeAllButton: { alignItems: "center", flexDirection: "row", justifyContent: "center", minHeight: 44 },
  seeAll: { color: forest, fontSize: 14, fontWeight: "800" },
  horizontalList: { gap: 12, paddingBottom: 8 }
});
