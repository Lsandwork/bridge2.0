"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  drawCatcherBasket,
  drawGem,
  drawGlowStar,
  drawGroundLine,
  drawIridescentBubble,
  drawNebulaSky,
  drawParallaxStars,
  drawParticles,
  drawPlantStage,
  drawShip,
  drawSkyGradient,
  spawnBurst,
  updateParticles,
  type Particle,
} from "./game-engine/draw";
import {
  GameCanvasLayer,
  GameControlBtn,
  GameControls,
  GameHud,
  GameStage,
  HelpPhraseCard,
  MemoryCard,
  MoodOrb,
  PetStage,
  PremiumCardGrid,
  PremiumTile,
  RhythmPadGrid,
  ShapeToken,
  SortBin,
  StoryChoice,
  StoryScene,
  TreasureBoard,
  VictoryScreen,
} from "./game-engine/GameShell";
import { useGameCanvas } from "./game-engine/useGameLoop";

type GameProps = {
  onComplete: () => void;
  onLogCheckIn?: (type: "emotion" | "sensory", value: string) => void;
  lowStimulation?: boolean;
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899"];
const SHAPES = ["Circle", "Square", "Triangle"] as const;

/* ─── Bubble Breathe ─── */
export function PremiumBubbleBreathe({ onComplete, lowStimulation }: GameProps) {
  const calm = lowStimulation;
  const target = calm ? 6 : 10;
  const [popped, setPopped] = useState(0);

  type Bubble = { id: number; x: number; y: number; r: number; speed: number; hue: number };
  const state = useRef<{ bubbles: Bubble[]; particles: Particle[]; spawnT: number; popped: number }>({
    bubbles: [],
    particles: [],
    spawnT: 0,
    popped: 0,
  });

  useEffect(() => {
    state.current.popped = popped;
  }, [popped]);

  const popBubble = useCallback((id: number, x: number, y: number, hue: number) => {
    const s = state.current;
    s.bubbles = s.bubbles.filter((b) => b.id !== id);
    spawnBurst(s.particles, x, y, calm ? 8 : 14, hue, calm ? 80 : 140);
    setPopped((p) => p + 1);
  }, [calm]);

  const canvasRef = useGameCanvas((ctx, w, h, dt, time) => {
    const s = state.current;
    drawSkyGradient(ctx, w, h, time);
    s.spawnT += dt;
    if (s.spawnT > (calm ? 2 : 1.2) && s.bubbles.length < 10) {
      s.spawnT = 0;
      s.bubbles.push({
        id: Date.now() + Math.random(),
        x: w * (0.12 + Math.random() * 0.76),
        y: h + 30,
        r: 22 + Math.random() * 28,
        speed: calm ? 28 : 42,
        hue: 180 + Math.random() * 80,
      });
    }
    s.bubbles = s.bubbles.filter((b) => {
      b.y -= b.speed * dt;
      drawIridescentBubble(ctx, b.x, b.y, b.r, time + b.id, b.hue);
      return b.y > -b.r;
    });
    updateParticles(s.particles, dt);
    drawParticles(ctx, s.particles);
  }, [calm]);

  const handleTap = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const s = state.current;
    for (const b of [...s.bubbles]) {
      if (Math.hypot(b.x - x, b.y - y) < b.r) {
        popBubble(b.id, b.x, b.y, b.hue);
        break;
      }
    }
  };

  if (popped >= target) {
    return <VictoryScreen emoji="🫧" title="Nice and calm" subtitle="Slow breaths, steady focus." onComplete={onComplete} />;
  }

  return (
    <GameStage
      className="pg-sky"
      hud={
        <GameHud label="Bubble Breathe" progress={`${popped} / ${target}`} sublabel="Tap bubbles · breathe slow" />
      }
    >
      <div className="pg-touch-layer" onPointerDown={handleTap}>
        <GameCanvasLayer canvasRef={canvasRef} />
      </div>
    </GameStage>
  );
}

