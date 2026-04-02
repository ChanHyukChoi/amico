/**
 * Bearer 토큰이 JWT 형식이고 payload에 exp가 있으면, 클라이언트 시각 기준 만료 여부.
 * JWT가 아니거나 exp가 없으면 false — 서버·401 처리에 맡김.
 */
export function isJwtExpiredOnClient(token: string): boolean {
  const expSec = getJwtExpirationUnix(token);
  if (expSec == null) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return expSec <= nowSec;
}

function getJwtExpirationUnix(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const segment = parts[1];
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const pad = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(pad);
    const json = atob(padded);
    const payload = JSON.parse(json) as { exp?: unknown };
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
      return null;
    }
    return payload.exp;
  } catch {
    return null;
  }
}
