"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { starterPets, petPersonalities } from "@/lib/pets/petConfig";
import { PetSprite } from "./PetSprite";

export function PetSetupWizard({
  onCreate,
  onSkip,
  compact = false,
}: {
  onCreate: (input: { name: string; species: string; personality: string }) => Promise<void>;
  onSkip: () => void;
  compact?: boolean;
}) {
  const [name, setName] = useState("Nuvio Buddy");
  const [species, setSpecies] = useState(starterPets[0].id);
  const [personality, setPersonality] = useState("gentle");
  const [busy, setBusy] = useState(false);
  const selected = useMemo(() => starterPets.find((pet) => pet.id === species) ?? starterPets[0], [species]);

  async function createSurprise() {
    const randomPet = starterPets[Math.floor(Math.random() * starterPets.length)] ?? starterPets[0];
    const randomPersonality = petPersonalities[Math.floor(Math.random() * petPersonalities.length)] ?? "gentle";
    setSpecies(randomPet.id);
    setPersonality(randomPersonality);
    await create({ name: name || randomPet.name, species: randomPet.id, personality: randomPersonality });
  }

  async function create(input = { name, species, personality }) {
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
        <PetSprite species={selected.id} mood="happy" size="md" />
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
        {starterPets.map((pet) => (
          <button
            key={pet.id}
            type="button"
            className={pet.id === species ? "is-selected" : ""}
            onClick={() => setSpecies(pet.id)}
          >
            <span>{pet.emoji}</span>
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
