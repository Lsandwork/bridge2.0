#!/usr/bin/env node
const site = process.env.SITE_URL ?? "https://www.nuviobridge.com";
const email = "lsand.work@gmail.com";
const password = "password123";

const response = await fetch(`${site}/api/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const body = await response.json().catch(() => ({}));
console.log("status:", response.status);
console.log("role:", body.user?.role ?? "(none)");
console.log("mustChangePassword:", body.user?.mustChangePassword ?? "(none)");
console.log("redirectTo:", body.redirectTo ?? body.error ?? "(none)");
