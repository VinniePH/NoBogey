import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@nobogey/ui";

export function NotificationBell({ count, onPress }: { count: number; onPress: () => void }) {
  const badge = count > 9 ? "9+" : String(count);
  return <Pressable accessibilityLabel={count ? `Notifications, ${count} unread` : "Notifications"} accessibilityRole="button" hitSlop={8} onPress={onPress} style={styles.button}>
    <MaterialCommunityIcons color={colors.fairwayDark} name="bell-outline" size={24} />
    {count ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  badge: { alignItems: "center", backgroundColor: colors.accent, borderColor: colors.surface, borderRadius: 10, borderWidth: 2, justifyContent: "center", minHeight: 18, minWidth: 18, paddingHorizontal: 3, position: "absolute", right: 0, top: 0 },
  badgeText: { color: colors.surface, fontSize: 9, fontVariant: ["tabular-nums"], fontWeight: "900" },
  button: { alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44, position: "relative" }
});
