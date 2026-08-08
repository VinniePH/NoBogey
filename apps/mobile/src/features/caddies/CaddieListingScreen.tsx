import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typography } from "@nobogey/ui";
import { caddies, courses } from "../../data/catalog";
import { BookingStepper } from "../../ui/booking-design";
import { CaddieCard } from "../booking/components/MarketplaceCards";
import { CaddieDetailSheet } from "./components/CaddieDetailSheet";
import { ResponsiveContent } from "../../ui/ResponsiveContent";

export function CaddieListingScreen() {
  const { caddieId, courseId, date, teeTimeId, time } = useLocalSearchParams<{ caddieId?: string; courseId?: string; date?: string; teeTimeId?: string; time?: string }>();
  const [selectedId, setSelectedId] = useState<string | undefined>(caddieId);
  const availableCaddies = useMemo(() => caddies.filter((caddie) => !courseId || caddie.homeCourseId === courseId), [courseId]);
  const isGlobalDirectory = !courseId || !teeTimeId;

  useEffect(() => {
    setSelectedId(availableCaddies.some((caddie) => caddie.id === caddieId) ? caddieId : undefined);
  }, [availableCaddies, caddieId]);

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent style={styles.frame}>
      {!isGlobalDirectory ? <BookingStepper step={3} /> : null}
      <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{isGlobalDirectory ? "Find a caddie." : "Request a caddie."}</Text><Text style={styles.subtitle}>{isGlobalDirectory ? "Browse every verified caddie on NoBogey. Their home course is shown in each profile." : "Choose a preferred caddie for your selected tee time. The course confirms the final assignment."}</Text></View>
      {availableCaddies.length ? <View style={styles.grid}>{availableCaddies.map((caddie) => <CaddieCard caddie={caddie} key={caddie.id} onPress={() => setSelectedId(caddie.id)} />)}</View> : <View style={styles.empty}><Text style={styles.emptyTitle}>No caddies available</Text><Text style={styles.subtitle}>Try another course or date to see available caddies.</Text></View>}
    </ResponsiveContent></ScrollView>
    <CaddieDetailSheet caddie={caddies.find((caddie) => caddie.id === selectedId) ?? null} course={courses.find((course) => course.id === (courseId ?? caddies.find((caddie) => caddie.id === selectedId)?.homeCourseId))} onBook={() => isGlobalDirectory ? router.push({ pathname: "/golfer/courses", params: { caddieId: selectedId, courseId: caddies.find((caddie) => caddie.id === selectedId)?.homeCourseId } }) : router.push({ pathname: "/golfer/bookings/new", params: { caddieId: selectedId, courseId, date, teeTimeId, time } })} onClose={() => setSelectedId(undefined)} visible={Boolean(selectedId)} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingBottom: spacing.xl },
  frame: { gap: spacing.xl },
  empty: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  emptyTitle: { color: "#17201B", fontSize: typography.title, fontWeight: "800" },
  grid: { alignItems: "center", gap: spacing.lg, paddingHorizontal: spacing.lg },
  heading: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  subtitle: { color: "#6E6D67", fontSize: typography.body, lineHeight: 23 },
  title: { color: "#000000", fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 42 }
});
