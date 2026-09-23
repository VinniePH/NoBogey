import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmptyState } from "../../ui/EmptyState";
import { CourseOptionCard, FindGameScreen, SectionHeading, flowColors } from "../booking/components/FindGameUI";
import { useMobileData } from "../data/useMobileData";

export function CourseSelectionScreen() {
  const { courses, isLoading } = useMobileData();
  const { caddieId, courseId, date } = useLocalSearchParams<{ caddieId?: string; courseId?: string; date?: string }>();
  const [selectedId, setSelectedId] = useState<string | undefined>(courseId);

  useEffect(() => { setSelectedId(courseId); }, [courseId]);

  return <FindGameScreen actionDisabled={isLoading || !courses.some((course) => course.id === selectedId)} actionLabel="Continue" description="Book a round with trusted caddies in a few simple steps." onAction={() => router.push({ pathname: "/golfer/bookings/new/tee-times", params: { caddieId, courseId: selectedId, date } })} step={1} title="Find a Game">
    <SectionHeading description="Select the course where you'd like to play." title="Choose a course" />
    <View accessibilityRole="radiogroup" style={styles.list}>{isLoading ? <Text style={styles.loading}>Loading courses…</Text> : courses.length ? courses.map((course) => <CourseOptionCard course={course} key={course.id} onPress={() => setSelectedId(course.id)} selected={selectedId === course.id} />) : <EmptyState description="Courses will appear after the catalog service is connected." icon="golf" minHeight={260} title="No courses available" />}</View>
  </FindGameScreen>;
}

const styles = StyleSheet.create({ list: { gap: 10 }, loading: { color: flowColors.muted, fontSize: 14, paddingVertical: 20 } });
