import { Pressable, ScrollView, StyleSheet, Text, View, Image } from "react-native";
import { CHILD_QUICK_BUTTONS, TESS_DISCLAIMER } from "@family-support/core";

type Props = {
  palette: { background: string; card: string; text: string; muted: string; accent: string };
  onOpenChat: (prompt?: string) => void;
  onOpenCalm: () => void;
};

export function TessHomeScreen({ palette, onOpenChat, onOpenCalm }: Props) {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <View style={styles.headerRow}>
          <Image source={require("../../assets/tess-icon.png")} style={styles.tessIcon} accessibilityLabel="Tess AI support companion" />
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: palette.text }]}>Tess</Text>
            <Text style={[styles.body, { color: palette.muted }]}>Your support companion.</Text>
          </View>
        </View>
        <Text style={[styles.disclaimer, { color: palette.muted }]}>{TESS_DISCLAIMER.slice(0, 160)}…</Text>
      </View>

      <Pressable style={[styles.largeBtn, { backgroundColor: palette.accent }]} onPress={() => onOpenChat()}>
        <Text style={styles.largeBtnText}>Talk to Tess</Text>
      </Pressable>
      <Pressable style={[styles.largeBtn, styles.outline, { borderColor: palette.accent }]} onPress={() => onOpenChat()}>
        <Text style={[styles.largeBtnText, { color: palette.accent }]}>Type to Tess</Text>
      </Pressable>
      <Pressable style={[styles.largeBtn, { backgroundColor: "#FEF3C7" }]} onPress={() => onOpenChat("I need help")}>
        <Text style={[styles.largeBtnText, { color: "#92400E" }]}>I need help</Text>
      </Pressable>
      <Pressable style={[styles.largeBtn, { backgroundColor: "#DBEAFE" }]} onPress={() => onOpenChat("I need a break")}>
        <Text style={[styles.largeBtnText, { color: "#1E40AF" }]}>I need a break</Text>
      </Pressable>
      <Pressable style={[styles.largeBtn, { backgroundColor: "#EDE9FE" }]} onPress={onOpenCalm}>
        <Text style={[styles.largeBtnText, { color: "#5B21B6" }]}>I feel…</Text>
      </Pressable>

      <Text style={[styles.section, { color: palette.muted }]}>Quick buttons</Text>
      <View style={styles.wrap}>
        {CHILD_QUICK_BUTTONS.map((b) => (
          <Pressable key={b.id} style={styles.chip} onPress={() => onOpenChat(b.prompt)}>
            <Text style={styles.chipText}>{b.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tessIcon: { width: 48, height: 48, borderRadius: 14, resizeMode: "contain" },
  headerCopy: { flex: 1 },
  title: { fontSize: 22, fontWeight: "800" },
  body: { marginTop: 4, fontSize: 14 },
  disclaimer: { marginTop: 8, fontSize: 11, lineHeight: 16 },
  largeBtn: { borderRadius: 16, paddingVertical: 18, alignItems: "center" },
  outline: { backgroundColor: "#fff", borderWidth: 2 },
  largeBtnText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  section: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginTop: 8 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#E0E7FF", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 12, fontWeight: "700", color: "#3730A3" },
});
