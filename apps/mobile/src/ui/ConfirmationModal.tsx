import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type ConfirmationModalProps = {
  confirmLabel: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  visible: boolean;
};

/** Shared destructive confirmation shell for mobile actions. */
export function ConfirmationModal({ confirmLabel, description, onCancel, onConfirm, title, visible }: ConfirmationModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} presentationStyle="overFullScreen" transparent visible={visible}>
      <View style={styles.backdrop}>
        <Pressable accessibilityLabel={`Cancel ${title}`} accessibilityRole="button" onPress={onCancel} style={StyleSheet.absoluteFill} />
        <View accessibilityLabel={title} accessibilityViewIsModal role="alertdialog" style={styles.card}>
          <Pressable accessibilityLabel={`Close ${title}`} accessibilityRole="button" hitSlop={8} onPress={onCancel} style={styles.close}>
            <MaterialCommunityIcons color={colors.textMuted} name="close" size={22} />
          </Pressable>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons color={colors.accent} name="calendar-remove-outline" size={26} />
          </View>
          <View style={styles.copy}>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            <Text selectable style={styles.description}>{description}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable accessibilityLabel={`Cancel ${title}`} accessibilityRole="button" onPress={onCancel} style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable accessibilityLabel={confirmLabel} accessibilityRole="button" onPress={onConfirm} style={({ pressed }) => [styles.button, styles.confirmButton, pressed && styles.pressed]}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: spacing.md, width: "100%" },
  backdrop: { alignItems: "center", backgroundColor: "rgba(23, 32, 27, 0.55)", flex: 1, justifyContent: "center", padding: spacing.xl },
  button: { alignItems: "center", borderCurve: "continuous", borderRadius: 999, flex: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: spacing.md },
  cancelButton: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1 },
  cancelText: { color: colors.ink, fontSize: typography.small, fontWeight: "800" },
  card: { alignItems: "center", backgroundColor: colors.surface, borderCurve: "continuous", borderRadius: radius.lg, gap: spacing.lg, maxWidth: 420, padding: spacing.xl, width: "100%" },
  close: { alignItems: "center", alignSelf: "flex-end", height: 36, justifyContent: "center", marginBottom: -36, width: 36 },
  confirmButton: { backgroundColor: colors.accent },
  confirmText: { color: colors.onPrimary, fontSize: typography.small, fontWeight: "800" },
  copy: { alignItems: "center", gap: spacing.sm },
  description: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19, textAlign: "center" },
  iconBadge: { alignItems: "center", backgroundColor: "#FBE8E4", borderRadius: 999, height: 56, justifyContent: "center", width: 56 },
  pressed: { opacity: 0.78 },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: "800", textAlign: "center" }
});
