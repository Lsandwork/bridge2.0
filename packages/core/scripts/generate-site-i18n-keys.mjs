#!/usr/bin/env node
/**
 * Generates pricing.* / library.* keys from pricing.ts + library-courses.ts source.
 * Run: node packages/core/scripts/generate-site-i18n-keys.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function escapeTs(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

/** @type {Record<string, string>} */
const keys = {};

function add(key, value) {
  keys[key] = value;
}

// Static page chrome
add("pricing.eyebrow", "Pricing");
add("pricing.header", "Plans, insurance & medical approval");
add("pricing.directTitle", "Direct pricing");
add("pricing.directSubtitle", "Start immediately with self-pay, or use free foundations courses while waiting on authorization.");
add("pricing.payersTitle", "For health plans & Medicaid MCOs");
add("pricing.payersSubtitle", "Bridge aligns to USA billing workflows for caregiver training (CPT 97156/97157) and digital mental health treatment management (HCPCS G0552–G0554). Plans typically authorize $165–$220/month per family or $8–$11 PMPM at population scale — final rates set by your contract.");
add("pricing.reimbursementTitle", "Reference reimbursement codes (USA)");
add("pricing.reimbursementSubtitle", "For medical directors — not a guarantee of payment.");
add("pricing.table.code", "Code");
add("pricing.table.service", "Service");
add("pricing.table.range", "Typical range");
add("pricing.insuranceTitle", "Insurance & public funding");
add("pricing.insuranceSubtitle", "Most families pay $0 out of pocket when prior authorization is approved. We provide the documentation packets caseworkers and service coordinators expect — Medi-Cal, regional centers, private insurance, and Medicaid waivers in all 50 states.");
add("pricing.bestFor", "Best for:");
add("pricing.howItWorks", "How it works");
add("pricing.documentsIncluded", "Documents included");
add("pricing.requestApproval", "Request approval for this path");
add("pricing.approvalTitle", "Medical approval request");
add("pricing.approvalSubtitle", "Prior authorization, letters of medical necessity, regional center IPP alignment, and superbill reimbursement — submit one form and our enrollment team builds your packet.");
add("pricing.faqTitle", "Common questions");
add("pricing.legalTitle", "Legal notice");
add("pricing.legalCptNote", "CPT and HCPCS codes referenced in documentation are examples only. Your treating clinician or authorized billing provider must confirm medical necessity, codes, and modifiers for your plan and state.");
add("pricing.form.title", "Request medical / insurance approval");
add("pricing.form.subtitle", "Submit this form to start a prior authorization, regional center vendor review, or reimbursement packet. Our enrollment team responds within 2 business days.");
add("pricing.form.parentName", "Parent / guardian name");
add("pricing.form.email", "Email");
add("pricing.form.state", "State");
add("pricing.form.payerType", "Payer type");
add("pricing.form.approvalType", "Approval type needed");
add("pricing.form.memberId", "Member / client ID (if applicable)");
add("pricing.form.memberIdPlaceholder", "Medi-Cal ID, insurance member #, or regional center UCI");
add("pricing.form.clinician", "Treating clinician (optional)");
add("pricing.form.clinicianPlaceholder", "Dr. Smith, BCBA Jane Doe, SLP name");
add("pricing.form.notes", "Additional notes");
add("pricing.form.notesPlaceholder", "Service coordinator name, deadline for IPP meeting, etc.");
add("pricing.form.submit", "Submit approval request");
add("pricing.form.submitting", "Submitting…");
add("pricing.form.submitted", "Request submitted — reference {id}");
add("pricing.form.youProvide", "You provide");
add("pricing.form.weProvide", "We provide");
add("pricing.form.turnaround", "Typical turnaround: {time}");
add("pricing.form.requestFailed", "Request failed");

add("library.eyebrow", "Parent Education Library");
add("library.title", "Courses & lesson plans");
add("library.demoNoteText", "First lesson in every course is open. Remaining lessons unlock through your chosen payment path — Medi-Cal authorization, insurance reimbursement, or direct billing.");
add("library.demoNoteStrong", "Demo account:");
add("library.noCourses", "No courses in this category yet.");
add("library.needHelp", "Need help choosing a payment path?");
add("library.viewCoverage", "View coverage options");
add("library.filterAria", "Filter courses");
add("library.coverageTitle", "How families pay for access");
add("library.coverageSubtitle", "Six paths — pick the one that matches your situation. Every path includes progress logs caseworkers can review.");
add("library.comparePayment", "Compare all payment options");
add("library.filter.All", "All");
add("library.filter.Foundations", "Foundations");
add("library.filter.Communication", "Communication");
add("library.filter.Daily Living", "Daily Living");
add("library.filter.Regulation", "Regulation");
add("library.filter.Coaching Plans", "Coaching Plans");
add("library.filter.Safety", "Safety");

