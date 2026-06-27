"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useProfile } from "@/components/ProfileProvider";

const STARTERS = [
  "I feel",
  "I need",
  "I want",
  "I do not want",
  "I am hurt",
  "I need help",
  "I need a break",
  "I need space",
  "Please stop",
  "I am overwhelmed",
  "I want quiet",
  "I want movement",
  "I need my person",
];

const WORDS: Record<string, string[]> = {
  "I feel": ["happy", "sad", "mad", "scared", "tired", "okay"],
  "I need": ["help", "a break", "space", "water", "quiet", "my parent"],
  "I want": ["quiet", "movement", "a hug", "to go home", "to try again"],
};

export default function MySpaceTessBuilderPage() {
  const { activeProfile } = useProfile();
  const [sentence, setSentence] = useState("");
  const [cards, setCards] = useState<{ phrase: string }[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!activeProfile?.id) return;
    fetch(`/api/communication?childProfileId=${activeProfile.id}`)
      .then((r) => r.json())
      .then((data) => setCards(Array.isArray(data?.cards) ? data.cards.slice(0, 12) : []));
  }, [activeProfile?.id]);

  const speak = () => {
    if (!sentence.trim() || typeof window === "undefined") return;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(sentence));
  };

  const savePhrase = async () => {
    if (!activeProfile?.id || !sentence.trim()) return;
    await fetch("/api/tess/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        childProfileId: activeProfile.id,
        suggestionType: "communication_card",
        title: sentence,
        reason: "Saved from Nuvio communication builder",
        suggestedPayload: { phrase: sentence, category: "Custom" },
      }),
    });
    setSaved(true);
  };

  return (
    <div className="ms-page ms-page-pad-bottom mx-auto max-w-lg px-4 py-6">
      <Link href="/my-space/tess" className="mb-4 flex items-center gap-1 text-sm font-bold text-[var(--ms-accent)]">
        <ArrowLeft className="h-4 w-4" /> Nuvio
      </Link>

      <h1 className="text-xl font-extrabold">Build a sentence</h1>
      <div className="mt-4 min-h-[4rem] rounded-2xl border-2 border-[var(--ms-accent)] bg-[var(--ms-card)] p-4 text-lg font-bold">
        {sentence || "Tap words below…"}
      </div>

      <div className="mt-3 flex gap-2">
        <button type="button" className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[var(--ms-accent)] py-3 text-sm font-bold text-white" onClick={speak}>
          <Volume2 className="h-4 w-4" /> Say it
        </button>
        <button type="button" className="flex-1 rounded-xl border-2 py-3 text-sm font-bold" onClick={savePhrase}>
          Save for parent
        </button>
      </div>
      {saved ? <p className="mt-2 text-center text-xs font-bold text-green-700">Sent for parent review.</p> : null}

      <h2 className="mt-6 text-sm font-extrabold uppercase text-[var(--ms-muted)]">Starters</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            className="rounded-full bg-[var(--ms-accent-soft)] px-3 py-1.5 text-xs font-bold"
            onClick={() => setSentence((prev) => (prev ? `${prev} ${s}` : s))}
          >
            {s}
          </button>
        ))}
      </div>

      {Object.entries(WORDS).map(([starter, words]) =>
        sentence.startsWith(starter) ? (
          <div key={starter}>
            <h2 className="mt-4 text-sm font-extrabold">Next word</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {words.map((w) => (
                <button
                  key={w}
                  type="button"
                  className="rounded-full border-2 px-3 py-1.5 text-xs font-bold"
                  onClick={() => setSentence(`${starter} ${w}`)}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        ) : null
      )}

      <h2 className="mt-6 text-sm font-extrabold uppercase text-[var(--ms-muted)]">My cards</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {cards.map((c, i) => (
          <button
            key={i}
            type="button"
            className="rounded-xl bg-[var(--ms-card)] px-3 py-2 text-xs font-bold shadow-sm"
            onClick={() => setSentence(c.phrase)}
          >
            {c.phrase}
          </button>
        ))}
      </div>

      <button type="button" className="mt-4 w-full text-sm font-bold text-[var(--ms-muted)]" onClick={() => setSentence("")}>
        Clear
      </button>
    </div>
  );
}
