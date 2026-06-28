"use client";

import { useMemo, useState } from "react";
import { Palette, Sparkles } from "lucide-react";
import { nuvioPetLineup } from "@/lib/pets/nuvioPetCatalog";
import { petPersonalities } from "@/lib/pets/petConfig";
import { PetSprite } from "./PetSprite";

const supportStyles = ["gentle prompts", "quiet presence", "coach-like steps", "celebration first"];
const favoriteActivities = ["routines", "calm breaks", "communication", "goals", "creative play"];
const colorThemes = ["purple glow", "calm blue", "forest green", "sunrise gold", "soft rainbow"];
const bodyTypes = ["round buddy", "tiny guide", "steady helper", "cloud friend"];
type PetSetupInput = { name: string; species: string; personality: string; settings?: Record<string, unknown> };

export function PetSetupWizard({
  onCreate,
  onSkip,
  compact = false,
}: {
  onCreate: (input: PetSetupInput) => Promise<void>;
  onSkip: () => void;
  compact?: boolean;
}) {
  const [name, setName] = useState("Spark");
  const [species, setSpecies] = useState(nuvioPetLineup[0]?.slug ?? "spark");
  const [personality, setPersonality] = useState("gentle");
  const [customMode, setCustomMode] = useState(false);
  const [supportStyle, setSupportStyle] = useState(supportStyles[0]);
  const [favoriteActivity, setFavoriteActivity] = useState(favoriteActivities[0]);
  const [colorTheme, setColorTheme] = useState(colorThemes[0]);
  const [bodyType, setBodyType] = useState(bodyTypes[0]);
  const [busy, setBusy] = useState(false);
  const selected = useMemo(() => nuvioPetLineup.find((pet) => pet.slug === species) ?? nuvioPetLineup[0], [species]);

  async function createSurprise() {
    const randomPet = nuvioPetLineup[Math.floor(Math.random() * nuvioPetLineup.length)] ?? nuvioPetLineup[0];
    const randomPersonality = petPersonalities[Math.floor(Math.random() * petPersonalities.length)] ?? "gentle";
    setSpecies(randomPet.slug);
    setPersonality(randomPersonality);
    await create({ name: name || randomPet.name, species: randomPet.slug, personality: randomPersonality });
  }

  async function create(input: PetSetupInput = {
    name,
    species,
    personality,
    settings: {
      customPet: customMode,
      supportStyle,
      favoriteActivity,
      colorTheme,
      bodyType,
    },
  }) {
    setBusy(true);
    try {
      await onCreate(input);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`pet-setup ${compact ? "pet-setup--compact" : ""}`} role="dialog" aria-label="Choose your Nuvio companion">
      <div className="pet-setup__hero">
        <PetSprite species={selected?.slug} mood="happy" size="md" />
        <div>
          <p className="pet-kicker">Nuvio Companion Pets</p>
          <h2>Choose your companion</h2>
          <p>A gentle in-app buddy for routines, calm moments, goals, and tiny wins.</p>
        </div>
      </div>

      <label>
        Companion name
        <input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} />
      </label>

      <div className="pet-setup__grid" aria-label="Pet options">
        {nuvioPetLineup.map((pet) => (
          <button
            key={pet.slug}
            type="button"
            className={pet.slug === species ? "is-selected" : ""}
            onClick={() => setSpecies(pet.slug)}
          >
            <PetSprite species={pet.slug} mood="idle" size="sm" />
            {pet.name}
          </button>
        ))}
      </div>

      <label>
        Support personality
        <select value={personality} onChange={(event) => setPersonality(event.target.value)}>
          {petPersonalities.map((item) => (
            <option key={item} value={item}>
              {item.replace(/\b\w/g, (char) => char.toUpperCase())}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className={`pet-custom-toggle ${customMode ? "is-selected" : ""}`}
        onClick={() => setCustomMode((value) => !value)}
      >
        <Palette className="h-4 w-4" />
        Create custom pet
        <span>{customMode ? "Custom questions open" : "Optional"}</span>
      </button>

      {customMode ? (
        <div className="pet-custom-grid" aria-label="Custom pet options">
          <label>
            Support style
            <select value={supportStyle} onChange={(event) => setSupportStyle(event.target.value)}>
              {supportStyles.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Favorite activity
            <select value={favoriteActivity} onChange={(event) => setFavoriteActivity(event.target.value)}>
              {favoriteActivities.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Color theme
            <select value={colorTheme} onChange={(event) => setColorTheme(event.target.value)}>
              {colorThemes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Body type
            <select value={bodyType} onChange={(event) => setBodyType(event.target.value)}>
              {bodyTypes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
      ) : null}

      <div className="pet-setup__actions">
        <button type="button" className="pet-btn pet-btn--primary" disabled={busy} onClick={() => void create()}>
          Create companion
        </button>
        <button type="button" className="pet-btn" disabled={busy} onClick={() => void createSurprise()}>
          <Sparkles className="h-4 w-4" /> Hatch surprise
        </button>
        <button type="button" className="pet-btn pet-btn--ghost" onClick={onSkip}>
          Skip, I’ll set up later
        </button>
      </div>
    </div>
  );
}
