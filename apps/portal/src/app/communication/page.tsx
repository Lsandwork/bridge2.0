"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCommunicationCategories } from "@family-support/data";
import { Search, Volume2 } from "lucide-react";
import { EmptyBlock, LoadingBlock } from "@/components/StateBlock";
import { useLanguage } from "@/components/LanguageProvider";

type Card = { id: string; category: string; phrase: string; isFavorite: boolean; childProfileId: string };

const CATEGORY_CLASS: Record<string, string> = {
  Food: "aac-food",
  Bathroom: "aac-bathroom",
  Feelings: "aac-feelings",
  Help: "aac-help",
  People: "aac-people",
  Places: "aac-places",
  Activities: "aac-activities",
};

function aacClass(category: string) {
  return CATEGORY_CLASS[category] ?? "aac-default";
}

export default function CommunicationPage() {
  const { t, tCategory } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sentence, setSentence] = useState<string[]>([]);
  const [form, setForm] = useState({ phrase: "", category: "Help", childProfileId: "cp1" });

  useEffect(() => {
    Promise.all([
      getCommunicationCategories(),
      fetch("/api/communication").then((r) => r.json()),
    ]).then(([cats, cardList]) => {
      setCategories(cats);
      setCards(Array.isArray(cardList) ? cardList : []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      if (activeCategory && c.category !== activeCategory) return false;
      if (search && !c.phrase.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [cards, activeCategory, search]);

  const tapCard = useCallback(async (card: Card) => {
    setSentence((prev) => [...prev, card.phrase]);
    await fetch("/api/bridge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "use-card", cardId: card.id }),
    });
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(card.phrase));
    }
  }, []);

  const speakSentence = () => {
    const text = sentence.join(" ");
    if (text && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  const addCard = async () => {
    if (!form.phrase.trim()) return;
    const res = await fetch("/api/communication", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isFavorite: false }),
    });
    const data = await res.json();
    if (res.ok) {
      setCards((prev) => [...prev, data]);
      setForm((f) => ({ ...f, phrase: "" }));
    }
  };

  if (loading) return <LoadingBlock label={t("parent.communication.loading")} />;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-extrabold">{t("parent.communication.title")}</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {t("parent.communication.subtitle")}
      </p>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          className="w-full rounded-xl border py-3 pl-10 pr-4"
          placeholder={t("parent.communication.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${!activeCategory ? "bg-[var(--brand)] text-white" : "border"}`}
          onClick={() => setActiveCategory(null)}
        >
          {t("talk.all")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${activeCategory === cat ? "bg-[var(--brand)] text-white" : aacClass(cat)}`}
            onClick={() => setActiveCategory(cat)}
          >
            {tCategory(cat)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyBlock message={t("parent.communication.empty")} />
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((card) => (
            <button
              key={card.id}
              type="button"
              className={`flex min-h-[88px] flex-col items-center justify-center rounded-2xl p-4 text-center font-bold transition hover:scale-[1.02] ${aacClass(card.category)}`}
              onClick={() => tapCard(card)}
            >
              <span className="text-sm leading-snug">{card.phrase}</span>
              {card.isFavorite ? <span className="mt-1 text-[10px]">★</span> : null}
            </button>
          ))}
        </div>
      )}

      <section className="card mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-[var(--text-tertiary)]">{t("parent.communication.sentence")}</p>
            <p className="mt-1 min-h-[1.5rem] text-lg font-semibold">
              {sentence.length ? sentence.join(" → ") : t("talk.tapHint")}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary px-3 py-2 text-sm" onClick={() => setSentence([])}>
              {t("parent.communication.clear")}
            </button>
            <button type="button" className="btn-primary flex items-center gap-2 px-4 py-2 text-sm" onClick={speakSentence} disabled={!sentence.length}>
              <Volume2 className="h-4 w-4" /> {t("parent.communication.speak")}
            </button>
          </div>
        </div>
      </section>

      <section className="card mt-4 p-5">
        <h3 className="font-bold">{t("parent.communication.addCard")}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input className="rounded-xl border px-3 py-2 md:col-span-2" placeholder={t("parent.communication.phrase")} value={form.phrase} onChange={(e) => setForm((f) => ({ ...f, phrase: e.target.value }))} />
          <select className="rounded-xl border px-3 py-2" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {categories.map((c) => (
              <option key={c} value={c}>{tCategory(c)}</option>
            ))}
          </select>
          <button type="button" className="btn-primary py-2" onClick={addCard}>{t("parent.communication.addCard")}</button>
        </div>
      </section>
    </main>
  );
}
