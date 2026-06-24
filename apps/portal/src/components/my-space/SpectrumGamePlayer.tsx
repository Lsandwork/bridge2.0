"use client";

import { renderPremiumGame } from "./PremiumGames";

type Props = {
  gameId: string;
  onComplete: () => void;
  onLogCheckIn?: (type: "emotion" | "sensory", value: string) => void;
  lowStimulation?: boolean;
};

export function SpectrumGamePlayer({ gameId, onComplete, onLogCheckIn, lowStimulation }: Props) {
  const game = renderPremiumGame(gameId, { onComplete, onLogCheckIn, lowStimulation });
  if (game) return game;
  return <p className="pg-not-found">Game not found.</p>;
}
