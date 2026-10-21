import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatTeeTime } from "@nobogey/utils";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mobilePalette as palette } from "../../ui/mobile-palette";
import { EmptyState } from "../../ui/EmptyState";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { useMobileData } from "../data/useMobileData";
import { RoundConfirmationSummary } from "../booking/round-confirmation-ui";
import { isUpcomingCaddieBooking } from "./caddie-assignment-ui";

export function CaddieRosterScreen() {
  const { bookings, courses, isLoading } = useMobileData();
  const assignments = bookings.filter(isUpcomingCaddieBooking);
  return <SafeAreaView edges={["bottom"]} style={styles.safe}><ScrollView contentContainerStyle={styles.page} contentInsetAdjustmentBehavior="automatic"><ResponsiveContent style={styles.frame}>
    <Text accessibilityRole="header" style={styles.title}>Caddie roster</Text>
    <Text style={styles.copy}>Your upcoming requests and confirmed rounds. Open a confirmed booking to confirm meetup and payment.</Text>
    {isLoading && !assignments.length ? <ActivityIndicator accessibilityLabel="Loading roster" color={palette.forest} /> : !assignments.length ? <EmptyState title="No upcoming assignments" description="Your requested and confirmed rounds will appear here." icon="calendar-blank-outline" minHeight={260} /> : null}
    {assignments.map((booking) => <Pressable accessibilityRole="button" accessibilityLabel={`Open ${booking.status} booking at ${courses.find((course) => course.id === booking.courseId)?.name ?? "golf course"}`} key={booking.id} onPress={() => router.push({ pathname: "/caddie/matches/[bookingId]", params: { bookingId: booking.id } })} style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}>
      <View style={styles.top}><Text style={styles.status}>{booking.status === "confirmed" ? "Confirmed" : "Requested"}</Text></View>
      <Text style={styles.course}>{courses.find((course) => course.id === booking.courseId)?.name ?? "Course details unavailable"}</Text>
      <Text style={styles.copy}>{formatTeeTime(booking.teeTime)}</Text>
      <Text style={styles.copy}>Assigned golfer · {booking.partySize} {booking.partySize === 1 ? "golfer" : "golfers"}</Text>
      {booking.status === "confirmed" ? <RoundConfirmationSummary bookingId={booking.id} /> : null}
      <View style={styles.bottom}><Text style={styles.link}>{booking.status === "confirmed" ? "View round confirmations" : "View assignment details"}</Text><MaterialCommunityIcons color={palette.forest} name="chevron-right" size={22} /></View>
    </Pressable>)}
  </ResponsiveContent></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { backgroundColor: palette.white, flex: 1 }, page: { padding: 20, paddingBottom: 36 }, frame: { gap: 16 },
  title: { color: palette.forest, fontSize: 28, fontWeight: "900" }, copy: { color: "#626C61", fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: "#FFFFFF", borderColor: palette.line, borderRadius: 16, borderWidth: 1, padding: 18, gap: 10 },
  top: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 },
  status: { color: palette.forest, backgroundColor: "#E3EFE3", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, fontWeight: "800" },
  course: { color: palette.forest, fontSize: 19, fontWeight: "800" },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopColor: palette.line, borderTopWidth: 1, paddingTop: 12, gap: 8 },
  link: { color: palette.forest, fontSize: 13, fontWeight: "800", flex: 1 }
});
