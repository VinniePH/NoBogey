import type { Booking, Caddie, GolfCourse, Golfer } from "@nobogey/contracts";
import { formatMoney, formatTeeTime } from "@nobogey/utils";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "../../ui/EmptyState";

type CaddieMatchSheetProps = {
  booking: Booking | undefined;
  caddie: Caddie | undefined;
  course: GolfCourse | undefined;
  golfer: Golfer | undefined;
  onClose: () => void;
  visible: boolean;
};

/** Displays a dashboard-selected assignment without creating another navigation state. */
export function CaddieMatchSheet({ booking, caddie, course, golfer, onClose, visible }: CaddieMatchSheetProps) {
  const insets = useSafeAreaInsets();
  const isUnavailable = !booking || !caddie || !course || !golfer;

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="overFullScreen" transparent visible={visible}>
      <View style={styles.backdrop}>
        <Pressable accessibilityLabel="Close match details" accessibilityRole="button" onPress={onClose} style={StyleSheet.absoluteFill} />
        <View
          accessibilityLabel={isUnavailable ? "Match unavailable" : `Match details for ${golfer.displayName}`}
          accessibilityRole="dialog"
          accessibilityViewIsModal
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>Match details</Text>
            <Pressable accessibilityLabel="Close match details" accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          {isUnavailable
            ? <View style={styles.unavailable}><EmptyState description="This assignment will be available after the booking service is connected." icon="calendar-remove-outline" minHeight={280} title="Match unavailable" /></View>
            : <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator>
              <MatchDetail label="Golfer" value={golfer.displayName} />
              <MatchDetail label="Course" value={course.name} />
              <MatchDetail label="Date" value={formatDate(booking.teeTime)} />
              <MatchDetail label="Tee time" value={formatTime(booking.teeTime)} />
              <MatchDetail label="Party size" value={`${booking.partySize} ${booking.partySize === 1 ? "golfer" : "golfers"}`} />
              <MatchDetail label="Notes" value={booking.notes || "No notes provided."} />
              <MatchDetail label="Quoted rate" value={formatMoney(booking.quotedRate.amountInCentavos, booking.quotedRate.currency)} />
              <MatchDetail label="Booking status" value={formatStatus(booking.status)} />
              <MatchDetail label="Assignment status" value={formatStatus(booking.caddieAssignmentStatus ?? "not assigned")} />
              <Text style={styles.assignmentNote}>{caddie.displayName} is shown from the local assignment record. Club confirmation remains authoritative.</Text>
            </ScrollView>}
        </View>
      </View>
    </Modal>
  );
}

function MatchDetail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.label}>{label}</Text><Text selectable style={styles.value}>{value}</Text></View>;
}

function formatDate(teeTime: string) {
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", weekday: "long", year: "numeric", timeZone: "Asia/Manila" }).format(new Date(teeTime));
}

function formatTime(teeTime: string) {
  return formatTeeTime(teeTime).replace(/^[A-Z][a-z]{2} \d+, /, "");
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  assignmentNote: { color: colors.textMuted, fontSize: typography.small, lineHeight: 18 },
  backdrop: { backgroundColor: "rgba(23, 32, 27, 0.45)", flex: 1, justifyContent: "flex-end" },
  closeButton: { alignItems: "center", justifyContent: "center", minHeight: 44, paddingHorizontal: spacing.sm },
  closeText: { color: colors.fairwayDark, fontSize: typography.small, fontWeight: "800" },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  detail: { gap: spacing.xs },
  handle: { alignSelf: "center", backgroundColor: colors.line, borderRadius: 999, height: 5, marginTop: spacing.sm, width: 40 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  sheet: { alignSelf: "center", backgroundColor: colors.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%", maxWidth: 720, minHeight: "56%", overflow: "hidden", width: "100%" },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: "800" },
  unavailable: { flex: 1, justifyContent: "center", padding: spacing.xl },
  value: { color: colors.ink, fontSize: typography.body, fontWeight: "700", lineHeight: 22 }
});
