import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { tessChat, tessSpeak, tessTranscribe } from "../lib/tessVoiceApi";

type VoiceStatus = "idle" | "recording" | "transcribing" | "thinking" | "speaking";

type Props = {
  palette: { background: string; card: string; text: string; muted: string; accent: string };
  childProfileId?: string;
  onBack?: () => void;
  onSwitchType?: () => void;
};

export function TessVoiceScreen({ palette, childProfileId = "cp1", onBack, onSwitchType }: Props) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const conversationId = useRef<string | undefined>(undefined);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const speak = useCallback(
    async (text: string) => {
      if (muted || !text.trim()) return;
      setStatus("speaking");
      try {
        const dataUri = await tessSpeak(text);
        if (dataUri) {
          if (soundRef.current) await soundRef.current.unloadAsync();
          const { sound } = await Audio.Sound.createAsync({ uri: dataUri });
          soundRef.current = sound;
          sound.setOnPlaybackStatusUpdate((s) => {
            if (s.isLoaded && s.didJustFinish) setStatus("idle");
          });
          await sound.playAsync();
          return;
        }
      } catch {
        /* fallback */
      }
      Speech.speak(text, { language: "en-US", pitch: 1.05, rate: 0.95 });
      setStatus("idle");
    },
    [muted]
  );

  const sendToTess = useCallback(
    async (text: string) => {
      setStatus("thinking");
      setError(null);
      try {
        const data = await tessChat(text, { conversationId: conversationId.current, childProfileId, mode: "voice" });
        conversationId.current = data.conversationId;
        const reply = data.message?.content ?? "";
        setResponse(reply);
        await speak(reply);
        if (muted) setStatus("idle");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Voice failed");
        setStatus("idle");
      }
    },
    [childProfileId, speak, muted]
  );

  const startRecording = async () => {
    if (status !== "idle") return;
    setError(null);
    setTranscript("");
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) throw new Error("Microphone permission required");
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setStatus("recording");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start recording");
    }
  };

  const stopRecording = async () => {
    const recording = recordingRef.current;
    if (!recording || status !== "recording") return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      if (!uri) throw new Error("No recording");
      setStatus("transcribing");
      const text = await tessTranscribe(uri);
      if (!text) throw new Error("No speech detected");
      setTranscript(text);
      await sendToTess(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recording failed");
      setStatus("idle");
    }
  };

  const label: Record<VoiceStatus, string> = {
    idle: "Tap mic to talk to Tess",
    recording: "Listening… tap when done",
    transcribing: "Understanding you…",
    thinking: "Tess is thinking…",
    speaking: "Tess is speaking…",
  };

  return (
    <View style={{ flex: 1 }}>
      {onBack ? (
        <Pressable onPress={onBack} style={{ padding: 12 }}>
          <Text style={{ color: palette.accent, fontWeight: "700" }}>← Back</Text>
        </Pressable>
      ) : null}
      <ScrollView contentContainerStyle={{ padding: 16, alignItems: "center" }}>
        <Text style={{ fontSize: 12, fontWeight: "700", color: palette.muted, marginBottom: 8 }}>Talk mode · Tess speaks back</Text>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: status === "recording" ? "#EF4444" : status === "speaking" ? "#A78BFA" : palette.accent,
            },
          ]}
        >
          <Text style={styles.avatarText}>T</Text>
        </View>
        <Text style={{ marginTop: 16, fontWeight: "700", color: palette.text }}>{label[status]}</Text>
        <Pressable
          style={[styles.micBtn, { backgroundColor: status === "recording" ? "#DC2626" : palette.accent }]}
          onPress={() => (status === "recording" ? void stopRecording() : void startRecording())}
          disabled={status === "thinking" || status === "transcribing" || status === "speaking"}
        >
          <Text style={styles.micText}>{status === "recording" ? "Done" : "Mic"}</Text>
        </Pressable>
        <View style={[styles.transcriptBox, { backgroundColor: palette.card }]}>
          <Text style={styles.label}>You said</Text>
          <Text style={{ color: palette.text }}>{transcript || "—"}</Text>
          <Text style={[styles.label, { marginTop: 12 }]}>Tess said</Text>
          <Text style={{ color: palette.text }}>{response || "—"}</Text>
        </View>
        {error ? <Text style={{ color: "#DC2626", marginTop: 8 }}>{error}</Text> : null}
        {(status === "thinking" || status === "transcribing") && <ActivityIndicator color={palette.accent} style={{ marginTop: 12 }} />}
        <View style={styles.row}>
          <Pressable onPress={() => setMuted(!muted)} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>{muted ? "Unmute" : "Mute"}</Text>
          </Pressable>
          {onSwitchType ? (
            <Pressable onPress={onSwitchType} style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>Type instead</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 40, fontWeight: "800" },
  micBtn: { marginTop: 24, width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  micText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  transcriptBox: { marginTop: 24, width: "100%", borderRadius: 16, padding: 16 },
  label: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", color: "#64748B", marginBottom: 4 },
  row: { flexDirection: "row", gap: 8, marginTop: 16 },
  smallBtn: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  smallBtnText: { fontWeight: "700", fontSize: 12 },
});
