#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const email = "lsand.work@gmail.com";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error("Missing Supabase env vars in apps/portal/.env.local");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findAuthUser() {
  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

async function main() {
  const authUser = await findAuthUser();
  console.log("auth_user_exists:", Boolean(authUser));
  if (authUser) {
    console.log("auth_user_id:", authUser.id);
    console.log("auth_metadata_role:", authUser.user_metadata?.role ?? "(missing)");
    console.log("auth_metadata_must_change:", authUser.user_metadata?.must_change_password ?? false);
  }

  const { data: row, error } = await admin
    .from("users")
    .select("id,email,full_name,role,onboarding_complete")
    .eq("email", email)
    .maybeSingle();
  if (error) {
    console.log("users_row_error:", error.message);
  } else {
    console.log("users_row_exists:", Boolean(row));
    if (row) {
      console.log("users_row_role:", row.role);
      console.log("users_row_name:", row.full_name);
    }
  }

  const { error: loginError } = await anon.auth.signInWithPassword({
    email,
    password: "password123",
  });
  console.log("login_with_temp_password:", loginError ? `failed: ${loginError.message}` : "ok");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
