import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import NoBogeyNotificationLogo from "../../../../../assets/logo/NoBogey-96x96.png";

export function InAppAlertBanner({ actionLabel, body, onAction, onDismiss, title }: { actionLabel: string; body: string; onAction: () => void; onDismiss: () => void; title: string }) {
  return <View accessibilityLiveRegion="polite" style={styles.banner}>
    <Image accessibilityLabel="NoBogey logo" source={NoBogeyNotificationLogo} style={styles.logo} />
    <View style={styles.copy}>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Pressable accessibilityRole="button" onPress={onAction} style={styles.action}><Text style={styles.actionText}>{actionLabel}</Text></Pressable>
    </View>
    <Pressable accessibilityLabel="Dismiss alert" accessibilityRole="button" hitSlop={8} onPress={onDismiss} style={styles.dismiss}><MaterialCommunityIcons color={colors.surface} name="close" size={20} /></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  action: { alignSelf: "flex-start", borderColor: "rgba(255,255,255,0.72)", borderRadius: radius.md, borderWidth: 1, justifyContent: "center", minHeight: 38, paddingHorizontal: spacing.md },
  actionText: { color: colors.surface, fontSize: typography.small, fontWeight: "900" },
  banner: { alignItems: "flex-start", backgroundColor: colors.fairwayDark, borderCurve: "continuous", borderRadius: 18, boxShadow: "0 6px 18px rgba(17, 84, 54, 0.24)", flexDirection: "row", gap: spacing.md, marginHorizontal: spacing.xl, padding: spacing.md },
  body: { color: "#E7F1EB", fontSize: typography.small, lineHeight: 18 },
  copy: { flex: 1, gap: spacing.sm },
  dismiss: { alignItems: "center", justifyContent: "center", minHeight: 32, minWidth: 32 },
  logo: { backgroundColor: colors.surface, borderRadius: 24, height: 48, width: 48 },
  title: { color: colors.surface, fontSize: typography.body, fontWeight: "900" }
});
