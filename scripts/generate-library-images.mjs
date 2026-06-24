#!/usr/bin/env node
/**
 * Generates calm, topic-specific SVG illustrations for every library lesson.
 * Output: apps/portal/public/library/{courseSlug}/{lessonSlug}.svg
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outRoot = join(root, "apps/portal/public/library");

const categories = [
  {
    slug: "understanding-autism",
    title: "Understanding Autism",
    accent: "#4A6670",
    articles: [
      "What autism is",
      "Autism across ages",
      "Communication differences",
      "Sensory differences",
      "Meltdowns vs tantrums",
      "Executive functioning",
      "Routines and predictability",
      "Strength-based support",
      "Respectful language",
      "Supporting teens and adults with dignity",
    ],
  },
  {
    slug: "communication-support",
    title: "Communication Support",
    accent: "#2D6A7E",
    articles: [
      "Wait-and-watch exercise",
      "Offer two choices exercise",
      "Model without forcing speech",
      "Use AAC during daily routines",
      "Build a phrase board",
      "Practice yes/no",
      "Practice help, break, stop, and I need space",
      "Use visuals before transitions",
      "Reduce question overload",
      "Create communication opportunities across daily contexts",
    ],
  },
  {
    slug: "daily-living-skills",
    title: "Daily Living Skills",
    accent: "#5C7A6B",
    articles: [
      "Brushing teeth",
      "Washing hands",
      "Getting dressed",
      "Packing a bag",
      "Cleaning up",
      "Making a simple snack",
      "Morning routine",
      "Bedtime routine",
      "Shower routine",
      "Laundry basics",
      "Money basics",
      "Time management",
      "Community safety",
      "Job readiness for teens and adults",
    ],
  },
  {
    slug: "emotional-regulation",
    title: "Emotional Regulation",
    accent: "#6B5B7A",
    articles: [
      "Emotion labeling",
      "Body signals",
      "Calm-down menu",
      "Breathing practice",
      "First calm, then solve",
      "Safe break routine",
      "Heavy work and movement breaks",
      "Sensory toolkit planning",
      "After-meltdown recovery",
      "Repair conversation",
      "Choosing coping tools",
    ],
  },
  {
    slug: "sensory-support",
    title: "Sensory Support",
    accent: "#7A6B5C",
    articles: [
      "Sensory profile guide",
      "Noise sensitivity tools",
      "Clothing sensitivity tools",
      "Food texture support",
      "Transition support",
      "Visual clutter reduction",
      "Calm space setup",
      "Movement breaks",
      "Deep pressure safety notes",
      "Sensory diet planner",
      "What to track before judging behavior",
    ],
  },
  {
    slug: "behavior-support",
    title: "Behavior Support",
    accent: "#5C6B7A",
    articles: [
      "Find the reason behind behavior",
      "Track triggers with ABC logs",
      "Replacement skills",
      "Prevent overload",
      "Offer choices",
      "Use visual schedules",
      "Teach break before escalation",
      "Reinforce communication",
      "Avoid shame language",
      "Avoid forcing eye contact",
      "Avoid compliance-only design",
    ],
  },
  {
    slug: "social-stories",
    title: "Social Stories Library",
    accent: "#2D6A7E",
    articles: [
      "Going to school",
      "Going to work",
      "Doctor visit",
      "Dentist visit",
      "Haircut",
      "Trying new food",
      "Loud places",
      "Sharing space",
      "Waiting",
      "Taking turns",
      "Riding in the car",
      "Going to the store",
      "Meeting new people",
      "When plans change",
      "Asking for help",
      "Saying no",
      "Personal boundaries",
      "Internet safety",
      "Public bathroom safety",
    ],
  },
  {
    slug: "parent-coaching-plans",
    title: "Parent Coaching Plans",
    accent: "#8B6914",
    articles: [
      "7-day communication boost",
      "7-day morning routine builder",
      "14-day toilet routine support",
      "14-day emotional regulation plan",
      "30-day independence plan",
      "30-day teen and adult life skills plan",
    ],
  },
  {
    slug: "crisis-overload-support",
    title: "Crisis and Overload Support",
    accent: "#8B4513",
    articles: [
      "Early warning signs",
      "What to do during overload",
      "What not to do",
      "How to reduce demands",
      "How to keep everyone safe",
      "Recovery steps",
      "When to contact a professional",
      "Emergency contact planning",
    ],
  },
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickTheme(title) {
  const t = title.toLowerCase();
  if (/teeth|brush|dentist|toilet|shower|hygiene|bathroom|hand/.test(t)) return "hygiene";
  if (/food|snack|texture/.test(t)) return "food";
  if (/school|work|job/.test(t)) return "community";
  if (/doctor|medical|health/.test(t)) return "medical";
  if (/car|store|community|public/.test(t)) return "outings";
  if (/emotion|calm|breath|meltdown|regulation|repair|body signal/.test(t)) return "emotions";
  if (/sensory|noise|clothing|movement|pressure|clutter|calm space/.test(t)) return "sensory";
  if (/communic|aac|speech|phrase|choice|yes|help|break|visual|prompt/.test(t)) return "communication";
  if (/routine|morning|bedtime|laundry|dress|pack|clean|time|money|independence/.test(t)) return "daily";
  if (/behavior|abc|trigger|schedule|compliance|eye contact|shame/.test(t)) return "behavior";
  if (/story|wait|turn|share|meet|boundary|internet|haircut|plan change|say/.test(t)) return "social";
  if (/crisis|overload|emergency|safe|warning|recovery|professional/.test(t)) return "safety";
  if (/autism|strength|respect|executive|predictability|dignity|ages/.test(t)) return "foundations";
  if (/coaching|day|plan/.test(t)) return "coaching";
  return "foundations";
}

function sceneForTheme(theme, variant, accent) {
  const v = variant % 4;
  const scenes = {
    hygiene: [
      `<rect x="280" y="120" width="240" height="180" rx="20" fill="#fff" opacity="0.92"/>
       <circle cx="400" cy="200" r="48" fill="${accent}" opacity="0.25"/>
       <rect x="340" y="260" width="120" height="16" rx="8" fill="${accent}" opacity="0.5"/>`,
      `<ellipse cx="400" cy="250" rx="130" ry="40" fill="#fff" opacity="0.3"/>
       <path d="M350 180 Q400 140 450 180 L440 280 Q400 300 360 280 Z" fill="#fff" opacity="0.85"/>`,
    ],
    food: [
      `<circle cx="400" cy="220" r="70" fill="#fff" opacity="0.9"/>
       <circle cx="370" cy="200" r="18" fill="${accent}" opacity="0.4"/>
       <circle cx="430" cy="210" r="14" fill="${accent}" opacity="0.35"/>
       <rect x="360" y="270" width="80" height="12" rx="6" fill="${accent}" opacity="0.45"/>`,
    ],
    community: [
      `<rect x="300" y="160" width="200" height="140" rx="8" fill="#fff" opacity="0.9"/>
       <polygon points="300,160 400,110 500,160" fill="#fff" opacity="0.75"/>
       <rect x="370" y="220" width="60" height="80" rx="4" fill="${accent}" opacity="0.35"/>`,
    ],
    medical: [
      `<rect x="320" y="140" width="160" height="200" rx="16" fill="#fff" opacity="0.9"/>
       <rect x="385" y="180" width="30" height="90" rx="4" fill="${accent}" opacity="0.5"/>
       <rect x="355" y="210" width="90" height="30" rx="4" fill="${accent}" opacity="0.5"/>`,
    ],
    outings: [
      `<rect x="260" y="220" width="280" height="70" rx="20" fill="#fff" opacity="0.85"/>
       <circle cx="310" cy="290" r="28" fill="${accent}" opacity="0.4"/>
       <circle cx="490" cy="290" r="28" fill="${accent}" opacity="0.4"/>
       <rect x="300" y="170" width="200" height="60" rx="12" fill="#fff" opacity="0.7"/>`,
    ],
    emotions: [
      `<circle cx="400" cy="210" r="80" fill="#fff" opacity="0.88"/>
       <circle cx="370" cy="195" r="8" fill="${accent}"/>
       <circle cx="430" cy="195" r="8" fill="${accent}"/>
       <path d="M370 235 Q400 260 430 235" stroke="${accent}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.6"/>`,
    ],
    sensory: [
      `<circle cx="320" cy="200" r="40" fill="#fff" opacity="0.5"/>
       <circle cx="400" cy="180" r="55" fill="#fff" opacity="0.65"/>
       <circle cx="480" cy="210" r="35" fill="#fff" opacity="0.45"/>
       <rect x="340" y="260" width="120" height="40" rx="12" fill="#fff" opacity="0.8"/>`,
    ],
    communication: [
      `<rect x="290" y="150" width="220" height="160" rx="24" fill="#fff" opacity="0.92"/>
       <rect x="320" y="190" width="70" height="50" rx="8" fill="${accent}" opacity="0.3"/>
       <rect x="410" y="190" width="70" height="50" rx="8" fill="${accent}" opacity="0.3"/>
       <circle cx="400" cy="270" r="10" fill="${accent}" opacity="0.5"/>`,
    ],
    daily: [
      `<rect x="300" y="130" width="200" height="200" rx="12" fill="#fff" opacity="0.88"/>
       <line x1="320" y1="170" x2="480" y2="170" stroke="${accent}" stroke-width="4" opacity="0.35"/>
       <line x1="320" y1="210" x2="480" y2="210" stroke="${accent}" stroke-width="4" opacity="0.35"/>
       <line x1="320" y1="250" x2="420" y2="250" stroke="${accent}" stroke-width="4" opacity="0.35"/>
       <circle cx="460" cy="290" r="24" fill="${accent}" opacity="0.4"/>`,
    ],
    behavior: [
      `<rect x="280" y="160" width="240" height="160" rx="16" fill="#fff" opacity="0.9"/>
       <polyline points="310,280 350,220 390,250 430,200 470,240" fill="none" stroke="${accent}" stroke-width="5" opacity="0.55" stroke-linecap="round" stroke-linejoin="round"/>`,
    ],
    social: [
      `<circle cx="340" cy="220" r="50" fill="#fff" opacity="0.85"/>
       <circle cx="460" cy="220" r="50" fill="#fff" opacity="0.85"/>
       <path d="M320 290 Q400 330 480 290" stroke="${accent}" stroke-width="5" fill="none" opacity="0.4"/>`,
    ],
    safety: [
      `<polygon points="400,120 480,280 320,280" fill="#fff" opacity="0.88"/>
       <rect x="388" y="200" width="24" height="50" rx="4" fill="${accent}" opacity="0.55"/>
       <circle cx="400" cy="185" r="10" fill="${accent}" opacity="0.55"/>`,
    ],
    foundations: [
      `<circle cx="400" cy="210" r="90" fill="#fff" opacity="0.25"/>
       <circle cx="400" cy="210" r="60" fill="#fff" opacity="0.55"/>
       <circle cx="400" cy="210" r="30" fill="#fff" opacity="0.85"/>`,
    ],
    coaching: [
      `<rect x="290" y="140" width="220" height="200" rx="16" fill="#fff" opacity="0.9"/>
       ${[0, 1, 2, 3, 4].map((i) => `<rect x="320" y="${175 + i * 28}" width="${140 - i * 10}" height="14" rx="7" fill="${accent}" opacity="${0.25 + i * 0.08}"/>`).join("")}`,
    ],
  };
  const list = scenes[theme] ?? scenes.foundations;
  return list[v % list.length];
}

function buildSvg(title, courseSlug, lessonSlug, accent) {
  const theme = pickTheme(title);
  const variant = hash(lessonSlug);
  const light = accent + "22";
  const mid = accent + "55";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" role="img" aria-label="${title.replace(/"/g, "&quot;")}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="45%" stop-color="${mid}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.18"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bg)"/>
  <ellipse cx="400" cy="420" rx="340" ry="60" fill="url(#floor)"/>
  ${sceneForTheme(theme, variant, accent)}
  <circle cx="120" cy="90" r="40" fill="#ffffff" opacity="0.12"/>
  <circle cx="680" cy="100" r="55" fill="#ffffff" opacity="0.1"/>
</svg>`;
}

function buildCourseCoverSvg(title, courseSlug, accent, lessonCount) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" role="img" aria-label="${title.replace(/"/g, "&quot;")} course cover">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bg)"/>
  <rect x="0" y="0" width="800" height="450" fill="#000" opacity="0.12"/>
  ${sceneForTheme(pickTheme(title), hash(courseSlug), "#ffffff")}
  <text x="48" y="380" fill="#ffffff" font-family="system-ui,sans-serif" font-size="28" font-weight="700">${title}</text>
  <text x="48" y="415" fill="#ffffff" opacity="0.85" font-family="system-ui,sans-serif" font-size="16">${lessonCount} lessons</text>
</svg>`;
}

for (const cat of categories) {
  const dir = join(outRoot, cat.slug);
  mkdirSync(dir, { recursive: true });

  const coverPath = join(dir, "_cover.svg");
  writeFileSync(coverPath, buildCourseCoverSvg(cat.title, cat.slug, cat.accent, cat.articles.length));

  for (const article of cat.articles) {
    const lessonSlug = slugify(article);
    const filePath = join(dir, `${lessonSlug}.svg`);
    writeFileSync(filePath, buildSvg(article, cat.slug, lessonSlug, cat.accent));
  }
}

const total = categories.reduce((n, c) => n + c.articles.length, 0);
console.log(`Generated ${total} lesson images + ${categories.length} course covers.`);
