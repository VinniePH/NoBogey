import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { flowColors } from "./FindGameUI";

export type GameIcon = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
export type GameOption = { id: string; label: string; detail?: string; leading?: ReactNode };

export function GameDropdown({ label, placeholder, value, icon, leading, disabled, expanded, onToggle, options, selectedId, onSelect }: {
  label: string; placeholder: string; value?: string | undefined; icon: GameIcon; leading?: ReactNode;
  disabled?: boolean; expanded: boolean; onToggle: () => void; options: GameOption[];
  selectedId?: string | undefined; onSelect: (id: string) => void;
}) {
  return <View style={styles.field}>
    <Text style={[styles.label, disabled && styles.muted]}>{label}</Text>
    <View style={[styles.control, disabled && styles.disabled, expanded && styles.open]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}, ${value || placeholder}`} accessibilityHint="Opens selection list" accessibilityState={{ disabled: Boolean(disabled), expanded }} disabled={disabled} onPress={onToggle} style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}>
        {leading ?? <MaterialCommunityIcons color={flowColors.forest} name={icon} size={22} />}
        <Text style={[styles.value, !value && styles.muted]}>{value || placeholder}</Text>
        <MaterialCommunityIcons color={flowColors.muted} name={expanded ? "chevron-up" : "chevron-down"} size={20} />
      </Pressable>
      {expanded && !disabled ? <ScrollView accessibilityRole="radiogroup" accessibilityLabel={label} nestedScrollEnabled style={styles.options} contentContainerStyle={styles.optionContent}>
        {options.map((option) => <Pressable key={option.id} accessibilityRole="radio" accessibilityLabel={`${option.label}${option.detail ? `, ${option.detail}` : ""}`} accessibilityState={{ selected: selectedId === option.id }} onPress={() => onSelect(option.id)} style={({ pressed }) => [styles.option, selectedId === option.id && styles.selected, pressed && styles.pressed]}>
          {option.leading ?? <MaterialCommunityIcons color={flowColors.forest} name={icon} size={20} />}
          <View style={styles.copy}><Text style={styles.value}>{option.label}</Text>{option.detail ? <Text style={styles.detail}>{option.detail}</Text> : null}</View>
          {selectedId === option.id ? <MaterialCommunityIcons color={flowColors.forest} name="check-circle" size={19} /> : null}
        </Pressable>)}
      </ScrollView> : null}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { color: flowColors.forest, fontSize: 13, fontWeight: "700" },
  control: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: flowColors.border, borderRadius: 10, overflow: "hidden" },
  open: { borderColor: "#78968A", boxShadow: "0 3px 10px rgba(23,63,53,0.08)" },
  trigger: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, paddingHorizontal: 12, paddingVertical: 9 },
  value: { color: flowColors.ink, fontSize: 14, fontWeight: "600", flexShrink: 1, flexGrow: 1, lineHeight: 20 },
  muted: { color: flowColors.muted, fontWeight: "400" },
  disabled: { opacity: 0.4, backgroundColor: "#EFEEE9" },
  options: { maxHeight: 240, borderTopWidth: 1, borderTopColor: flowColors.border },
  optionContent: { padding: 4 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 8, paddingVertical: 10, minHeight: 46, borderRadius: 6 },
  selected: { backgroundColor: flowColors.sage },
  copy: { flex: 1, gap: 2 },
  detail: { color: flowColors.muted, fontSize: 12, lineHeight: 17 },
  pressed: { opacity: 0.7 }
});