add("landing.pricing", "Pricing");
add("landing.signIn", "Sign in");
add("landing.heroTitle", "Support that doesn't stop when the session ends.");
add("landing.heroLead", "One platform for families, clinicians, and health plans — built for autism support.");
add("landing.pillar1.title", "Calm at home");
add("landing.pillar1.body", "Routines and support that fit real life — not another clinical chore.");
add("landing.pillar2.title", "Connected care");
add("landing.pillar2.body", "Parents, therapists, and payers aligned on the same progress.");
add("landing.pillar3.title", "Tess, with you");
add("landing.pillar3.body", "AI coaching reviewed by humans. Always.");
add("landing.audience1.title", "Parents");
add("landing.audience1.hook", "Less coordinating. More calm.");
add("landing.audience2.title", "Therapists");
add("landing.audience2.hook", "Walk in knowing what happened at home.");
add("landing.audience3.title", "Health plans");
add("landing.audience3.hook", "Outcomes you can stand behind.");
add("landing.quote", "For the first time, everyone on the care team sees the same story.");
add("landing.quoteCite", "— Care team pilot participant");
add("landing.closeTitle", "See Bridge with your team.");
add("landing.footerTagline", "Support · Grow · Thrive");
add("landing.whyBridge", "Why Bridge");
add("landing.whoFor", "Who Bridge is for");

add("socialStories.title", "Social Stories");
add("socialStories.subtitle", "Simple, predictable narratives for new situations and transitions.");
add("socialStories.generate", "Generate with Tess AI");
add("socialStories.loading", "Loading social stories...");
add("socialStories.empty", "No social stories yet.");

add("exercises.title", "Home Exercises");
add("exercises.subtitle", "Build skills with step-by-step practice plans.");
add("exercises.loading", "Loading exercises...");
add("exercises.create", "Create exercise");
add("exercises.empty", "No exercises yet.");
add("exercises.template.life_skill", "Life Skill");
add("exercises.template.hygiene_skill", "Hygiene");
add("exercises.template.communication", "Communication");
add("exercises.template.emotional_regulation", "Emotional Regulation");
add("exercises.template.sensory", "Sensory");
add("exercises.template.school_skill", "School Skill");

add("tess.title", "Tess Assistant");
add("tess.subtitle", "Educational AI support for your family");
add("tess.loading", "Loading Tess Assistant…");
add("tess.chat", "Chat");
add("tess.history", "History");
add("tess.settings", "Settings");
add("tess.suggestions", "Suggestions");

add("pricing.legalNotice", fs.readFileSync(path.join(ROOT, "src/pricing.ts"), "utf8").match(/PRICING_LEGAL_NOTICE =\s*\n\s*"([^"]+)"/s)?.[1] ?? "");
add("library.serviceDescription", fs.readFileSync(path.join(ROOT, "src/library-courses.ts"), "utf8").match(/LIBRARY_SERVICE_DESCRIPTION =\s*\n\s*"([^"]+)"/s)?.[1] ?? "");
add("library.legalNotice", fs.readFileSync(path.join(ROOT, "src/library-courses.ts"), "utf8").match(/LIBRARY_LEGAL_NOTICE =\s*\n\s*"([^"]+)"/s)?.[1] ?? "");

add("common.safetyDisclaimer", "This app provides supportive tools, education, routines, and skill-building exercises. It does not diagnose, treat, or replace doctors, therapists, speech therapy, occupational therapy, ABA, school services, or clinical care.");
add("tess.disclaimer", fs.readFileSync(path.join(ROOT, "src/tess/types.ts"), "utf8").match(/TESS_DISCLAIMER =\s*\n\s*"([^"]+)"/s)?.[1] ?? "");

add("library.badge.free", "Free");
add("library.badge.insurance", "Insurance docs");
add("library.badge.coaching", "Coaching plan");
add("library.tier.included", "Included with free account");
add("library.tier.insurance_packet", "Insurance documentation included");
add("library.tier.coaching_intensive", "Coaching plan — authorization recommended");
add("library.lessonsProgress", "{count} lessons · {pct}% complete");
add("library.viewCurriculum", "View curriculum →");
add("library.backToLibrary", "← Back to library");
add("library.continueCourse", "Continue course");
add("library.startCourse", "Start course");
add("library.payerDocs", "Documentation for payers");
add("library.referenceCodes", "Reference codes (verify with billing provider): {codes}");

function parseStringRecord(src, name) {
  const start = src.indexOf(`const ${name}`);
  if (start < 0) return {};
  const slice = src.slice(start, src.indexOf("};", start) + 2);
  /** @type {Record<string, string>} */
  const out = {};
  for (const m of slice.matchAll(/"([\w-]+)":\s*\n?\s*"([^"]*(?:\\.[^"]*)*)"/g)) {
    out[m[1]] = m[2].replace(/\\"/g, '"');
  }
  return out;
}

function parseDocRecord(src) {
  const start = src.indexOf("const documentationMap");
  const slice = src.slice(start, src.indexOf("};", start + 500) + 2);
  /** @type {Record<string, { label: string; detail: string }>} */
  const out = {};
  for (const block of slice.matchAll(/"([\w-]+)":\s*\{([\s\S]*?)\}/g)) {
    const label = block[2].match(/label:\s*"([^"]+)"/)?.[1];
    const detail = block[2].match(/detail:\s*"([^"]+)"/)?.[1];
    if (label && detail) out[block[1]] = { label, detail };
  }
  return out;
}

