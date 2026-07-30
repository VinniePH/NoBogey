import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typography } from "@nobogey/ui";
import { courses } from "../../data/mock";
import { BookingStepper, PrimaryButton, StickyActionBar } from "../../ui/booking-design";
import { CourseCard } from "../booking/components/MarketplaceCards";
import { ResponsiveContent } from "../../ui/ResponsiveContent";

export function CourseSelectionScreen() {
  const { caddieId, courseId, date } = useLocalSearchParams<{ caddieId?: string; courseId?: string; date?: string }>();
  const [selectedId, setSelectedId] = useState<string | undefined>(courseId);

  useEffect(() => {
    setSelectedId(courseId);
  }, [courseId]);

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent style={styles.frame}>
      <BookingStepper step={1} />
      <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>Pick your course.</Text><Text style={styles.subtitle}>{date ? `Courses staffed by NoBogey on ${date}.` : "Browse courses currently staffed by NoBogey."}</Text></View>
      <View accessibilityRole="radiogroup" style={styles.list}>{courses.map((course) => <CourseCard course={course} key={course.id} onPress={() => setSelectedId(course.id)} selected={selectedId === course.id} />)}</View>
    </ResponsiveContent></ScrollView>
    <StickyActionBar><PrimaryButton disabled={!selectedId} label="Choose tee time" onPress={() => router.push({ pathname: "/tee-times", params: { caddieId, courseId: selectedId, date } })} /></StickyActionBar>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingBottom: spacing.xl },
  frame: { gap: spacing.xl },
  heading: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  list: { gap: spacing.lg, paddingHorizontal: spacing.xl },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  subtitle: { color: "#6E6D67", fontSize: typography.body, lineHeight: 23 },
  title: { color: "#000000", fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 42 }
});
