//#region imports
import type { TFunction } from "i18next";
//#endregion

//#region constants
const I18N_PREFIX = "apiErrors";
//#endregion

/** `apiErrors.<CODE>` 키가 있으면 사용, 없으면 UNKNOWN + status 힌트 */
//#region api
export function getApiErrorMessage(
  t: TFunction,
  code: string,
  status?: number,
): string {
  const key = `${I18N_PREFIX}.${code}`;
  const translated = t(key);
  if (translated !== key) {
    return translated;
  }
  const detail =
    status !== undefined && status !== 0 ? t("apiErrors.httpDetail", { status }) : "";
  return `${t("apiErrors.UNKNOWN")}${detail}`;
}
//#endregion
