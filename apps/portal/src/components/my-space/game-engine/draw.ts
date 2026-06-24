export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  alpha?: number;
};

export function spawnBurst(
  particles: Particle[],
  x: number,
  y: number,
  count: number,
  hue: number,
  speed = 120
) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const v = speed * (0.4 + Math.random() * 0.6);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      life: 0.4 + Math.random() * 0.5,
      maxLife: 0.4 + Math.random() * 0.5,
      size: 2 + Math.random() * 4,
      hue,
    });
  }
}

export function updateParticles(particles: Particle[], dt: number) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    p.vy += 180 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.98;
  }
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const t = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = (p.alpha ?? 1) * t;
    ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, 1)`;
    ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 0.8)`;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function drawNebulaSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  calm = false
) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#050816");
  g.addColorStop(0.45, "#0f172a");
  g.addColorStop(1, calm ? "#1e1b4b" : "#312e81");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const blobs = calm ? 2 : 4;
  for (let i = 0; i < blobs; i += 1) {
    const bx = w * (0.2 + i * 0.25) + Math.sin(time * 0.3 + i) * 30;
    const by = h * (0.25 + (i % 2) * 0.35);
    const r = w * (0.35 + i * 0.05);
    const rg = ctx.createRadialGradient(bx, by, 0, bx, by, r);
    const hues = [260, 210, 290, 320];
    rg.addColorStop(0, `hsla(${hues[i]}, 80%, 55%, ${calm ? 0.12 : 0.22})`);
    rg.addColorStop(1, "transparent");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  }
}

