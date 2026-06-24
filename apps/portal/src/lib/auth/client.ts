type AuthErrorBody = { error?: string };

export async function postAuthJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Something went wrong. Please try again in a moment.");
  }

  const data = (await res.json()) as T & AuthErrorBody;
  if (!res.ok) {
    throw new Error(data.error ?? "Request failed. Please try again.");
  }

  return data;
}
