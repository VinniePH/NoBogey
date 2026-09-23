import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { formatTeeTime } from "@nobogey/utils";
import { EmptyState } from "../../ui/EmptyState";
import { FindGameScreen, Notice, ReviewSection, SelectedCaddieSummary, SelectedCourseSummary, flowColors } from "./components/FindGameUI";
import { useAppSession } from "../session/AppSession";
import { useMobileData } from "../data/useMobileData";

export function BookingSummaryScreen() {
  const { caddies, courses, isLoading } = useMobileData();
  const { caddieId, courseId, date, teeTimeId, time, noPreference } = useLocalSearchParams<{ caddieId?: string; courseId?: string; date?: string; teeTimeId?: string; time?: string; noPreference?: string }>();
  const caddie = caddies.find((item) => item.id === caddieId);
  const course = courses.find((item) => item.id === courseId);
  const { golferSignedIn } = useAppSession();
  const hasNoPreference = noPreference === "1";
  const canRequest = Boolean(course && teeTimeId && time && caddie && !hasNoPreference);

  if (isLoading) return <FindGameScreen actionDisabled actionLabel="Request booking" description="Almost there! Review your details and confirm your booking request." onAction={() => {}} step={4} title="Review your request"><Text style={styles.meta}>Loading booking details…</Text></FindGameScreen>;

  const continueToConfirmation = () => {
    if (!canRequest || !course || !caddie) return;
    if (!golferSignedIn) {
      router.push({ pathname: "/sign-in", params: { role: "golfer", returnTo: "/golfer/caddies", caddieId: caddie.id, courseId: course.id, teeTimeId, time } });
      return;
    }
    router.push({ pathname: "/golfer/bookings/new/payment", params: { caddieId: caddie.id, courseId: course.id, teeTimeId, time } });
  };

  return <FindGameScreen actionDisabled={!canRequest} actionLabel="Request booking" description="Almost there! Review your details and confirm your booking request." onAction={continueToConfirmation} step={4} title="Review your request">
    {!course ? <EmptyState description="Booking details will appear after the course service is connected." icon="golf" minHeight={250} title="Course unavailable" /> : <ReviewSection onEdit={() => router.push({ pathname: "/golfer/courses", params: { caddieId, courseId, date } })} title="Course"><SelectedCourseSummary course={course} flat /></ReviewSection>}
    <ReviewSection onEdit={() => router.push({ pathname: "/golfer/bookings/new/tee-times", params: { caddieId, courseId, date } })} title="Tee time"><View style={styles.timeRow}><Text style={styles.value}>{time ? formatTeeTime(time) : "No tee time selected"}</Text><Text style={styles.meta}>4 golfers</Text></View></ReviewSection>
    <ReviewSection onEdit={() => router.push({ pathname: "/golfer/caddies", params: { caddieId, courseId, date, teeTimeId, time } })} title="Preferred caddie">{caddie && !hasNoPreference ? <SelectedCaddieSummary caddie={caddie} flat /> : <View style={styles.timeRow}><Text style={styles.value}>{hasNoPreference ? "No preference" : "Caddie unavailable"}</Text>{hasNoPreference ? <Text style={styles.meta}>Let the club assign a caddie for you.</Text> : null}</View>}</ReviewSection>
    <Notice>{hasNoPreference ? "The golf club makes the final caddie assignment based on availability." : "Your preferred caddie is a request. The golf club will make the final caddie assignment based on availability."}</Notice>
    {hasNoPreference ? <Text accessibilityLiveRegion="polite" style={styles.limit}>The current booking action requires a named caddie. Select one to continue; a no-preference request is not supported yet.</Text> : <Text style={styles.nextStep}>You'll confirm the request on the next screen.</Text>}
  </FindGameScreen>;
}

const styles = StyleSheet.create({
  timeRow: { gap: 4 },
  value: { color: flowColors.ink, fontSize: 17, fontWeight: "800", lineHeight: 23 },
  meta: { color: flowColors.muted, fontSize: 14, lineHeight: 20 },
  limit: { color: "#8B4B24", fontSize: 13, lineHeight: 19 },
  nextStep: { color: flowColors.muted, fontSize: 13, lineHeight: 19 }
});
