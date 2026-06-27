"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Palette, Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { BridgePetSprite } from "./BridgePetSprite";
import type { BridgePetProfile } from "@/features/bridge-pets/petAssetManifest";

export function BridgePetDetailClient({ pet }: { pet: BridgePetProfile }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [selected, setSelected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    fetch("/api/bridge-pets?section=selected", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSelected(data?.selected?.petSlug === pet.slug))
      .catch(() => undefined);
  }, [loading, user, pet.slug]);

  useEffect(() => {
    if (loading || !user || searchParams.get("select") !== "1") return;
    const pending = window.localStorage.getItem("bridge.pendingPet");
    if (pending === pet.slug) void choosePet(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, searchParams, pet.slug]);

  async function choosePet(fromPending = false) {
    setMessage(null);
    if (!user) {
      window.localStorage.setItem("bridge.pendingPet", pet.slug);
      router.push(`/login?next=${encodeURIComponent(`/bridge-pets/${pet.slug}?select=1`)}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/bridge-pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ action: "select", slug: pet.slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not choose this companion.");
      window.localStorage.removeItem("bridge.pendingPet");
      setSelected(true);
      setMessage(`${data.selected.petName} is selected. Progress starts at zero and grows from real check-ins and routines.`);
      if (fromPending) router.replace(`/bridge-pets/${pet.slug}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not choose this companion.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bridge-pets-root">
      <Link href="/bridge-pets" className="bridge-pets-back">
        <ArrowLeft className="h-4 w-4" /> Back to lineup
      </Link>

      <section className="bridge-pet-detail-hero" style={{ "--pet-primary": pet.primaryColor, "--pet-accent": pet.accentColor } as React.CSSProperties}>
        <div>
          <p className="bridge-pets-brand">Bridge <span>PETS</span></p>
          <h1>{pet.name}</h1>
          <p className="bridge-pet-detail-tagline">{pet.descriptor}</p>
          <p>{pet.about}</p>
          <div className="bridge-pets-icon-row">
            {[...pet.audienceTags, ...pet.supportTags].slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <button
            type="button"
            className="bridge-pets-primary-action"
            onClick={() => choosePet(false)}
            disabled={busy}
          >
            {selected ? "Chosen companion" : busy ? "Choosing..." : "Choose this companion"}
          </button>
          {message ? <p className="bridge-pets-status-message">{message}</p> : null}
        </div>
        <div className="bridge-pet-detail-stage">
          <BridgePetSprite pet={pet} size="xl" interactive mood={selected ? "happy" : "encouraging"} />
        </div>
      </section>

      <section className="bridge-pet-detail-grid">
        <DetailPanel title="Core poses" items={pet.poses} pet={pet} />
        <DetailPanel title="Growth stages" items={["Baby", "Child", "Teen", "Adult"]} pet={pet} />
        <DetailPanel title="Outfit variants" items={pet.outfits} pet={pet} />
        <DetailPanel title="Expressions" items={pet.expressions} pet={pet} />
      </section>

      <section className="bridge-pet-detail-assets">
        <article>
          <h2><Sparkles className="h-5 w-5" /> Accessories and icons</h2>
          <div className="bridge-pet-detail-icons">
            {[...pet.iconImages, ...pet.badgeImages].map((asset) => (
              <Image key={asset} src={asset} alt={`${pet.name} support icon`} width={48} height={48} />
            ))}
          </div>
        </article>
        <article>
          <h2><Palette className="h-5 w-5" /> Color palette</h2>
          <div className="bridge-pet-palette">
            {pet.palette.map((color) => <span key={color} style={{ backgroundColor: color }} title={color} />)}
          </div>
        </article>
      </section>

      {pet.boardImage ? (
        <section className="bridge-pet-board-preview">
          <div className="bridge-pets-section-head">
            <div>
              <p className="bridge-pets-kicker">Source board</p>
              <h2>Design reference preserved from the asset pack.</h2>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-300" />
          </div>
          <Image src={pet.boardImage} alt={`${pet.name} Bridge PETS asset board`} width={1600} height={1000} />
        </section>
      ) : null}
    </main>
  );
}

function DetailPanel({ title, items, pet }: { title: string; items: string[]; pet: BridgePetProfile }) {
  return (
    <article className="bridge-pet-detail-panel">
      <h2>{title}</h2>
      <div>
        {items.map((item) => (
          <span key={item}>
            <BridgePetSprite pet={pet} size="sm" />
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}
