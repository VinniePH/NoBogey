import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typography } from "@nobogey/ui";
import { caddies, courses } from "../../data/mock";
import { BookingStepper } from "../../ui/booking-design";
import { CaddieCard } from "../booking/components/MarketplaceCards";
import { CaddieDetailSheet } from "./components/CaddieDetailSheet";

export function CaddieListingScreen() {
  const { caddieId, courseId, date } = useLocalSearchParams<{ caddieId?: string; courseId?: string; date?: string }>();
  const [selectedId, setSelectedId] = useState<string | undefined>(caddieId);
  const availableCaddies = useMemo(() => caddies.filter((caddie) => !courseId || caddie.homeCourseId === courseId), [courseId]);

  useEffect(() => {
    setSelectedId(availableCaddies.some((caddie) => caddie.id === caddieId) ? caddieId : undefined);
  }, [availableCaddies, caddieId]);

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BookingStepper step={2} />
      <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>Pick your caddie.</Text><Text style={styles.subtitle}>Choose one available at your selected course.</Text></View>
      {availableCaddies.length ? <View style={styles.grid}>{availableCaddies.map((caddie) => <CaddieCard caddie={caddie} key={caddie.id} onPress={() => setSelectedId(caddie.id)} />)}</View> : <View style={styles.empty}><Text style={styles.emptyTitle}>No caddies available</Text><Text style={styles.subtitle}>Try another course or date to see available caddies.</Text></View>}
    </ScrollView>
    <CaddieDetailSheet caddie={caddies.find((caddie) => caddie.id === selectedId) ?? null} course={courses.find((course) => course.id === courseId)} onBook={(time) => router.push({ pathname: "/booking", params: { caddieId: selectedId, courseId, date, time } })} onClose={() => setSelectedId(undefined)} visible={Boolean(selectedId)} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingBottom: spacing.xl },
  empty: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  emptyTitle: { color: "#17201B", fontSize: typography.title, fontWeight: "800" },
  grid: { alignItems: "center", gap: spacing.lg, paddingHorizontal: spacing.lg },
  heading: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  subtitle: { color: "#6E6D67", fontSize: typography.body, lineHeight: 23 },
  title: { color: "#000000", fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 42 }
});
