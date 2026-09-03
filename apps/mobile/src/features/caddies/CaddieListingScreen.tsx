import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typography } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { BookingStepper } from "../../ui/booking-design";
import { CaddieCard } from "../booking/components/MarketplaceCards";
import { CaddieDetailSheet } from "./components/CaddieDetailSheet";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { MobileBottomNavigation } from "../../ui/MobileBottomNavigation";
import { useMobileData } from "../data/useMobileData";
import { getAvailableCaddies } from "../../../backend/caddies/caddies.service";

export function CaddieListingScreen() {
  const { caddies, courses } = useMobileData();
  const { caddieId, courseId, date, teeTimeId, time } = useLocalSearchParams<{ caddieId?: string; courseId?: string; date?: string; teeTimeId?: string; time?: string }>();
  const [selectedId, setSelectedId] = useState<string | undefined>(caddieId);
  const [bookableIds, setBookableIds] = useState<Set<string> | null>(null);
  const isGlobalDirectory = !courseId || !teeTimeId;
  const availableCaddies = useMemo(() => caddies.filter((caddie) => (!courseId || caddie.homeCourseId === courseId) && (isGlobalDirectory || bookableIds?.has(caddie.id))), [bookableIds, caddies, courseId, isGlobalDirectory]);

  useEffect(() => {
    let active = true;
    if (isGlobalDirectory || !courseId || !time) { setBookableIds(null); return; }
    void getAvailableCaddies(courseId, time).then(items => { if (active) setBookableIds(new Set(items.map(item => item.id))); }).catch(() => { if (active) setBookableIds(new Set()); });
    return () => { active = false; };
  }, [courseId, isGlobalDirectory, time]);

  useEffect(() => {
    setSelectedId(availableCaddies.some((caddie) => caddie.id === caddieId) ? caddieId : undefined);
  }, [availableCaddies, caddieId]);

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent style={styles.frame}>
      {!isGlobalDirectory ? <BookingStepper step={3} /> : null}
      <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{isGlobalDirectory ? "Find a caddie." : "Request a caddie."}</Text><Text style={styles.subtitle}>{isGlobalDirectory ? "Browse every verified caddie on NoBogey. Their home course is shown in each profile." : "Choose a preferred caddie for your selected tee time. The course confirms the final assignment."}</Text></View>
      {availableCaddies.length ? <View style={styles.grid}>{availableCaddies.map((caddie) => <CaddieCard caddie={caddie} key={caddie.id} onPress={() => setSelectedId(caddie.id)} />)}</View> : <View style={styles.empty}><EmptyState description={isGlobalDirectory ? "No verified caddies are currently listed." : "No verified caddie is available for the full selected round."} icon="account-group-outline" minHeight={620} title="No caddies available" /></View>}
    </ResponsiveContent></ScrollView>
    <CaddieDetailSheet caddie={caddies.find((caddie) => caddie.id === selectedId) ?? null} course={courses.find((course) => course.id === (courseId ?? caddies.find((caddie) => caddie.id === selectedId)?.homeCourseId))} onBook={() => isGlobalDirectory ? router.push({ pathname: "/golfer/courses", params: { caddieId: selectedId, courseId: caddies.find((caddie) => caddie.id === selectedId)?.homeCourseId } }) : router.push({ pathname: "/golfer/bookings/new", params: { caddieId: selectedId, courseId, date, teeTimeId, time } })} onClose={() => setSelectedId(undefined)} visible={Boolean(selectedId)} />
    {isGlobalDirectory ? <MobileBottomNavigation active="caddies" /> : null}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingBottom: 112 },
  frame: { gap: spacing.xl },
  empty: { paddingHorizontal: spacing.xl },
  grid: { alignItems: "center", gap: spacing.lg, paddingHorizontal: spacing.lg },
  heading: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  subtitle: { color: "#6E6D67", fontSize: typography.body, lineHeight: 23 },
  title: { color: "#000000", fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 42 }
});
