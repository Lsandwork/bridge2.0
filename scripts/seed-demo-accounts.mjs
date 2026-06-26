#!/usr/bin/env node
/**
 * Ensures all @demo.com Supabase auth users can sign in with password123.
 * Demo accounts authenticate through the local demo path when possible;
 * this script resets any Supabase copies that may exist from earlier seeds.
 */
import { createClient } from "@supabase/supabase-js";

const DEMO_EMAILS = [
  "caregiver@demo.com",
  "casemanager@demo.com",
  "user@demo.com",
];
const DEMO_PASSWORD = "password123";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

for (const email of DEMO_EMAILS) {
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const user = list.users.find((row) => row.email?.toLowerCase() === email);
  if (!user) {
    console.log(`skip ${email} (not in Supabase auth — uses local demo login)`);
    continue;
  }
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (error) {
    console.error(`failed ${email}:`, error.message);
  } else {
    console.log(`reset ${email}`);
  }
}

console.log("Demo account password reset complete.");
