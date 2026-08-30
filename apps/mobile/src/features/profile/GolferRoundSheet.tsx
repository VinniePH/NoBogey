import { colors, spacing, typography } from "@nobogey/ui";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "../../ui/EmptyState";

type GolferRound = {
  caddieName: string;
  date: string;
  score: number;
};

type GolferRoundSheetProps = {
  courseName: string;
  onClose: () => void;
  round: GolferRound | undefined;
  visible: boolean;
};

/** Shows the golfer's selected local round-history record without adding navigation state. */
export function GolferRoundSheet({ courseName, onClose, round, visible }: GolferRoundSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="overFullScreen" transparent visible={visible}>
      <View style={styles.backdrop}>
        <Pressable accessibilityLabel="Close round details" accessibilityRole="button" onPress={onClose} style={StyleSheet.absoluteFill} />
        <View accessibilityLabel={round ? `Round details from ${round.date}` : "Round unavailable"} accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>Round details</Text>
            <Pressable accessibilityLabel="Close round details" accessibilityRole="button" hitSlop={8} onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
          {round
            ? <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator>
              <RoundDetail label="Course" value={courseName} />
              <RoundDetail label="Date" value={round.date} />
              <RoundDetail label="Caddie" value={round.caddieName} />
              <RoundDetail label="Your score" value={String(round.score)} />
              <Text style={styles.note}>This round history is controlled local demo data and does not include a connected booking record.</Text>
            </ScrollView>
            : <View style={styles.unavailable}><EmptyState description="This round is no longer available in the local history records." icon="golf" title="Round unavailable" /></View>}
        </View>
      </View>
    </Modal>
  );
}

function RoundDetail({ label, value }: { label: string; value: string }) {
  return <View style={styles.detail}><Text style={styles.label}>{label}</Text><Text selectable style={styles.value}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(23, 32, 27, 0.45)", flex: 1, justifyContent: "flex-end" },
  closeButton: { alignItems: "center", justifyContent: "center", minHeight: 44, paddingHorizontal: spacing.sm },
  closeText: { color: colors.fairwayDark, fontSize: typography.small, fontWeight: "800" },
  content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: spacing.xxl },
  detail: { gap: spacing.xs },
  handle: { alignSelf: "center", backgroundColor: colors.line, borderRadius: 999, height: 5, marginTop: spacing.sm, width: 40 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  note: { color: colors.textMuted, fontSize: typography.small, lineHeight: 18 },
  sheet: { alignSelf: "center", backgroundColor: colors.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%", maxWidth: 720, minHeight: "48%", overflow: "hidden", width: "100%" },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: "800" },
  unavailable: { flex: 1, justifyContent: "center", padding: spacing.xl },
  value: { color: colors.ink, fontSize: typography.body, fontWeight: "700", lineHeight: 22 }
});
