import { createHmac, timingSafeEqual } from "node:crypto";

export type VideoPlayTokenPayload = {
  sid: string;
  pid: string;
  vid: string;
  yid: string;
  title: string;
  startedAt: string;
};

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

function secret(): string {
  return (
    process.env.VIDEO_SESSION_SECRET ??
    process.env.SESSION_SECRET ??
    "bridge-dev-video-session-secret"
  );
}

export function createVideoPlayToken(payload: VideoPlayTokenPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyVideoPlayToken(token: string): VideoPlayTokenPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");

  try {
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as VideoPlayTokenPayload;

    if (
      !payload.sid ||
      !payload.pid ||
      !payload.vid ||
      !payload.yid ||
      !payload.title ||
      !payload.startedAt
    ) {
      return null;
    }

    const age = Date.now() - new Date(payload.startedAt).getTime();
    if (!Number.isFinite(age) || age < 0 || age > TOKEN_TTL_MS) return null;

    return payload;
  } catch {
    return null;
  }
}
