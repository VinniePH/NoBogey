import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "@nobogey/ui";

interface CaddieAvatarProps {
  name: string;
  source?: string | undefined;
  size?: "small" | "large";
}

export function CaddieAvatar({ name, size = "small", source }: CaddieAvatarProps) {
  const dimension = size === "large" ? 88 : 44;
  const initial = name.trim().slice(0, 1).toUpperCase();
  const [imageFailed, setImageFailed] = useState(false);

  return source && !imageFailed ? (
    <Image
      accessibilityLabel={`${name} profile photo`}
      onError={() => setImageFailed(true)}
      source={{ uri: source }}
      style={[styles.image, { height: dimension, width: dimension }]}
    />
  ) : (
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
  image: {
    backgroundColor: colors.line,
    borderRadius: 999
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
