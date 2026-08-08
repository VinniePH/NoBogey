import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "@nobogey/ui";

interface CaddieAvatarProps {
  name: string;
  size?: "small" | "large";
}

export function CaddieAvatar({ name, size = "small" }: CaddieAvatarProps) {
  const dimension = size === "large" ? 88 : 44;
  const initial = name.trim().slice(0, 1).toUpperCase();
  return (
    <View
      accessibilityLabel={`${name} profile avatar`}
      accessibilityRole="image"
      style={[styles.fallback, { height: dimension, width: dimension }]}
    >
      <Text style={[styles.initial, size === "large" && styles.largeInitial]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    backgroundColor: colors.fairway,
    borderRadius: 999,
    justifyContent: "center"
  },
  initial: {
    color: colors.surface,
    fontSize: typography.title,
    fontWeight: "800"
  },
  largeInitial: {
    fontSize: typography.heading
  }
});
