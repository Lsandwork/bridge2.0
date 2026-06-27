"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, RefreshCw, ShieldCheck, Sparkles, Trophy, Zap } from "lucide-react";

type FanGearItem = {
  id: string;
  name: string;
  itemType: string;
  theme: string | null;
  unlockLevel: number;
  unlockRule: Record<string, unknown>;
  assetConfig: Record<string, unknown>;
  isActive: boolean;
};

type Collection = {
  slug: string;
  name: string;
  tagline: string;
  rarity: string;
  background: string;
  itemIds: string[];
};

type SportsPartner = {
  slug: string;
  name: string;
  partnerType: string;
  licensingStatus: string;
  brandColors: { primary: string; accent: string };
  isActive: boolean;
};

type PetState = {
  pet: {
    id: string;
    name: string;
    xp: number;
    level: number;
    growthStage: string;
    mood: string;
    activeOutfit: Record<string, string>;
  } | null;
  inventory: Array<{ itemId: string }>;
  items: FanGearItem[];
};

type ApiPayload = {
  state: PetState;
  partners: SportsPartner[];
  collections: Collection[];
  items: FanGearItem[];
  licensingNotice: string;
};

const categories = [
  ["headwear", "Headwear"],
  ["facewear", "Facewear"],
  ["outerwear", "Outerwear"],
  ["backpack", "Packs & utility"],
  ["footwear", "Footwear"],
  ["effects", "Effects & auras"],
  ["badges", "Badges & charms"],
];

function assetUrl(item: FanGearItem) {
  const png = item.assetConfig?.png;
  return typeof png === "string" ? png : "";
}

function slotForItem(item: FanGearItem) {
  const slot = item.assetConfig?.slot;
  return typeof slot === "string" ? slot : item.itemType;
}

function rarityForItem(item: FanGearItem) {
  const rarity = item.assetConfig?.rarity ?? item.unlockRule?.rarity;
  return typeof rarity === "string" ? rarity : "common";
}

function requiredXp(item: FanGearItem) {
  return typeof item.unlockRule?.xp === "number" ? item.unlockRule.xp : item.unlockLevel * 75;
}

function isItemUnlocked(item: FanGearItem, state: PetState | null) {
  if (!state?.pet) return item.unlockLevel <= 1;
  const unlocked = new Set(state.inventory.map((row) => row.itemId));
  return unlocked.has(item.id) || state.pet.level >= item.unlockLevel || state.pet.xp >= requiredXp(item);
}

function activeCategory(item: FanGearItem) {
  const category = item.assetConfig?.category;
  return typeof category === "string" ? category : item.itemType;
}

