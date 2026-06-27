"use client";

import type { CompanionPet } from "./CompanionPetProvider";

export function PetSettings({
  pet,
  onChange,
}: {
  pet: CompanionPet;
  onChange: (settings: CompanionPet["settings"]) => void;
}) {
  const settings = pet.settings;

  function update<K extends keyof CompanionPet["settings"]>(key: K, value: CompanionPet["settings"][K]) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <div className="pet-settings">
      <div className="pet-panel__section-title">
        <span>Comfort settings</span>
        <small>Sensory-safe by default. No shame. No punishment.</small>
      </div>
      <label>
        Motion level
        <select value={settings.motionLevel} onChange={(event) => update("motionLevel", event.target.value as never)}>
          <option value="off">Off</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
        </select>
      </label>
      <label>
        Bubble frequency
        <select value={settings.bubbleFrequency} onChange={(event) => update("bubbleFrequency", event.target.value as never)}>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </label>
      <label className="pet-toggle">
        <input type="checkbox" checked={settings.quietMode} onChange={(event) => update("quietMode", event.target.checked)} />
        Quiet mode
      </label>
      <label className="pet-toggle">
        <input type="checkbox" checked={settings.largerButtons} onChange={(event) => update("largerButtons", event.target.checked)} />
        Larger buttons
      </label>
      <label className="pet-toggle">
        <input type="checkbox" checked={settings.highContrast} onChange={(event) => update("highContrast", event.target.checked)} />
        Higher contrast
      </label>
      <label className="pet-toggle">
        <input type="checkbox" checked={settings.disabled ?? false} onChange={(event) => update("disabled", event.target.checked)} />
        Hide companion
      </label>
    </div>
  );
}
