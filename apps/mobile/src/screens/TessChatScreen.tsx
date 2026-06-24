import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import { CHILD_QUICK_BUTTONS } from "@family-support/core";
import { tessChat } from "../lib/tessApi";

type Props = {
  palette: { background: string; card: string; text: string; muted: string; accent: string };
  childProfileId?: string;
  initialPrompt?: string;
  onBack?: () => void;
};

export function TessChatScreen({ palette, childProfileId = "cp1", onBack }: Props) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationId = useRef<string | undefined>(undefined);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      setError(null);
      setMessages((prev) => [...prev, { role: "user", content: text }]);
      setInput("");
      setLoading(true);
      try {
        const data = await tessChat(text, {
          conversationId: conversationId.current,
          childProfileId,
          mode: "text",
        });
        conversationId.current = data.conversationId;
        const reply = data.message?.content ?? "";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        Speech.speak(reply, { language: "en-US" });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send");
      } finally {
        setLoading(false);
      }
    },
    [loading, childProfileId]
  );

  return (
    <View style={{ flex: 1 }}>
      {onBack ? (
        <Pressable onPress={onBack} style={{ padding: 12 }}>
          <Text style={{ color: palette.accent, fontWeight: "700" }}>← Back</Text>
        </Pressable>
      ) : null}
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ gap: 10 }}>
        {messages.length === 0 ? (
          <Text style={{ color: palette.muted, textAlign: "center" }}>Talk or type to Tess.</Text>
        ) : null}
        {messages.map((m, i) => (
          <View
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: m.role === "user" ? palette.accent : "#E0E7FF",
              borderRadius: 16,
              padding: 12,
              maxWidth: "85%",
            }}
          >
            <Text style={{ color: m.role === "user" ? "#fff" : palette.text }}>{m.content}</Text>
          </View>
        ))}
        {loading ? <ActivityIndicator color={palette.accent} /> : null}
        {error ? <Text style={{ color: "#DC2626" }}>{error}</Text> : null}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, paddingHorizontal: 12 }}>
        {CHILD_QUICK_BUTTONS.slice(0, 10).map((b) => (
          <Pressable key={b.id} style={styles.chip} onPress={() => send(b.prompt)}>
            <Text style={styles.chipText}>{b.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type to Tess…"
          style={[styles.input, { color: palette.text }]}
          placeholderTextColor={palette.muted}
        />
        <Pressable style={[styles.sendBtn, { backgroundColor: palette.accent }]} onPress={() => send(input)}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { backgroundColor: "#E0E7FF", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: "700", color: "#3730A3" },
  inputRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  input: { flex: 1, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  sendBtn: { borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "700" },
});