/* ─── Color Sort ─── */
export function PremiumColorSort({ onComplete }: Pick<GameProps, "onComplete">) {
  const [items, setItems] = useState(() =>
    COLORS.flatMap((c, ci) =>
      SHAPES.map((shape, si) => ({ id: `${ci}-${si}`, color: c, shape, sorted: false }))
    ).sort(() => Math.random() - 0.5)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const remaining = items.filter((i) => !i.sorted).length;

  const sortItem = (bin: number) => {
    if (!selected) return;
    const item = items.find((i) => i.id === selected);
    if (!item || SHAPES[bin] !== item.shape) return;
    setItems((prev) => prev.map((i) => (i.id === selected ? { ...i, sorted: true } : i)));
    setSelected(null);
  };

  if (remaining === 0) {
    return <VictoryScreen emoji="🎨" title="All sorted!" subtitle="Perfect categorization." onComplete={onComplete} />;
  }

  return (
    <div className="pg-sort">
      <GameHud label="Color Sort" progress={`${items.length - remaining} / ${items.length}`} sublabel="Match shape to bin" />
      <div className="pg-sort-tray">
        {items
          .filter((i) => !i.sorted)
          .map((item) => (
            <ShapeToken
              key={item.id}
              shape={item.shape}
              color={item.color}
              selected={selected === item.id}
              onClick={() => setSelected(item.id)}
            />
          ))}
      </div>
      <div className="pg-sort-bins">
        {SHAPES.map((bin, i) => (
          <SortBin key={bin} label={bin} shape={bin} onClick={() => sortItem(i)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Mood Check ─── */
export function PremiumMoodCheck({ onComplete, onLogCheckIn }: GameProps) {
  const moods = [
    { emoji: "😊", label: "Happy", hue: 45 },
    { emoji: "😌", label: "Calm", hue: 160 },
    { emoji: "😟", label: "Worried", hue: 210 },
    { emoji: "😤", label: "Frustrated", hue: 0 },
    { emoji: "😴", label: "Tired", hue: 260 },
    { emoji: "🤔", label: "Unsure", hue: 280 },
  ];
  const [picked, setPicked] = useState<string | null>(null);

  if (picked) {
    const m = moods.find((x) => x.label === picked);
    return (
      <VictoryScreen
        emoji={m?.emoji}
        title={`You feel ${picked.toLowerCase()}`}
        subtitle="Saved to your check-in log."
        onComplete={() => {
          onLogCheckIn?.("emotion", picked);
          onComplete();
        }}
      />
    );
  }

  return (
    <div className="pg-mood">
      <GameHud label="Mood Check-In" sublabel="Pick what matches right now" />
      <PremiumCardGrid cols={2}>
        {moods.map((m) => (
          <MoodOrb key={m.label} emoji={m.emoji} label={m.label} hue={m.hue} onClick={() => setPicked(m.label)} />
        ))}
      </PremiumCardGrid>
    </div>
  );
}

/* ─── Pattern Match ─── */
export function PremiumPatternMatch({ onComplete, lowStimulation }: GameProps) {
  const slow = lowStimulation;
  const [sequence, setSequence] = useState<number[]>([]);
  const [input, setInput] = useState<number[]>([]);
  const [showing, setShowing] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<"watch" | "your-turn" | "win">("watch");
  const hues = [260, 160, 45, 330];

  const addRound = useCallback(() => {
    setSequence((s) => [...s, Math.floor(Math.random() * 4)]);
    setInput([]);
    setPhase("watch");
  }, []);

  useEffect(() => {
    if (round === 0 && sequence.length === 0) addRound();
  }, [round, sequence.length, addRound]);

  useEffect(() => {
    if (phase !== "watch" || sequence.length === 0) return;
    let i = 0;
    const delay = slow ? 900 : 600;
    const show = () => {
      if (i >= sequence.length) {
        setShowing(null);
        setPhase("your-turn");
        return;
      }
      setShowing(sequence[i]);
      i += 1;
      setTimeout(() => {
        setShowing(null);
        setTimeout(show, 200);
      }, delay);
    };
    const t = setTimeout(show, 500);
    return () => clearTimeout(t);
  }, [phase, sequence, slow]);

  const tap = (idx: number) => {
    if (phase !== "your-turn") return;
    const next = [...input, idx];
    setInput(next);
    if (sequence[next.length - 1] !== idx) {
      setSequence([]);
      setRound(0);
      setTimeout(addRound, 300);
      return;
    }
    if (next.length === sequence.length) {
      if (round >= 2) setPhase("win");
      else {
        setRound((r) => r + 1);
        setTimeout(addRound, 600);
      }
    }
  };

  if (phase === "win") {
    return <VictoryScreen emoji="✨" title="Pattern mastered!" subtitle="Memory and focus — excellent." onComplete={onComplete} />;
  }

  return (
    <div className="pg-pattern">
      <GameHud label="Pattern Match" progress={`Round ${round + 1}`} sublabel={phase === "watch" ? "Watch the sequence…" : "Your turn"} />
      <div className="pg-pattern-grid">
        {COLORS.map((c, i) => (
          <PremiumTile key={c} active={showing === i} hue={hues[i]} onClick={() => tap(i)} className="pg-pattern-pad">
            <span className="pg-pattern-core" style={{ background: `linear-gradient(135deg, ${c}, ${c}88)` }} />
          </PremiumTile>
        ))}
      </div>
    </div>
  );
}

/* ─── Focus Garden ─── */
export function PremiumFocusGarden({ onComplete, lowStimulation }: GameProps) {
  const [seconds, setSeconds] = useState(0);
  const [target, setTarget] = useState(lowStimulation ? 60 : 90);
  const [running, setRunning] = useState(false);
  const [pickedDuration, setPickedDuration] = useState(false);
  const stageRef = useRef(0);

  useEffect(() => {
    if (!running || seconds >= target) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running, seconds, target]);

  const stage = seconds >= target ? 3 : seconds >= target * 0.66 ? 2 : seconds >= target * 0.33 ? 1 : 0;
  stageRef.current = stage;

  const canvasRef = useGameCanvas((ctx, w, h, _dt, time) => {
    drawNebulaSky(ctx, w, h, time, true);
    drawPlantStage(ctx, w / 2, h * 0.62, stageRef.current, time, w);
  }, []);

  if (seconds >= target) {
    return <VictoryScreen emoji="🌳" title="Garden in bloom!" subtitle="You stayed focused the whole time." onComplete={onComplete} />;
  }

  if (!pickedDuration) {
    return (
      <div className="pg-focus-pick">
        <GameHud label="Focus Garden" sublabel="Choose your focus session" />
        <div className="pg-focus-durations">
          {[60, 120, 180].map((sec) => (
            <button
              key={sec}
              type="button"
              className="pg-focus-duration-btn"
              onClick={() => {
                setTarget(sec);
                setPickedDuration(true);
              }}
            >
              {sec / 60} min
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <GameStage
      className="pg-garden"
      hud={
        <GameHud
          label="Focus Garden"
          progress={`${seconds}s / ${target}s`}
          sublabel={running ? "Stay with your plant…" : "Ready when you are"}
        />
      }
    >
      <GameCanvasLayer canvasRef={canvasRef} />
      {!running ? (
        <button type="button" className="pg-focus-start" onClick={() => setRunning(true)}>
          Start focus time
        </button>
      ) : null}
    </GameStage>
  );
}

/* ─── Match Pairs ─── */
export function PremiumMatchPairs({ onComplete, lowStimulation }: GameProps) {
  const emojis = lowStimulation ? ["🌟", "🌙", "⭐"] : ["🌟", "🌙", "⭐", "🌈", "🦋", "🍀"];
  const deck = useMemo(() => [...emojis, ...emojis].sort(() => Math.random() - 0.5), [emojis]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  const flip = (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next;
      if (deck[a] === deck[b]) {
        setMatched((m) => [...m, a, b]);
        setFlipped([]);
      } else setTimeout(() => setFlipped([]), 700);
    }
  };

  if (matched.length === deck.length && deck.length > 0) {
    return <VictoryScreen emoji="🃏" title="All matched!" subtitle="Memory skills on point." onComplete={onComplete} />;
  }

  return (
    <div className="pg-memory">
      <GameHud label="Match Pairs" progress={`${matched.length / 2} / ${deck.length / 2}`} />
      <div className={`pg-memory-grid ${lowStimulation ? "cols-3" : "cols-4"}`}>
        {deck.map((emoji, i) => (
          <MemoryCard
            key={i}
            face={emoji}
            hidden={!flipped.includes(i) && !matched.includes(i)}
            matched={matched.includes(i)}
            onClick={() => flip(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Help Cards ─── */
export function PremiumHelpCards({ onComplete }: Pick<GameProps, "onComplete">) {
  const phrases = ["I need help", "I need a break", "I need space"];
  const [step, setStep] = useState(0);

  if (step >= phrases.length) {
    return <VictoryScreen title="Phrases practiced!" subtitle="You're ready to use these anytime." onComplete={onComplete} />;
  }

  return (
    <HelpPhraseCard phrase={phrases[step]} step={step + 1} total={phrases.length} onClick={() => setStep((s) => s + 1)} />
  );
}

/* ─── Sensory Scan ─── */
export function PremiumSensoryScan({ onComplete, onLogCheckIn }: GameProps) {
  const options = [
    { emoji: "🤫", label: "Quiet", hue: 260 },
    { emoji: "🏃", label: "Movement", hue: 25 },
    { emoji: "🤗", label: "Deep pressure", hue: 330 },
    { emoji: "🍎", label: "Snack / drink", hue: 140 },
  ];
  const [picked, setPicked] = useState<string | null>(null);

  if (picked) {
    return (
      <VictoryScreen
        title={`Logged: ${picked}`}
        subtitle="Your care team can see this."
        onComplete={() => {
          onLogCheckIn?.("sensory", picked);
          onComplete();
        }}
      />
    );
  }

  return (
    <div className="pg-sensory">
      <GameHud label="Sensory Scan" sublabel="What would help your body right now?" />
      <PremiumCardGrid cols={2}>
        {options.map((o) => (
          <MoodOrb key={o.label} emoji={o.emoji} label={o.label} hue={o.hue} onClick={() => setPicked(o.label)} />
        ))}
      </PremiumCardGrid>
    </div>
  );
}

/* ─── Star Catcher ─── */
export function PremiumStarCatcher({ onComplete }: Pick<GameProps, "onComplete">) {
  const target = 12;
  const [score, setScore] = useState(0);
  const [x, setX] = useState(50);

  type Star = { id: number; x: number; y: number; rot: number; size: number };
  const state = useRef<{ stars: Star[]; particles: Particle[]; x: number; spawnT: number }>({
    stars: [],
    particles: [],
    x: 50,
    spawnT: 0,
  });

  useEffect(() => {
    state.current.x = x;
  }, [x]);

  useEffect(() => {
    const move = (delta: number) => setX((v) => Math.max(8, Math.min(92, v + delta)));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move(-8);
      if (e.key === "ArrowRight") move(8);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const canvasRef = useGameCanvas((ctx, w, h, dt, time) => {
    const s = state.current;
    const floorY = h - 54;
    const catchW = Math.max(72, w * 0.24);

    drawNebulaSky(ctx, w, h, time);
    drawParallaxStars(ctx, w, h, time, 42);
    drawGroundLine(ctx, w, h, floorY + 18);

    s.spawnT += dt;
    if (s.spawnT > 0.7) {
      s.spawnT = 0;
      s.stars.push({
        id: Date.now() + Math.random(),
        x: w * (0.1 + Math.random() * 0.8),
        y: -24,
        rot: Math.random() * Math.PI,
        size: 12 + Math.random() * 10,
      });
    }

    const basketX = (s.x / 100) * w;
    const basketY = floorY;

    s.stars = s.stars.filter((st) => {
      st.y += h * 0.38 * dt;
      st.rot += dt * 2.2;
      drawGlowStar(ctx, st.x, st.y, st.size, st.rot);
      const caught =
        st.y > basketY - 32 &&
        st.y < basketY + 20 &&
        Math.abs(st.x - basketX) < catchW / 2;
      if (caught) {
        spawnBurst(s.particles, st.x, st.y, 18, 45, 180);
        setScore((sc) => sc + 1);
        return false;
      }
      return st.y < h + 40;
    });

    if (s.stars.length > 14) s.stars = s.stars.slice(-14);

    drawCatcherBasket(ctx, basketX, basketY, catchW, time);
    updateParticles(s.particles, dt);
    drawParticles(ctx, s.particles);
  }, []);

  if (score >= target) {
    return <VictoryScreen emoji="⭐" title="Star hero!" subtitle="Reflexes and focus — stellar." onComplete={onComplete} />;
  }

  return (
    <GameStage
      className="pg-space"
      hud={<GameHud label="Star Catcher" progress={`${score} / ${target}`} sublabel="← → keys or buttons to move basket" />}
    >
      <GameCanvasLayer canvasRef={canvasRef} />
      <GameControls>
        <GameControlBtn ariaLabel="Move left" onClick={() => setX((v) => Math.max(8, v - 8))}>
          ←
        </GameControlBtn>
        <GameControlBtn ariaLabel="Move right" onClick={() => setX((v) => Math.min(92, v + 8))}>
          →
        </GameControlBtn>
      </GameControls>
    </GameStage>
  );
}

/* ─── Rhythm Stars ─── */
export function PremiumRhythmStars({ onComplete, lowStimulation }: GameProps) {
  const [hits, setHits] = useState(0);
  const [active, setActive] = useState(0);
  const target = 8;

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setActive(i % 4);
      i += 1;
    }, lowStimulation ? 900 : 650);
    return () => clearInterval(t);
  }, [lowStimulation]);

  const tap = (idx: number) => {
    if (idx === active) setHits((h) => h + 1);
  };

  if (hits >= target) {
    return <VictoryScreen emoji="🎵" title="Great rhythm!" subtitle="Timing and coordination — nailed it." onComplete={onComplete} />;
  }

  return (
    <div className="pg-rhythm-wrap">
      <GameHud label="Rhythm Stars" sublabel="Tap the glowing pad in sync" />
      <RhythmPadGrid active={active} hits={hits} target={target} onTap={tap} />
    </div>
  );
}

/* ─── Happy Pet ─── */
export function PremiumHappyPet({ onComplete }: Pick<GameProps, "onComplete">) {
  const steps = ["🍎 Feed", "🎾 Play", "😴 Rest"] as const;
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(0);

  const act = () => {
    setMood((m) => Math.min(3, m + 1));
    if (step >= steps.length - 1) return;
    setStep((s) => s + 1);
  };

  if (step >= steps.length - 1 && mood >= 3) {
    return <VictoryScreen emoji="🐶" title="Happy pet!" subtitle="Care and routine — well done." onComplete={onComplete} />;
  }

  return <PetStage mood={mood} action={steps[step]} onAct={act} />;
}

/* ─── Rocket Glide ─── */
export function PremiumRocketGlide({ onComplete, lowStimulation }: GameProps) {
  const calm = lowStimulation;
  const target = calm ? 5 : 8;
  const [gems, setGems] = useState(0);
  const [boost, setBoost] = useState(false);

  type Gem = { x: number; y: number; collected: boolean; id: number };
  const state = useRef<{
    y: number;
    gems: Gem[];
    particles: Particle[];
    boost: boolean;
  }>({
    y: 0.5,
    gems: [],
    particles: [],
    boost: false,
  });

  useEffect(() => {
    state.current.boost = boost;
  }, [boost]);

  const canvasRef = useGameCanvas((ctx, w, h, dt, time) => {
    const s = state.current;
    drawNebulaSky(ctx, w, h, time, calm);
    drawParallaxStars(ctx, w, h, time, 7, calm ? 2 : 3);

    if (s.gems.length < 8) {
      s.gems.push({
        id: Date.now() + Math.random(),
        x: 0.5 + Math.random() * 0.42,
        y: -0.08,
        collected: false,
      });
    }

    const shipX = w * 0.24;
    const shipW = w * 0.16;
    const shipH = h * 0.09;
    const shipY = h * s.y;

    if (s.boost) s.y = Math.max(0.14, s.y - dt * (calm ? 0.32 : 0.5));
    else s.y = Math.min(0.82, s.y + dt * (calm ? 0.2 : 0.32));

    if (s.boost) {
      for (let i = 0; i < 3; i += 1) {
        s.particles.push({
          x: shipX - shipW * 0.35 + Math.random() * 10,
          y: shipY + (Math.random() - 0.5) * shipH,
          vx: -100 - Math.random() * 80,
          vy: (Math.random() - 0.5) * 50,
          life: 0.2 + Math.random() * 0.25,
          maxLife: 0.45,
          size: 3 + Math.random() * 4,
          hue: 30 + Math.random() * 20,
        });
      }
    }

    s.gems = s.gems.filter((g) => {
      if (g.collected) return false;
      g.y += dt * (calm ? 0.18 : 0.26);
      const gx = g.x * w;
      const gy = g.y * h;
      if (gy > -20 && gy < h + 20) drawGem(ctx, gx, gy, 16, time);
      if (Math.abs(gx - shipX) < shipW * 0.9 && Math.abs(gy - shipY) < shipH * 1.2) {
        spawnBurst(s.particles, gx, gy, 12, 190, 110);
        setGems((g) => g + 1);
        return false;
      }
      return g.y < 1.15;
    });

    drawShip(ctx, shipX, shipY, shipW, shipH, s.boost, time);
    updateParticles(s.particles, dt);
    drawParticles(ctx, s.particles);
  }, [calm]);

  if (gems >= target) {
    return <VictoryScreen emoji="🚀" title="Mission complete!" subtitle="Pilot skills — outstanding." onComplete={onComplete} />;
  }

  return (
    <GameStage
      className="pg-space"
      hud={
        <GameHud label="Rocket Glide" progress={`${gems} / ${target} gems`} sublabel="Hold screen to rise · release to glide" />
      }
    >
      <div
        className="pg-touch-layer"
        onPointerDown={() => setBoost(true)}
        onPointerUp={() => setBoost(false)}
        onPointerLeave={() => setBoost(false)}
      >
        <GameCanvasLayer canvasRef={canvasRef} />
      </div>
    </GameStage>
  );
}

/* ─── Treasure Path ─── */
export function PremiumTreasurePath({ onComplete }: Pick<GameProps, "onComplete">) {
  const [steps, setSteps] = useState(0);
  const goal = 6;
  const nextTile = steps % 4;

  const tap = (idx: number) => {
    if (idx !== nextTile) return;
    setSteps((s) => s + 1);
  };

  if (steps >= goal) {
    return <VictoryScreen emoji="🗺️" title="Treasure found!" subtitle="Path memory — excellent." onComplete={onComplete} />;
  }

  return (
    <div className="pg-treasure-wrap">
      <GameHud label="Treasure Path" progress={`${steps} / ${goal}`} sublabel="Follow the glowing tile" />
      <TreasureBoard tiles={4} next={nextTile} onTap={tap} />
    </div>
  );
}

/* ─── Emoji Adventure ─── */
export function PremiumEmojiAdventure({ onComplete }: Pick<GameProps, "onComplete">) {
  const story = [
    { title: "Chapter 1", body: "You find a magic door shimmering in the forest. What do you do?", accent: "#6366f1", choices: ["🔑 Open it", "🚶 Walk away"] },
    { title: "Chapter 2", body: "Inside is a friendly dragon guarding a crystal garden. You…", accent: "#8b5cf6", choices: ["👋 Say hi", "🎁 Share a snack"] },
    { title: "Epilogue", body: "The dragon smiles and lights the path home. Adventure complete!", accent: "#f59e0b", choices: [] as string[] },
  ];
  const [chapter, setChapter] = useState(0);

  if (chapter >= story.length - 1) {
    return (
      <StoryScene title={story[chapter].title} body={story[chapter].body} accent={story[chapter].accent}>
        <StoryChoice onClick={onComplete}>Claim your points ✨</StoryChoice>
      </StoryScene>
    );
  }

  const scene = story[chapter];
  return (
    <StoryScene title={scene.title} body={scene.body} accent={scene.accent}>
      {scene.choices.map((c) => (
        <StoryChoice key={c} onClick={() => setChapter((ch) => ch + 1)}>
          {c}
        </StoryChoice>
      ))}
    </StoryScene>
  );
}

export function renderPremiumGame(
  gameId: string,
  props: GameProps
): ReactNode {
  switch (gameId) {
    case "bubble-breathe":
      return <PremiumBubbleBreathe {...props} />;
    case "color-sort":
      return <PremiumColorSort onComplete={props.onComplete} />;
    case "mood-check":
      return <PremiumMoodCheck {...props} />;
    case "pattern-match":
      return <PremiumPatternMatch {...props} />;
    case "focus-garden":
      return <PremiumFocusGarden {...props} />;
    case "match-pairs":
      return <PremiumMatchPairs {...props} />;
    case "help-cards":
      return <PremiumHelpCards onComplete={props.onComplete} />;
    case "sensory-scan":
      return <PremiumSensoryScan {...props} />;
    case "star-catcher":
      return <PremiumStarCatcher onComplete={props.onComplete} />;
    case "rhythm-stars":
      return <PremiumRhythmStars {...props} />;
    case "happy-pet":
      return <PremiumHappyPet onComplete={props.onComplete} />;
    case "rocket-glide":
      return <PremiumRocketGlide {...props} />;
    case "treasure-path":
      return <PremiumTreasurePath onComplete={props.onComplete} />;
    case "emoji-adventure":
      return <PremiumEmojiAdventure onComplete={props.onComplete} />;
    default:
      return null;
  }
}
