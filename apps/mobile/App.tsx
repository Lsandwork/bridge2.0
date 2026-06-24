import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SAFETY_DISCLAIMER, TESS_DISCLAIMER } from "@family-support/core";
import { getCommunicationCategories } from "@family-support/data";
import { TessHomeScreen } from "./src/screens/TessHomeScreen";
import { TessChatScreen } from "./src/screens/TessChatScreen";
import { TessVoiceScreen } from "./src/screens/TessVoiceScreen";

type Tab = "home" | "communicate" | "routines" | "learn" | "tess" | "more";
type TessView = "home" | "chat" | "voice" | "calm";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "communicate", label: "Talk" },
  { id: "routines", label: "Routines" },
  { id: "learn", label: "Learn" },
  { id: "tess", label: "Tess" },
  { id: "more", label: "More" },
];

export default function App() {
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [tessView, setTessView] = useState<TessView>("home");
  const [tessPrompt, setTessPrompt] = useState<string | undefined>();
  const [categories, setCategories] = useState<string[]>([]);
  const [sentence, setSentence] = useState("");
  const [lowStimulation, setLowStimulation] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    void Notifications.requestPermissionsAsync();
    void getCommunicationCategories().then(setCategories);
  }, []);

  const palette = useMemo(
    () => ({
      background: highContrast ? "#111827" : "#EFF6FF",
      card: highContrast ? "#1F2937" : "#FFFFFF",
      text: highContrast ? "#F9FAFB" : "#1F2937",
      muted: highContrast ? "#9CA3AF" : "#475569",
      accent: lowStimulation ? "#6366F1" : "#2563EB",
    }),
    [highContrast, lowStimulation]
  );

  const openTessChat = (prompt?: string) => {
    setTessPrompt(prompt);
    setTessView("chat");
    setTab("tess");
  };

  if (!acceptedDisclaimer) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
        <StatusBar style={highContrast ? "light" : "dark"} />
        <View style={[styles.card, { backgroundColor: palette.card, margin: 16 }]}>
          <Text style={[styles.title, { color: palette.text }]}>Bridge</Text>
          <Text style={[styles.body, { color: palette.muted }]}>{SAFETY_DISCLAIMER}</Text>
          <Text style={[styles.body, { color: palette.muted, marginTop: 12 }]}>{TESS_DISCLAIMER.slice(0, 200)}…</Text>
          <Pressable style={[styles.primaryButton, { backgroundColor: palette.accent }]} onPress={() => setAcceptedDisclaimer(true)}>
            <Text style={styles.primaryButtonText}>I understand and continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    if (tab === "tess") {
      if (tessView === "chat") {
        return <TessChatScreen palette={palette} onBack={() => setTessView("home")} />;
      }
      if (tessView === "voice") {
        return (
          <TessVoiceScreen
            palette={palette}
            onBack={() => setTessView("home")}
            onSwitchType={() => {
              setTessView("chat");
              setTab("tess");
            }}
          />
        );
      }
      if (tessView === "calm") {
        return (
          <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
            <Pressable onPress={() => setTessView("home")}>
              <Text style={{ color: palette.accent, fontWeight: "700" }}>← Back</Text>
            </Pressable>
            <Text style={[styles.title, { color: palette.text }]}>What do you need?</Text>
            {["Quiet", "Space", "Movement", "Help", "Water", "I do not know"].map((o) => (
              <Pressable key={o} style={[styles.largeBtn, { backgroundColor: palette.card }]} onPress={() => openTessChat(`I want ${o.toLowerCase()}`)}>
                <Text style={{ fontWeight: "800", color: palette.text }}>{o}</Text>
              </Pressable>
            ))}
          </ScrollView>
        );
      }
      return (
        <TessHomeScreen
          palette={palette}
          onOpenChat={openTessChat}
          onOpenCalm={() => setTessView("calm")}
        />
      );
    }

    if (tab === "communicate") {
      return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { backgroundColor: palette.card }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Communication</Text>
            <TextInput value={sentence} onChangeText={setSentence} placeholder="Build a sentence…" style={styles.input} />
            <View style={styles.rowWrap}>
              {categories.map((c) => (
                <Pressable key={c} style={styles.categoryButton} onPress={() => setSentence((s) => `${s} ${c}`.trim())}>
                  <Text style={styles.categoryButtonText}>{c}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={[styles.primaryButton, { backgroundColor: palette.accent }]} onPress={() => sentence && Speech.speak(sentence)}>
              <Text style={styles.primaryButtonText}>Say it</Text>
            </Pressable>
          </View>
        </ScrollView>
      );
    }

    if (tab === "routines") {
      return (
        <View style={{ padding: 16 }}>
          <Text style={[styles.title, { color: palette.text }]}>Routines</Text>
          <Pressable style={[styles.primaryButton, { backgroundColor: palette.accent, marginTop: 16 }]} onPress={() => openTessChat("Help me start my routine")}>
            <Text style={styles.primaryButtonText}>Start routine with Tess</Text>
          </Pressable>
        </View>
      );
    }

    if (tab === "learn") {
      return (
        <View style={{ padding: 16 }}>
          <Text style={[styles.title, { color: palette.text }]}>Learn</Text>
          <Pressable style={[styles.primaryButton, { backgroundColor: palette.accent, marginTop: 16 }]} onPress={() => openTessChat("Help me practice a skill")}>
            <Text style={styles.primaryButtonText}>Practice with Tess</Text>
          </Pressable>
        </View>
      );
    }

    if (tab === "more") {
      return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { backgroundColor: palette.card }]}>
            <View style={styles.toggleRow}>
              <Text style={{ color: palette.text }}>Low-stimulation</Text>
              <Switch value={lowStimulation} onValueChange={setLowStimulation} />
            </View>
            <View style={styles.toggleRow}>
              <Text style={{ color: palette.text }}>High-contrast</Text>
              <Switch value={highContrast} onValueChange={setHighContrast} />
            </View>
            <Pressable style={styles.warningButton} onPress={() => Alert.alert("Emergency", "Contact a trusted adult or emergency services.")}>
              <Text style={styles.primaryButtonText}>Emergency card</Text>
            </Pressable>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: palette.card }]}>
          <Text style={[styles.title, { color: palette.text }]}>Bridge Home</Text>
          <Text style={[styles.body, { color: palette.muted }]}>Welcome to your daily support space.</Text>
          <Pressable style={[styles.primaryButton, { backgroundColor: palette.accent, marginTop: 12 }]} onPress={() => { setTab("tess"); setTessView("home"); }}>
            <Text style={styles.primaryButtonText}>Open Tess</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar style={highContrast ? "light" : "dark"} />
      <View style={{ flex: 1 }}>{renderContent()}</View>
      <View style={[styles.tabBar, { backgroundColor: palette.card }]}>
        {TABS.map((t) => (
          <Pressable key={t.id} style={styles.tabItem} onPress={() => { setTab(t.id); if (t.id === "tess") setTessView("home"); }}>
            <Text style={[styles.tabLabel, { color: tab === t.id ? palette.accent : palette.muted, fontWeight: tab === t.id ? "800" : "600" }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 10, padding: 10, fontSize: 15, marginBottom: 10 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap" },
  primaryButton: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, alignItems: "center" },
  warningButton: { backgroundColor: "#DC2626", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 12 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700" },
  categoryButton: { borderRadius: 8, borderWidth: 1, borderColor: "#BFDBFE", paddingHorizontal: 10, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  categoryButtonText: { color: "#1D4ED8", fontWeight: "600", fontSize: 12 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  tabBar: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingVertical: 8 },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 6 },
  tabLabel: { fontSize: 11 },
  largeBtn: { borderRadius: 16, padding: 18, alignItems: "center" },
});
