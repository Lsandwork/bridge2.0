#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(join(root, "apps/portal/.env.local"));
loadEnvFile(join(root, ".env.local"));

const email = "lsand.work@gmail.com";
const password = "password123";
const name = "Lonnie Admin";
const role = "super_admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in apps/portal/.env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function ensureMustChangePasswordColumn() {
  // Best-effort: migration may already be applied in Supabase.
  const { error } = await admin.rpc("exec_sql", {
    query: "alter table users add column if not exists must_change_password boolean not null default false",
  });
  if (error && !error.message.includes("does not exist")) {
    // Column is added via migration; ignore if RPC is unavailable.
  }
}

async function findAuthUserIdByEmail(targetEmail) {
  let page = 1;
  const perPage = 200;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    const match = data.users.find((user) => user.email?.toLowerCase() === targetEmail);
    if (match) return match.id;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function main() {
  await ensureMustChangePasswordColumn();

  const normalized = email.trim().toLowerCase();
  const { data: existingRow, error: existingError } = await admin
    .from("users")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();
  if (existingError && !existingError.message.includes("must_change_password")) {
    throw new Error(existingError.message);
  }

  let userId = existingRow?.id ?? (await findAuthUserIdByEmail(normalized));

  if (userId) {
    const { data: currentAuth, error: currentAuthError } = await admin.auth.admin.getUserById(userId);
    if (currentAuthError) throw new Error(currentAuthError.message);
    const existingMeta = currentAuth.user?.user_metadata ?? {};

    const { error: authError } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: {
        ...existingMeta,
        full_name: name,
        role,
        must_change_password: true,
      },
    });
    if (authError) throw new Error(authError.message);
    console.log(`Updated existing auth user ${normalized}`);
  } else {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalized,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, role, must_change_password: true },
    });
    if (createError || !created.user) {
      throw new Error(createError?.message ?? "Could not create auth user.");
    }
    userId = created.user.id;
    console.log(`Created auth user ${normalized}`);
  }

  const profilePayload = {
    id: userId,
    email: normalized,
    full_name: name,
    role,
    onboarding_complete: true,
    must_change_password: true,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await admin.from("users").upsert(profilePayload, { onConflict: "id" });
  if (upsertError) {
    if (upsertError.message.includes("must_change_password")) {
      const { error: fallbackError } = await admin.from("users").upsert(
        {
          id: userId,
          email: normalized,
          full_name: name,
          role,
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (fallbackError) throw new Error(fallbackError.message);
      console.warn(
        "Created user profile without must_change_password column. Apply migration 20260626150000_admin_must_change_password.sql in Supabase."
      );
    } else {
      throw new Error(upsertError.message);
    }
  }

  console.log(`Platform admin ready: ${normalized}`);
  console.log(`Role: ${role}`);
  console.log("Temporary password set. User must change password on first login.");

  const { error: loginError } = await createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).auth.signInWithPassword({ email: normalized, password });
  if (loginError) {
    throw new Error(`Password reset succeeded but login verification failed: ${loginError.message}`);
  }
  console.log("Login verification: ok");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
