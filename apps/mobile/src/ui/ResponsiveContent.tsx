import type { PropsWithChildren } from "react";
import { useWindowDimensions, View, type ViewProps } from "react-native";

/** Keeps mobile-first screens readable on tablets and the web without constraining small phones. */
export function ResponsiveContent({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  const { width } = useWindowDimensions();
  return <View {...props} style={[{ alignSelf: "center", maxWidth: width >= 768 ? 720 : undefined, width: "100%" }, style]}>{children}</View>;
}
