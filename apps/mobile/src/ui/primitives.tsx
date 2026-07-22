import type { PropsWithChildren, ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, type TextProps, View, type ViewProps } from "react-native";
import { colors, elevation, fonts, lineHeights, radius, spacing, typography } from "@nobogey/ui";

type TextVariant = keyof typeof typography;

export function AppText({ children, mono = false, style, variant = "body", ...props }: PropsWithChildren<TextProps & { mono?: boolean | undefined; variant?: TextVariant | undefined }>) {
  return (
    <Text
      {...props}
      selectable={props.selectable ?? true}
      style={[
        {
          color: colors.text,
          fontFamily: mono ? fonts.mono : fonts.sans,
          fontSize: typography[variant],
          lineHeight: lineHeights[variant]
        },
        style
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: colors.backgroundElevated,
          borderColor: colors.border,
          borderCurve: "continuous",
          borderRadius: radius.lg,
          borderWidth: 1,
          boxShadow: elevation.card,
          padding: spacing.lg
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  accessibilityLabel?: string | undefined;
  children: ReactNode;
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
  onPress?: (() => void) | undefined;
  variant?: ButtonVariant | undefined;
}

export function Button({ accessibilityLabel, children, disabled = false, loading = false, onPress, variant = "primary" }: ButtonProps) {
  const isDisabled = disabled || loading;
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: isPrimary ? (pressed ? colors.primaryPressed : colors.primary) : pressed ? colors.canvas : colors.backgroundElevated,
        borderColor: variant === "secondary" ? colors.border : "transparent",
        borderCurve: "continuous",
        borderRadius: radius.md,
        borderWidth: variant === "secondary" ? 1 : 0,
        justifyContent: "center",
        minHeight: 48,
        opacity: isDisabled ? 0.5 : 1,
        paddingHorizontal: spacing.lg
      })}
    >
      {loading ? <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.primary} /> : (
        <AppText selectable={false} style={{ color: isPrimary ? colors.onPrimary : colors.text, fontWeight: "700" }}>
          {children}
        </AppText>
      )}
    </Pressable>
  );
}
