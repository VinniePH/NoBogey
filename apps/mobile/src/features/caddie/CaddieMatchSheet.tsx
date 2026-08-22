import type { Booking, Caddie, GolfCourse, Golfer } from "@nobogey/contracts";
import { formatMoney, formatTeeTime } from "@nobogey/utils";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ConfirmationModal } from "../../ui/ConfirmationModal";
import { EmptyState } from "../../ui/EmptyState";
import { type AssignmentWindowState, getActionsForStatus } from "./caddie-assignment-ui";

type CaddieMatchSheetProps = {
  booking: Booking | undefined;
  caddie: Caddie | undefined;
  course: GolfCourse | undefined;
  golfer: Golfer | undefined;
  assignmentWindowState?: AssignmentWindowState;
  onAcceptAssignment?: ((booking: Booking) => void) | undefined;
  onClose: () => void;
  onDeclineAssignment?: ((booking: Booking) => void) | undefined;
  visible: boolean;
};

/** Displays a dashboard-selected assignment without creating another navigation state. */
export function CaddieMatchSheet({ assignmentWindowState = "unknown", booking, caddie, course, golfer, onAcceptAssignment, onClose, onDeclineAssignment, visible }: CaddieMatchSheetProps) {
  const insets = useSafeAreaInsets();
  const [declineConfirmationVisible, setDeclineConfirmationVisible] = useState(false);
  const isUnavailable = !booking || !caddie || !course;
  const closeSheet = () => {
    setDeclineConfirmationVisible(false);
    onClose();
  };

  return (
    <Modal animationType="slide" onRequestClose={closeSheet} presentationStyle="overFullScreen" transparent visible={visible}>
      <View style={styles.backdrop}>
        <Pressable accessibilityLabel="Close match details" accessibilityRole="button" onPress={closeSheet} style={StyleSheet.absoluteFill} />
        <View
          accessibilityLabel={isUnavailable ? "Match unavailable" : golfer ? `Match details for ${golfer.displayName}` : "Match details"}
          role="dialog"
          accessibilityViewIsModal
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>Match details</Text>
            <Pressable accessibilityLabel="Close match details" accessibilityRole="button" hitSlop={8} onPress={closeSheet} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          {isUnavailable
            ? <View style={styles.unavailable}><EmptyState description="This assignment will be available after the booking service is connected." icon="calendar-remove-outline" minHeight={280} title="Match unavailable" /></View>
            : <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator>
              <MatchDetail label="Golfer" value={golfer?.displayName ?? "Golfer details unavailable"} />
              <MatchDetail label="Course" value={course.name} />
              <MatchDetail label="Date" value={formatDate(booking.teeTime)} />
              <MatchDetail label="Tee time" value={formatTime(booking.teeTime)} />
              <MatchDetail label="Party size" value={`${booking.partySize} ${booking.partySize === 1 ? "golfer" : "golfers"}`} />
              <MatchDetail label="Notes" value={booking.notes || "No notes provided."} />
              <MatchDetail label="Quoted rate" value={formatMoney(booking.quotedRate.amountInCentavos, booking.quotedRate.currency)} />
              <MatchDetail label="Booking status" value={formatStatus(booking.status)} />
              <MatchDetail label="Assignment status" value={formatStatus(booking.caddieAssignmentStatus ?? "not assigned")} />
              <Text style={styles.assignmentNote}>{caddie.displayName} is shown from the local assignment record. Club confirmation remains authoritative.</Text>
              <AssignmentActions
                booking={booking}
                onAccept={onAcceptAssignment}
                onDecline={onDeclineAssignment ? () => setDeclineConfirmationVisible(true) : undefined}
                windowState={assignmentWindowState}
              />
            </ScrollView>}
        </View>
      </View>
      {booking && onDeclineAssignment ? <ConfirmationModal
        confirmLabel="Decline"
        description="Are you sure you want to decline this assignment?"
        onCancel={() => setDeclineConfirmationVisible(false)}
        onConfirm={() => {
          setDeclineConfirmationVisible(false);
          onDeclineAssignment(booking);
        }}
        title="Decline Assignment"
        visible={declineConfirmationVisible}
      /> : null}
    </Modal>
  );
}

