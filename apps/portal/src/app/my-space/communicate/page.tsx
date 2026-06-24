"use client";

import { useCallback, useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { localeSpeechCodes } from "@family-support/core";
import { useLanguage } from "@/components/LanguageProvider";
import { useProfile } from "@/components/ProfileProvider";

type Card = { id: string; category: string; phrase: string; childProfileId: string };

export default function MySpaceCommunicatePage() {
  const { activeProfile } = useProfile();
  const { t, tPhrase, tCategory, locale } = useLanguage();
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [sentence, setSentence] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeProfile) return;
    setLoading(true);
    fetch(`/api/communication?profileId=${activeProfile.id}`)
      .then((r) => r.json())
      .then((data) => {
        setCards(Array.isArray(data.cards) ? data.cards : []);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      })
      .finally(() => setLoading(false));
  }, [activeProfile]);

  const speakText = useCallback(
    (text: string) => {
      if (typeof window !== "undefined" && "speechSynthesis" in window && text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = localeSpeechCodes[locale];
        window.speechSynthesis.speak(utterance);
      }
    },
    [locale]
  );

  const tap = useCallback(
    async (card: Card) => {
      const localized = tPhrase(card.phrase);
      setSentence((prev) => [...prev, localized]);
      await fetch("/api/bridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "use-card", cardId: card.id }),
      });
      speakText(localized);
    },
    [speakText, tPhrase]
  );

  const speak = () => {
    speakText(sentence.join(" "));
  };

  if (!activeProfile) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <p className="font-bold">{t("myspace.pickProfile")}</p>
      </main>
    );
  }

  const shown = filter ? cards.filter((c) => c.category === filter) : cards;
  const usedCategories = categories.filter((c) => cards.some((card) => card.category === c));

  return (
    <main className="ms-page ms-page-pad-talk mx-auto max-w-lg px-4 py-4">
      <div className="talk-filters">
        <button
          type="button"
          className={`talk-filter-pill ${!filter ? "active" : ""}`}
          onClick={() => setFilter(null)}
        >
          {t("talk.all")}
        </button>
        {usedCategories.map((c) => (
          <button
            key={c}
            type="button"
            className={`talk-filter-pill ${filter === c ? "active" : ""}`}
            onClick={() => setFilter(c)}
          >
            {tCategory(c)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm font-bold text-[var(--ms-muted)]">{t("common.loading")}</p>
      ) : shown.length === 0 ? (
        <p className="ms-card mt-6 p-6 text-center text-sm font-bold text-[var(--ms-muted)]">{t("talk.noCards")}</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {shown.map((card) => (
            <button
              key={card.id}
              type="button"
              className="talk-card"
              data-category={card.category}
              onClick={() => tap(card)}
            >
              {tPhrase(card.phrase)}
            </button>
          ))}
        </div>
      )}

      <section className="talk-sentence-bar ms-card fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-lg rounded-b-none p-4 md:max-w-md">
        <p className="text-xs font-bold text-[var(--ms-muted)]">{t("talk.mySentence")}</p>
        <p className="mt-1 min-h-[1.25rem] text-sm font-bold">{sentence.join(" → ") || t("talk.tapHint")}</p>
        <div className="mt-2 flex gap-2">
          <button type="button" className="ms-btn flex-1 border-2 text-sm" onClick={() => setSentence([])}>
            {t("talk.clear")}
          </button>
          <button
            type="button"
            className="ms-btn ms-btn-primary flex flex-1 items-center justify-center gap-1 text-sm"
            onClick={speak}
            disabled={!sentence.length}
          >
            <Volume2 className="h-4 w-4" /> {t("talk.speak")}
          </button>
        </div>
      </section>
    </main>
  );
}