const libraryCoursesPath = path.join(ROOT, "src/library-courses.ts");
const categoriesPath = path.join(ROOT, "src/parent-library-categories.ts");
const categoriesSrc = fs.readFileSync(categoriesPath, "utf8");
const librarySrc = fs.readFileSync(libraryCoursesPath, "utf8");

const subtitleMap = parseStringRecord(librarySrc, "subtitleMap");
const descriptionMap = parseStringRecord(librarySrc, "descriptionMap");
const filterMap = parseStringRecord(librarySrc, "filterMap");
const documentationMap = parseDocRecord(librarySrc);

for (const m of categoriesSrc.matchAll(/slug:\s*"([\w-]+)"[\s\S]*?title:\s*"([^"]+)"/g)) {
  const slug = m[1];
  const title = m[2];
  add(`library.course.${slug}.title`, title);
  add(`library.course.${slug}.subtitle`, subtitleMap[slug] ?? `Structured lessons for ${title.toLowerCase()}`);
  add(`library.course.${slug}.description`, descriptionMap[slug] ?? `Evidence-informed ${title.toLowerCase()} course for home implementation.`);
  add(`library.course.${slug}.filter`, filterMap[slug] ?? "Foundations");
  if (documentationMap[slug]) {
    add(`library.course.${slug}.docLabel`, documentationMap[slug].label);
    add(`library.course.${slug}.docDetail`, documentationMap[slug].detail);
  }
}

// Parse pricing.ts arrays via dynamic import
const pricingPath = path.join(ROOT, "src/pricing.ts");
const pricingMod = await import(pricingPath + "?t=" + Date.now());

for (const plan of pricingMod.pricingPlans) {
  add(`pricing.plan.${plan.id}.name`, plan.name);
  add(`pricing.plan.${plan.id}.period`, plan.period);
  add(`pricing.plan.${plan.id}.description`, plan.description);
  add(`pricing.plan.${plan.id}.cta`, plan.cta);
  if (plan.badge) add(`pricing.plan.${plan.id}.badge`, plan.badge);
  plan.features.forEach((f, i) => add(`pricing.plan.${plan.id}.feature.${i}`, f));
}

for (const plan of pricingMod.payerPlans) {
  add(`pricing.payer.${plan.id}.name`, plan.name);
  add(`pricing.payer.${plan.id}.period`, plan.period);
  add(`pricing.payer.${plan.id}.description`, plan.description);
  add(`pricing.payer.${plan.id}.cta`, plan.cta);
  plan.features.forEach((f, i) => add(`pricing.payer.${plan.id}.feature.${i}`, f));
}

for (const opt of pricingMod.coverageOptions) {
  add(`pricing.coverage.${opt.id}.title`, opt.title);
  add(`pricing.coverage.${opt.id}.subtitle`, opt.subtitle);
  add(`pricing.coverage.${opt.id}.bestFor`, opt.bestFor);
  add(`pricing.coverage.${opt.id}.priceLabel`, opt.priceLabel);
  opt.steps.forEach((s, i) => add(`pricing.coverage.${opt.id}.step.${i}`, s));
  opt.documentsIncluded.forEach((d, i) => add(`pricing.coverage.${opt.id}.doc.${i}`, d));
  if (opt.note) add(`pricing.coverage.${opt.id}.note`, opt.note);
}

for (const t of pricingMod.medicalApprovalTypes) {
  add(`pricing.approval.${t.id}.title`, t.title);
  add(`pricing.approval.${t.id}.description`, t.description);
  add(`pricing.approval.${t.id}.turnaround`, t.typicalTurnaround);
  t.requiredFromParent.forEach((r, i) => add(`pricing.approval.${t.id}.parent.${i}`, r));
  t.whatWeProvide.forEach((w, i) => add(`pricing.approval.${t.id}.provide.${i}`, w));
}

for (const opt of pricingMod.payerTypeOptions) {
  add(`pricing.payerType.${opt.id}`, opt.label);
}

pricingMod.pricingFaqs.forEach((faq, i) => {
  add(`pricing.faq.${i}.q`, faq.q);
  add(`pricing.faq.${i}.a`, faq.a);
});

pricingMod.reimbursementBenchmarks.forEach((row) => {
  add(`pricing.benchmark.${row.code}.title`, row.title);
  add(`pricing.benchmark.${row.code}.range`, row.typicalRange);
  add(`pricing.benchmark.${row.code}.notes`, row.notes);
});

const lines = Object.entries(keys)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([k, v]) => `  "${k}": "${escapeTs(v)}",`);

const out = path.join(__dirname, "_site-i18n-keys.fragment.ts");
fs.writeFileSync(
  out,
  `// AUTO-GENERATED — merge into en.ts and translate for other locales\n${lines.join("\n")}\n`
);
console.log(`Wrote ${Object.keys(keys).length} keys to ${out}`);
