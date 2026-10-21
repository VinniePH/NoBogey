import { formatMoney, formatTeeTime } from "@nobogey/utils";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../ui/EmptyState";
import { mobilePalette as palette } from "../../ui/mobile-palette";
import { backToPreviousPage } from "../../ui/navigation";
import { Button } from "../../ui/primitives";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { useMobileData } from "../data/useMobileData";
import { RoundConfirmationActions } from "../booking/round-confirmation-ui";

export function CaddieMatchDetailScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const { bookings, courses, isLoading } = useMobileData();
  const booking = bookings.find((item) => item.id === bookingId);
  const course = courses.find((item) => item.id === booking?.courseId);
  return <SafeAreaView edges={["bottom"]} style={styles.safe}><ScrollView contentContainerStyle={styles.page} contentInsetAdjustmentBehavior="automatic"><ResponsiveContent style={styles.frame}>
    {!booking ? <><EmptyState title={isLoading ? "Loading assignment…" : "Assignment unavailable"} description="Open an upcoming booking from your roster to view its details." icon="calendar-remove-outline" /><Button onPress={() => backToPreviousPage("/caddie/roster")}>Back to roster</Button></> : <>
      <Text style={styles.status}>{booking.status === "confirmed" ? "Confirmed booking" : booking.status.replaceAll("_", " ")}</Text>
      <Text accessibilityRole="header" style={styles.title}>{course?.name ?? "Course details unavailable"}</Text>
      <Text selectable style={styles.copy}>{formatTeeTime(booking.teeTime)}</Text>
      <View style={styles.card}><Detail label="Golfer" value="Assigned golfer" /><Detail label="Group size" value={`${booking.partySize} ${booking.partySize === 1 ? "golfer" : "golfers"}`} /><Detail label="Caddie fee" value={formatMoney(booking.quotedRate.amountInCentavos, booking.quotedRate.currency)} /><Detail label="Booking reference" value={booking.id} /></View>
      <RoundConfirmationActions booking={booking} role="caddie" />
      <Button onPress={() => backToPreviousPage("/caddie/roster")} variant="secondary">Back to roster</Button>
    </>}
  </ResponsiveContent></ScrollView></SafeAreaView>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.label}>{label}</Text><Text selectable style={styles.value}>{value}</Text></View>;
}
const styles = StyleSheet.create({
  safe: { backgroundColor: palette.white, flex: 1 }, page: { padding: 20, paddingBottom: 36 }, frame: { gap: 18 },
  status: { color: palette.forest, fontSize: 12, fontWeight: "800" }, title: { color: palette.forest, fontSize: 27, fontWeight: "900" },
  copy: { color: "#626C61", fontSize: 14, lineHeight: 21 }, card: { backgroundColor: "#FFFFFF", borderColor: palette.line, borderWidth: 1, borderRadius: 16, padding: 18, gap: 16 },
  detail: { gap: 5 }, label: { color: "#626C61", fontSize: 12 }, value: { color: palette.forest, fontSize: 15, fontWeight: "700", lineHeight: 21 }
});