export function drawParallaxStars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  seed: number,
  layers = 3
) {
  for (let layer = 0; layer < layers; layer += 1) {
    const count = 20 + layer * 15;
    const speed = (layer + 1) * 8;
    for (let i = 0; i < count; i += 1) {
      const px = ((seed * 997 + i * 173) % 1000) / 1000;
      const py = ((seed * 571 + i * 311) % 1000) / 1000;
      const size = 0.6 + (layer * 0.5) + (i % 3) * 0.3;
      const x = (px * w + time * speed) % (w + 20) - 10;
      const y = py * h;
      ctx.fillStyle = `rgba(255,255,255,${0.25 + layer * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawGlowStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  hue = 45
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.9)`;
  ctx.shadowBlur = size * 1.2;

  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  g.addColorStop(0, "#fffef0");
  g.addColorStop(0.35, `hsl(${hue}, 95%, 65%)`);
  g.addColorStop(1, `hsla(${hue}, 90%, 50%, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `hsla(${hue}, 100%, 85%, 0.9)`;
  ctx.lineWidth = size * 0.12;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.2);
    ctx.lineTo(0, -size);
    ctx.stroke();
    ctx.rotate(Math.PI / 2);
  }
  ctx.restore();
}

export function drawIridescentBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  hue = 200
) {
  ctx.save();
  ctx.shadowColor = `hsla(${hue}, 80%, 70%, 0.5)`;
  ctx.shadowBlur = radius * 0.6;

  const g = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.35, radius * 0.05, x, y, radius);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.25, `hsla(${hue + Math.sin(time) * 20}, 70%, 75%, 0.35)`);
  g.addColorStop(0.7, `hsla(${hue + 40}, 60%, 60%, 0.15)`);
  g.addColorStop(1, `hsla(${hue}, 50%, 50%, 0.05)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.92, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  ctx.ellipse(x - radius * 0.28, y - radius * 0.32, radius * 0.22, radius * 0.14, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawSkyGradient(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#0c4a6e");
  g.addColorStop(0.35, "#0369a1");
  g.addColorStop(0.7, "#38bdf8");
  g.addColorStop(1, "#bae6fd");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const sunX = w * 0.75;
  const sunY = h * 0.18 + Math.sin(time * 0.2) * 6;
  const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.35);
  sg.addColorStop(0, "rgba(255,251,235,0.35)");
  sg.addColorStop(1, "transparent");
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, w, h);
}

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

export function drawGlowPad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  active: boolean,
  hue: number,
  pulse: number
) {
  const r = 16;
  drawRoundedRect(ctx, x, y, w, h, r);

  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  if (active) {
    g.addColorStop(0, `hsl(${hue}, 85%, 62%)`);
    g.addColorStop(1, `hsl(${hue + 40}, 90%, 48%)`);
  } else {
    g.addColorStop(0, "#1e293b");
    g.addColorStop(1, "#0f172a");
  }
  ctx.fillStyle = g;
  ctx.fill();

  if (active) {
    ctx.save();
    ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.85)`;
    ctx.shadowBlur = 24 + pulse * 12;
    ctx.strokeStyle = `hsla(${hue}, 100%, 80%, ${0.6 + pulse * 0.4})`;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, x, y, w, h, r);
    ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, x, y, w, h, r);
  ctx.stroke();
}

export function drawShip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  boost: boolean,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);

  if (boost) {
    const flame = ctx.createLinearGradient(-w * 0.6, 0, -w, 0);
    flame.addColorStop(0, "rgba(251,191,36,0)");
    flame.addColorStop(0.5, "rgba(251,191,36,0.9)");
    flame.addColorStop(1, "rgba(239,68,68,0.8)");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(-w * 0.45, -h * 0.15);
    ctx.lineTo(-w * (0.9 + Math.sin(time * 30) * 0.15), 0);
    ctx.lineTo(-w * 0.45, h * 0.15);
    ctx.closePath();
    ctx.fill();
  }

  const body = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  body.addColorStop(0, "#e2e8f0");
  body.addColorStop(0.5, "#94a3b8");
  body.addColorStop(1, "#64748b");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(-w * 0.35, -h / 2);
  ctx.lineTo(-w * 0.5, 0);
  ctx.lineTo(-w * 0.35, h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#38bdf8";
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.ellipse(w * 0.05, 0, w * 0.12, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawGem(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(time * 2 + x) * 0.1);
  ctx.shadowColor = "rgba(56,189,248,0.8)";
  ctx.shadowBlur = size;

  const g = ctx.createLinearGradient(0, -size, 0, size);
  g.addColorStop(0, "#67e8f9");
  g.addColorStop(0.5, "#06b6d4");
  g.addColorStop(1, "#0891b2");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.65, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.65, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.7);
  ctx.lineTo(size * 0.2, -size * 0.2);
  ctx.lineTo(0, size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawCatcherBasket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);
  const bob = Math.sin(time * 4) * 2;
  ctx.translate(0, bob);

  const hw = w / 2;
  const depth = Math.max(28, w * 0.32);
  const rimH = Math.max(8, w * 0.1);

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(0, depth * 0.95, hw * 1.05, depth * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Basket body
  const bodyG = ctx.createLinearGradient(-hw, 0, hw, 0);
  bodyG.addColorStop(0, "#92400e");
  bodyG.addColorStop(0.35, "#fbbf24");
  bodyG.addColorStop(0.65, "#fde68a");
  bodyG.addColorStop(1, "#92400e");
  ctx.fillStyle = bodyG;
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-hw, 0);
  ctx.lineTo(-hw * 0.82, depth);
  ctx.quadraticCurveTo(0, depth + rimH * 0.8, hw * 0.82, depth);
  ctx.lineTo(hw, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Woven texture
  ctx.strokeStyle = "rgba(69,26,3,0.35)";
  ctx.lineWidth = 1.5;
  for (let i = 1; i <= 4; i += 1) {
    const py = (depth * i) / 5;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.88 + py * 0.08, py);
    ctx.lineTo(hw * 0.88 - py * 0.08, py);
    ctx.stroke();
  }

  // Rim highlight
  ctx.fillStyle = "#fef3c7";
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, hw, rimH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner rim shadow
  ctx.fillStyle = "rgba(120,53,15,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, rimH * 0.35, hw * 0.82, rimH * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Handle
  ctx.strokeStyle = "#b45309";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, -rimH * 1.2, hw * 0.55, Math.PI, 0);
  ctx.stroke();

  ctx.restore();
}

export function drawGroundLine(ctx: CanvasRenderingContext2D, w: number, h: number, y: number) {
  const g = ctx.createLinearGradient(0, y - 8, 0, y + 8);
  g.addColorStop(0, "rgba(99,102,241,0.15)");
  g.addColorStop(0.5, "rgba(139,92,246,0.35)");
  g.addColorStop(1, "rgba(99,102,241,0.05)");
  ctx.fillStyle = g;
  ctx.fillRect(0, y - 2, w, 4);
}

export function drawPlantStage(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  stage: number,
  time: number,
  w: number
) {
  const potW = w * 0.28;
  const potH = potW * 0.55;
  const potY = cy + potH * 0.3;

  const potG = ctx.createLinearGradient(cx - potW / 2, potY, cx + potW / 2, potY + potH);
  potG.addColorStop(0, "#92400e");
  potG.addColorStop(1, "#451a03");
  ctx.fillStyle = potG;
  drawRoundedRect(ctx, cx - potW / 2, potY, potW, potH, 8);
  ctx.fill();

  ctx.fillStyle = "#3f2e18";
  ctx.fillRect(cx - potW / 2 + 4, potY + 4, potW - 8, potH * 0.35);

  const stemH = potW * (0.4 + stage * 0.35);
  ctx.strokeStyle = "#15803d";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, potY);
  ctx.quadraticCurveTo(cx + Math.sin(time) * 4, potY - stemH * 0.5, cx, potY - stemH);
  ctx.stroke();

  const leafCount = 1 + stage * 2;
  for (let i = 0; i < leafCount; i += 1) {
    const ly = potY - stemH * (0.35 + (i / leafCount) * 0.55);
    const side = i % 2 === 0 ? -1 : 1;
    const sway = Math.sin(time * 1.5 + i) * 6;
    ctx.save();
    ctx.translate(cx + side * (potW * 0.15 + sway), ly);
    ctx.rotate(side * 0.8);
    ctx.fillStyle = `hsl(${130 + i * 8}, 65%, ${38 + stage * 8}%)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, potW * 0.18, potW * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (stage >= 2) {
    drawGlowStar(ctx, cx, potY - stemH - potW * 0.1, potW * 0.08, time * 0.5, 120);
  }
}
