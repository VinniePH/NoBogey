import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Booking, Caddie, GolfCourse, Golfer } from "@nobogey/contracts";
import { formatMoney, formatTeeTime } from "@nobogey/utils";
import { colors, spacing, typography } from "@nobogey/ui";
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
  isAccepting?: boolean;
  isAssignmentAccepted?: boolean;
  onAcceptAssignment?: ((booking: Booking) => void) | undefined;
  onClose: () => void;
  onDeclineAssignment?: ((booking: Booking) => void) | undefined;
  visible: boolean;
};

/** Displays a dashboard-selected assignment without creating another navigation state. */
export function CaddieMatchSheet({ assignmentWindowState = "unknown", booking, caddie, course, golfer, isAccepting = false, isAssignmentAccepted = false, onAcceptAssignment, onClose, onDeclineAssignment, visible }: CaddieMatchSheetProps) {
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
              <StatusPill status={booking.status} />
              <View style={styles.courseCard}><DetailIcon icon="map-marker" /><View style={styles.flex}><Text style={styles.courseName}>{course.name}</Text><Text style={styles.courseMeta}>{formatDate(booking.teeTime)} · {formatTime(booking.teeTime)}</Text></View></View>
              <View style={styles.detailList}>
                <MatchDetail icon="account-outline" label="Golfer" value={golfer?.displayName ?? "Golfer details unavailable"} />
                <MatchDetail icon="account-group-outline" label="Party" value={`${booking.partySize} ${booking.partySize === 1 ? "golfer" : "golfers"}`} />
                <MatchDetail icon="currency-usd" label="Rate" value={formatMoney(booking.quotedRate.amountInCentavos, booking.quotedRate.currency)} />
                <MatchDetail icon="note-text-outline" label="Notes" value={booking.notes || "No notes provided."} />
              </View>
              <View style={styles.assignmentCard}><Text style={styles.assignmentHeading}>Assignment info</Text><View style={styles.assignmentRows}><MatchDetail icon="calendar-check-outline" label="Booking status" value={formatStatus(booking.status)} /><MatchDetail icon="account-check-outline" label="Status" value={formatStatus(booking.caddieAssignmentStatus ?? "not assigned")} /></View></View>
              <View style={styles.assignmentNote}><MaterialCommunityIcons color="#4D8066" name="information-outline" size={18} /><Text style={styles.assignmentNoteText}>{caddie.displayName} is shown from the local assignment record. Club confirmation remains authoritative.</Text></View>
              <AssignmentActions
                booking={booking}
                isAccepting={isAccepting}
                isAssignmentAccepted={isAssignmentAccepted}
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

function AssignmentActions({ booking, isAccepting, isAssignmentAccepted, onAccept, onDecline, windowState }: { booking: Booking; isAccepting: boolean; isAssignmentAccepted: boolean; onAccept: ((booking: Booking) => void) | undefined; onDecline: (() => void) | undefined; windowState: AssignmentWindowState }) {
  const presentation = getActionsForStatus(booking.status, windowState);

  if (isAssignmentAccepted) return <View style={styles.assignmentActions}><View accessibilityLabel="Assignment accepted" style={[styles.statusBadge, styles.confirmedBadge]}><Text style={styles.confirmedText}>Accepted</Text></View><Text selectable style={styles.actionNote}>Accepted in this device-only demo. The booking payment status was not changed.</Text></View>;
  if (presentation.kind === "confirmed") return <View style={styles.actionRow}><View accessibilityLabel="Assignment confirmed" style={[styles.statusBadge, styles.confirmedBadge]}><Text style={styles.confirmedText}>Confirmed</Text></View></View>;
  if (presentation.kind === "expired") return <View style={styles.actionRow}><View accessibilityLabel="Assignment expired" style={[styles.statusBadge, styles.expiredBadge]}><Text style={styles.expiredText}>Expired</Text></View></View>;
  if (presentation.kind === "none") return null;

  const acceptEnabled = presentation.enabled && Boolean(onAccept) && !isAccepting;
  const declineEnabled = presentation.enabled && Boolean(onDecline) && !isAccepting;
  return <View style={styles.assignmentActions}>
    <View style={styles.actionRow}>
      <Pressable accessibilityLabel="Accept assignment" accessibilityRole="button" accessibilityState={{ busy: isAccepting, disabled: !acceptEnabled }} disabled={!acceptEnabled} onPress={() => onAccept?.(booking)} style={({ pressed }) => [styles.actionButton, styles.acceptButton, !acceptEnabled && styles.disabledButton, pressed && styles.pressedButton]}><Text style={styles.acceptText}>{isAccepting ? "Accepting…" : "Accept Assignment"}</Text></Pressable>
      {onDecline ? <Pressable accessibilityLabel="Decline assignment" accessibilityRole="button" accessibilityState={{ disabled: !declineEnabled }} disabled={!declineEnabled} onPress={onDecline} style={({ pressed }) => [styles.actionButton, styles.declineButton, !declineEnabled && styles.disabledButton, pressed && styles.pressedButton]}><Text style={styles.declineText}>Decline</Text></Pressable> : null}
    </View>
    {!presentation.enabled ? <Text selectable style={styles.actionNote}>Confirmation becomes available when the booking window is connected.</Text> : !onAccept ? <Text selectable style={styles.actionNote}>Confirmation becomes available when the booking service is connected.</Text> : null}
  </View>;
}

function MatchDetail({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <View style={styles.detail}><DetailIcon icon={icon} /><Text style={styles.label}>{label}</Text><Text numberOfLines={2} selectable style={styles.value}>{value}</Text></View>;
}

function DetailIcon({ icon }: { icon: string }) { return <View style={styles.detailIcon}><MaterialCommunityIcons color="#256B48" name={icon as never} size={18} /></View>; }
function StatusPill({ status }: { status: string }) { return <View style={styles.requestedPill}><MaterialCommunityIcons color="#A46817" name="calendar-outline" size={15} /><Text style={styles.requestedText}>{formatStatus(status)}</Text></View>; }

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
  acceptButton: { backgroundColor: "#17623E" },
  acceptText: { color: colors.onPrimary, fontSize: 13, fontWeight: "900", textAlign: "center" },
  actionButton: { alignItems: "center", borderCurve: "continuous", borderRadius: 12, flex: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing.md },
  actionNote: { color: colors.textMuted, fontSize: 12, lineHeight: 16, textAlign: "center" },
  actionRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  assignmentCard: { backgroundColor: "#F3F3ED", borderRadius: 14, gap: spacing.sm, padding: spacing.sm },
  assignmentHeading: { color: "#1D3328", fontSize: 15, fontWeight: "900" },
  assignmentNote: { alignItems: "center", backgroundColor: "#E7F2E9", borderRadius: 10, flexDirection: "row", gap: 7, padding: spacing.sm },
  assignmentNoteText: { color: "#527063", flex: 1, fontSize: 11, lineHeight: 15 },
  assignmentRows: { backgroundColor: "#FFFFFF", borderRadius: 10, gap: 0, paddingHorizontal: spacing.sm },
  assignmentActions: { gap: spacing.sm },
  backdrop: { backgroundColor: "rgba(23, 32, 27, 0.45)", flex: 1, justifyContent: "flex-end" },
  closeButton: { alignItems: "center", justifyContent: "center", minHeight: 44, paddingHorizontal: spacing.sm },
  closeText: { color: colors.fairwayDark, fontSize: typography.small, fontWeight: "800" },
  content: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  courseCard: { alignItems: "center", backgroundColor: "#EEF6EF", borderRadius: 12, flexDirection: "row", gap: spacing.sm, padding: spacing.sm },
  courseMeta: { color: "#264436", fontSize: 13, fontWeight: "400", lineHeight: 17 },
  courseName: { color: "#173F2E", fontSize: 16, fontWeight: "900" },
  detail: { alignItems: "center", flexDirection: "row", gap: 8, minHeight: 40 },
  detailIcon: { alignItems: "center", backgroundColor: "#E8F3E9", borderRadius: 999, height: 32, justifyContent: "center", width: 32 },
  detailList: { backgroundColor: "#FFFFFF", borderRadius: 12, gap: 0, paddingHorizontal: spacing.sm },
  declineButton: { backgroundColor: colors.surface, borderColor: "#D3DDD4", borderWidth: 1 },
  declineText: { color: "#C3443F", fontSize: 13, fontWeight: "900" },
  disabledButton: { opacity: 0.5 },
  expiredBadge: { backgroundColor: colors.line },
  expiredText: { color: colors.textMuted, fontSize: typography.small, fontWeight: "800" },
  handle: { alignSelf: "center", backgroundColor: colors.line, borderRadius: 999, height: 5, marginTop: spacing.sm, width: 40 },
  flex: { flex: 1 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  label: { color: "#688074", fontSize: 10, fontWeight: "900", letterSpacing: .8, textTransform: "uppercase", width: 76 },
  pressedButton: { opacity: 0.78 },
  requestedPill: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#FFF2CF", borderRadius: 999, flexDirection: "row", gap: 5, paddingHorizontal: 10, paddingVertical: 6 },
  requestedText: { color: "#A46817", fontSize: 12, fontWeight: "900" },
  sheet: { alignSelf: "center", backgroundColor: "#FCFBF7", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%", maxWidth: 720, minHeight: "56%", overflow: "hidden", width: "100%" },
  statusBadge: { borderRadius: 999, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  confirmedBadge: { backgroundColor: "#C5F0D4" },
  confirmedText: { color: colors.fairwayDark, fontSize: typography.small, fontWeight: "800" },
  title: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  unavailable: { flex: 1, justifyContent: "center", padding: spacing.xl },
  value: { color: colors.ink, flex: 1, fontSize: 13, fontWeight: "800", lineHeight: 17 }
});