function AssignmentActions({ booking, onAccept, onDecline, windowState }: { booking: Booking; onAccept: ((booking: Booking) => void) | undefined; onDecline: (() => void) | undefined; windowState: AssignmentWindowState }) {
  const presentation = getActionsForStatus(booking.status, windowState);

  if (presentation.kind === "confirmed") return <View style={styles.actionRow}><View accessibilityLabel="Assignment confirmed" style={[styles.statusBadge, styles.confirmedBadge]}><Text style={styles.confirmedText}>Confirmed</Text></View></View>;
  if (presentation.kind === "expired") return <View style={styles.actionRow}><View accessibilityLabel="Assignment expired" style={[styles.statusBadge, styles.expiredBadge]}><Text style={styles.expiredText}>Expired</Text></View></View>;
  if (presentation.kind === "none") return null;

  const acceptEnabled = presentation.enabled && Boolean(onAccept);
  const declineEnabled = presentation.enabled && Boolean(onDecline);
  return <View style={styles.assignmentActions}>
    <View style={styles.actionRow}>
      <Pressable accessibilityLabel="Accept assignment" accessibilityRole="button" accessibilityState={{ disabled: !acceptEnabled }} disabled={!acceptEnabled} onPress={() => onAccept?.(booking)} style={({ pressed }) => [styles.actionButton, styles.acceptButton, !acceptEnabled && styles.disabledButton, pressed && styles.pressedButton]}><Text style={styles.acceptText}>Accept Assignment</Text></Pressable>
      <Pressable accessibilityLabel="Decline assignment" accessibilityRole="button" accessibilityState={{ disabled: !declineEnabled }} disabled={!declineEnabled} onPress={onDecline} style={({ pressed }) => [styles.actionButton, styles.declineButton, !declineEnabled && styles.disabledButton, pressed && styles.pressedButton]}><Text style={styles.declineText}>Decline</Text></Pressable>
    </View>
    {!presentation.enabled ? <Text selectable style={styles.actionNote}>Confirmation becomes available when the booking window is connected.</Text> : !onAccept || !onDecline ? <Text selectable style={styles.actionNote}>Confirmation becomes available when the booking service is connected.</Text> : null}
  </View>;
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
  acceptButton: { backgroundColor: colors.primary },
  acceptText: { color: colors.onPrimary, fontSize: typography.small, fontWeight: "800", textAlign: "center" },
  actionButton: { alignItems: "center", borderCurve: "continuous", borderRadius: radius.lg, flex: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing.md },
  actionNote: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 16, textAlign: "center" },
  actionRow: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  assignmentNote: { color: colors.textMuted, fontSize: typography.small, lineHeight: 18 },
  assignmentActions: { gap: spacing.sm },
  backdrop: { backgroundColor: "rgba(23, 32, 27, 0.45)", flex: 1, justifyContent: "flex-end" },
  closeButton: { alignItems: "center", justifyContent: "center", minHeight: 44, paddingHorizontal: spacing.sm },
  closeText: { color: colors.fairwayDark, fontSize: typography.small, fontWeight: "800" },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  detail: { gap: spacing.xs },
  declineButton: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1 },
  declineText: { color: colors.accent, fontSize: typography.small, fontWeight: "800" },
  disabledButton: { opacity: 0.5 },
  expiredBadge: { backgroundColor: colors.line },
  expiredText: { color: colors.textMuted, fontSize: typography.small, fontWeight: "800" },
  handle: { alignSelf: "center", backgroundColor: colors.line, borderRadius: 999, height: 5, marginTop: spacing.sm, width: 40 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  pressedButton: { opacity: 0.78 },
  sheet: { alignSelf: "center", backgroundColor: colors.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%", maxWidth: 720, minHeight: "56%", overflow: "hidden", width: "100%" },
  statusBadge: { borderRadius: 999, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  confirmedBadge: { backgroundColor: "#C5F0D4" },
  confirmedText: { color: colors.fairwayDark, fontSize: typography.small, fontWeight: "800" },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: "800" },
  unavailable: { flex: 1, justifyContent: "center", padding: spacing.xl },
  value: { color: colors.ink, fontSize: typography.body, fontWeight: "700", lineHeight: 22 }
});
