"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { bridgePetProfiles } from "@/features/bridge-pets/petAssetManifest";

type AdminPet = {
  slug: string;
  name: string;
  description: string;
  audienceTags: string[];
  supportTags: string[];
  personalityTraits: string[];
  primaryColor: string;
  accentColor: string;
  assetBasePath: string;
  isActive: boolean;
  selectedUsers?: number;
};

type Props = {
  data: {
    source: string;
    pets: AdminPet[];
    activity?: Array<{ activity_type?: string; xp_awarded?: number; created_at?: string }>;
  };
};

function splitCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function AdminBridgePetsClient({ data }: Props) {
  const [pets, setPets] = useState(data.pets);
  const [saving, setSaving] = useState<string | null>(null);
  const profileBySlug = useMemo(() => new Map(bridgePetProfiles.map((pet) => [pet.slug, pet])), []);

  const stats = {
    active: pets.filter((pet) => pet.isActive).length,
    users: pets.reduce((sum, pet) => sum + (pet.selectedUsers ?? 0), 0),
    missingSprites: bridgePetProfiles.filter((pet) => !pet.spriteImage).length,
    recentEvents: data.activity?.length ?? 0,
  };

  async function toggle(slug: string, isActive: boolean) {
    setSaving(slug);
    const res = await fetch("/api/bridge-pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "toggle-active", slug, isActive }),
    });
    if (res.ok) {
      setPets((rows) => rows.map((pet) => (pet.slug === slug ? { ...pet, isActive } : pet)));
    }
    setSaving(null);
  }

  async function save(pet: AdminPet) {
    setSaving(pet.slug);
    await fetch("/api/bridge-pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action: "update-catalog",
        slug: pet.slug,
        description: pet.description,
        audienceTags: pet.audienceTags,
        supportTags: pet.supportTags,
        personalityTraits: pet.personalityTraits,
        primaryColor: pet.primaryColor,
        accentColor: pet.accentColor,
      }),
    });
    setSaving(null);
  }

  function patch(slug: string, patchPet: Partial<AdminPet>) {
    setPets((rows) => rows.map((pet) => (pet.slug === slug ? { ...pet, ...patchPet } : pet)));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Active pets", stats.active],
          ["Selected users", stats.users],
          ["Missing sprite crops", stats.missingSprites],
          ["Recent events", stats.recentEvents],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 text-sm text-violet-950">
        <p className="font-bold">Production note</p>
        <p className="mt-1">
          Source: {data.source}. Board PNGs and PSDs are preserved as source/reference. PSD files are not loaded in the
          browser. Missing sprite warnings do not break the UI; the app uses graceful animated fallbacks.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {pets.map((pet) => {
          const profile = profileBySlug.get(pet.slug);
          const hasSprite = Boolean(profile?.spriteImage);
          return (
            <article key={pet.slug} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                  {profile?.spriteImage ? (
                    <Image src={profile.spriteImage} alt={`${pet.name} sprite`} fill sizes="96px" className="object-contain p-2" />
                  ) : profile?.boardImage ? (
                    <Image src={profile.boardImage} alt={`${pet.name} asset board`} fill sizes="96px" className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black">{pet.name}</h2>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{pet.slug}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(pet.slug, !pet.isActive)}
                      disabled={saving === pet.slug}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                        pet.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {pet.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {pet.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{pet.selectedUsers ?? 0} selected users</p>
                  <p className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${hasSprite ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {hasSprite ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {hasSprite ? "Sprite crop available" : "Using fallback / board art"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Descriptor
                  <textarea
                    className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm normal-case tracking-normal text-slate-900"
                    value={pet.description}
                    onChange={(e) => patch(pet.slug, { description: e.target.value })}
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Audience tags
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm normal-case tracking-normal text-slate-900"
                    value={pet.audienceTags.join(", ")}
                    onChange={(e) => patch(pet.slug, { audienceTags: splitCsv(e.target.value) })}
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Support tags
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm normal-case tracking-normal text-slate-900"
                    value={pet.supportTags.join(", ")}
                    onChange={(e) => patch(pet.slug, { supportTags: splitCsv(e.target.value) })}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => save(pet)}
                  disabled={saving === pet.slug}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  <Save className="h-4 w-4" /> {saving === pet.slug ? "Saving..." : "Save pet"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