export function FanGearClient({
  fallbackItems,
  fallbackCollections,
}: {
  fallbackItems: FanGearItem[];
  fallbackCollections: Collection[];
}) {
  const router = useRouter();
  const [payload, setPayload] = useState<ApiPayload | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("headwear");
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [signedOut, setSignedOut] = useState(false);

  const items = payload?.items?.length ? payload.items : fallbackItems;
  const collections = payload?.collections?.length ? payload.collections : fallbackCollections;
  const state = payload?.state ?? null;
  const activeOutfit = state?.pet?.activeOutfit ?? {};

  const grouped = useMemo(() => {
    return categories.map(([key, label]) => ({
      key,
      label,
      items: items.filter((item) => activeCategory(item) === key),
    }));
  }, [items]);

  async function load() {
    const response = await fetch("/api/pets/fan-gear", { cache: "no-store" });
    if (response.status === 401) {
      setSignedOut(true);
      return;
    }
    if (!response.ok) {
      setStatus("Fan gear could not sync yet. Local catalog is still available.");
      return;
    }
    setSignedOut(false);
    setPayload(await response.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  async function syncUnlocks() {
    setStatus("Syncing unlocks…");
    const response = await fetch("/api/pets/fan-gear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync-unlocks" }),
    });
    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent("/bridge-pets/accessories")}`);
      return;
    }
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Could not sync unlocks.");
      return;
    }
    setPayload((prev) => ({ ...(prev as ApiPayload), state: data.state, items: data.items ?? prev?.items ?? fallbackItems }));
    setStatus("Unlocks synced from real companion progress.");
  }

  async function equip(item: FanGearItem) {
    if (!state?.pet) {
      router.push(`/login?next=${encodeURIComponent("/bridge-pets/accessories")}`);
      return;
    }
    setBusyItem(item.id);
    setStatus("");
    try {
      const response = await fetch("/api/pets/fan-gear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "equip", itemId: item.id }),
      });
      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent("/bridge-pets/accessories")}`);
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error ?? "Could not equip that item yet.");
        return;
      }
      setPayload((prev) => ({ ...(prev as ApiPayload), state: data.state }));
      setStatus(`${item.name} equipped to ${slotForItem(item)}.`);
    } finally {
      setBusyItem(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/bridge-pets" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-violet-100 hover:bg-white/10">
            ← Bridge PETS
          </Link>
          <Link href="/bridge-pets/sports-partnerships" className="rounded-full border border-yellow-300/30 bg-yellow-300/10 px-4 py-2 text-yellow-100 hover:bg-yellow-300/20">
            Sports partnerships →
          </Link>
        </nav>

        <header className="relative overflow-hidden rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,.28),transparent_30%),linear-gradient(135deg,#070b1a,#0b1024_55%,#12071f)] p-5 shadow-2xl shadow-violet-950/40 sm:p-8">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />
          <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">Bridge PETS · accessories</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
                Fan Gear <span className="text-violet-300">Collection</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
                Original style drops for companions that grow with you. Unlock gear through routines, goals, calm resets, focus work, and healthy Bridge engagement.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void syncUnlocks()}
                  className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-900/40 hover:bg-violet-400"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sync real unlocks
                </button>
                <Link href="/bridge-pets/sports-partnerships" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
                  <Trophy className="h-4 w-4" />
                  Partnership hub
                </Link>
              </div>
              {status ? <p className="mt-4 rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-sm text-violet-100">{status}</p> : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-violet-500/20 p-3 text-violet-200">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-black">Safe by design</h2>
                  <p className="mt-1 text-sm text-slate-300">
                    {payload?.licensingNotice ??
                      "Bridge Pets fan gear uses original Bridge-owned placeholder assets. Official sports marks require written license approval before use."}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-300">
                <div className="rounded-2xl bg-white/5 p-3"><span className="block text-lg text-yellow-300">{state?.pet?.xp ?? 0}</span>XP</div>
                <div className="rounded-2xl bg-white/5 p-3"><span className="block text-lg text-violet-300">{state?.pet?.level ?? 1}</span>Level</div>
                <div className="rounded-2xl bg-white/5 p-3"><span className="block text-lg text-cyan-300">{state?.inventory?.length ?? 0}</span>Owned</div>
              </div>
              {signedOut ? (
                <Link href={`/login?next=${encodeURIComponent("/bridge-pets/accessories")}`} className="mt-4 block rounded-2xl bg-yellow-300 px-4 py-3 text-center text-sm font-black text-slate-950">
                  Sign in to equip gear
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {grouped.map((group) => (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setSelectedCategory(group.key)}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide transition ${
                    selectedCategory === group.key ? "bg-violet-400 text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {group.label} · {group.items.length}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.filter((item) => activeCategory(item) === selectedCategory).map((item) => {
                const unlocked = isItemUnlocked(item, state);
                const slot = slotForItem(item);
                const equipped = activeOutfit[slot] === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={busyItem === item.id}
                    onClick={() => void equip(item)}
                    className={`group min-h-40 rounded-3xl border p-4 text-left transition ${
                      equipped
                        ? "border-yellow-300/70 bg-yellow-300/10 shadow-lg shadow-yellow-950/30"
                        : "border-white/10 bg-slate-950/70 hover:border-violet-300/50 hover:bg-violet-950/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                        {assetUrl(item) ? (
                          <Image
                            src={assetUrl(item)}
                            alt=""
                            width={64}
                            height={64}
                            className="h-16 w-16 object-contain drop-shadow-[0_0_14px_rgba(168,85,247,.4)]"
                          />
                        ) : <Sparkles className="h-8 w-8 text-violet-200" />}
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${unlocked ? "bg-emerald-400/15 text-emerald-200" : "bg-slate-700 text-slate-300"}`}>
                        {equipped ? "Equipped" : unlocked ? "Unlocked" : `Lv ${item.unlockLevel}`}
                      </span>
                    </div>
                    <h3 className="mt-3 font-black text-white">{item.name}</h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-violet-200">{rarityForItem(item)} · {slot}</p>
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      {unlocked ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <Lock className="h-3.5 w-3.5" />}
                      {unlocked ? "Ready to equip" : `${requiredXp(item)} XP unlock`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.75rem] border border-violet-300/20 bg-violet-500/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-200">Style drops</p>
              <div className="mt-4 grid gap-3">
                {collections.map((collection) => (
                  <article key={collection.slug} className="overflow-hidden rounded-3xl border border-white/10 bg-black/35">
                    <div className="min-h-28 bg-cover bg-center p-4" style={{ backgroundImage: `linear-gradient(90deg,rgba(3,7,18,.88),rgba(3,7,18,.35)),url(${collection.background})` }}>
                      <div className="max-w-xs">
                        <h3 className="text-xl font-black text-white">{collection.name}</h3>
                        <p className="text-sm text-slate-300">{collection.tagline}</p>
                        <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase text-yellow-200">{collection.rarity}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto p-3">
                      {collection.itemIds.map((id) => {
                        const item = items.find((row) => row.id === id);
                        return item ? (
                          <div key={id} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                            <Image src={assetUrl(item)} alt={item.name} width={40} height={40} className="h-10 w-10 object-contain" />
                          </div>
                        ) : null;
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-yellow-300/20 bg-yellow-300/10 p-5">
              <div className="flex items-start gap-3">
                <Zap className="mt-1 h-5 w-5 text-yellow-200" />
                <div>
                  <h2 className="font-black text-yellow-100">Built for real progress</h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Fan gear unlocks are tied to Bridge engagement — not fake demo stats. New users start clean; demo users can live under @demo.com accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
