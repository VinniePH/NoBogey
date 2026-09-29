import type { StyleProp, TextStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { mobilePalette } from "./mobile-palette";

interface NoBogeyWordmarkProps {
  centered?: boolean;
  style?: StyleProp<TextStyle>;
}

/** A viewport-centered text wordmark that stays centered beside uneven actions. */
export function NoBogeyWordmark({ centered = true, style }: NoBogeyWordmarkProps) {
  return (
    <View pointerEvents="none" style={[styles.container, centered && styles.centered]}>
      <Text accessibilityRole="header" numberOfLines={1} style={[styles.wordmark, style]}>NoBogey</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center"
  },
  centered: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  wordmark: {
    color: mobilePalette.forest,
    fontSize: 25,
    fontStyle: "italic",
    fontWeight: "900",
    letterSpacing: -1.2
  }
});
