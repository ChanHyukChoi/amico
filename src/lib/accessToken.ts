/** 저장·전송 전 정규화: 공백, 따옴표, 중복 `Bearer ` 제거 */
//#region functions
export function normalizeAccessToken(token: string): string {
  let t = token.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    t = t.slice(1, -1).trim();
  }
  if (/^bearer\s+/i.test(t)) {
    t = t.replace(/^bearer\s+/i, "").trim();
  }
  return t;
}
//#endregion
