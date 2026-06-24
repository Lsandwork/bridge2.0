#!/usr/bin/env node
/**
 * Downloads professional stock cover photos for Parent Education courses.
 * Real photography from Unsplash + Pexels (see PHOTO-ATTRIBUTION.md).
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outRoot = join(__dirname, "../apps/portal/public/library");

const q = "auto=compress&cs=tinysrgb&w=1200&h=675&fit=crop";

const COVERS = [
  {
    slug: "understanding-autism",
    url: `https://images.unsplash.com/photo-1516627145497-ae6968895b74?${q.replace("auto=compress&cs=tinysrgb&", "")}&q=85`,
    credit: "Kelly Sikkema / Unsplash",
  },
  {
    slug: "communication-support",
    url: `https://images.pexels.com/photos/4260325/pexels-photo-4260325.jpeg?${q}`,
    credit: "August de Richelieu / Pexels",
  },
  {
    slug: "daily-living-skills",
    url: `https://images.pexels.com/photos/8613055/pexels-photo-8613055.jpeg?${q}`,
    credit: "Kampus Production / Pexels",
  },
  {
    slug: "emotional-regulation",
    url: `https://images.pexels.com/photos/8613310/pexels-photo-8613310.jpeg?${q}`,
    credit: "Kampus Production / Pexels",
  },
  {
    slug: "sensory-support",
    url: `https://images.pexels.com/photos/8613095/pexels-photo-8613095.jpeg?${q}`,
    credit: "Kampus Production / Pexels",
  },
  {
    slug: "behavior-support",
    url: `https://images.pexels.com/photos/6476589/pexels-photo-6476589.jpeg?${q}`,
    credit: "Tima Miroshnichenko / Pexels",
  },
  {
    slug: "social-stories",
    url: `https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?${q}`,
    credit: "Kampus Production / Pexels",
  },
  {
    slug: "parent-coaching-plans",
    url: `https://images.unsplash.com/photo-1450101499163-c8848c66ca85?${q.replace("auto=compress&cs=tinysrgb&", "")}&q=85`,
    credit: "Scott Graham / Unsplash",
  },
  {
    slug: "crisis-overload-support",
    url: `https://images.pexels.com/photos/8135112/pexels-photo-8135112.jpeg?${q}`,
    credit: "MART PRODUCTION / Pexels",
  },
];

async function download(slug, url) {
  const dir = join(outRoot, slug);
  mkdirSync(dir, { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(join(dir, "cover.jpg"), buf);
  console.log(`✓ ${slug}/cover.jpg (${Math.round(buf.length / 1024)} KB)`);
}

const credits = COVERS.map((c) => `- **${c.slug}**: ${c.credit}`).join("\n");

for (const cover of COVERS) {
  await download(cover.slug, cover.url);
}

writeFileSync(
  join(outRoot, "PHOTO-ATTRIBUTION.md"),
  `# Course cover photography\n\nUnsplash and Pexels licenses — free for commercial use.\n\n${credits}\n`
);

console.log("Done.");
