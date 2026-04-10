//#region imports
import type { TFunction } from "i18next";
//#endregion

//#region types
export type DeviceModelOption = {
  value: string;
  label: string;
  i18nKey?: string;
};
//#endregion

/**
 * 장치 모델 코드 목록(저장 값).
 * - value: API/DB에 저장되는 코드값
 * - label: 기본 표시 텍스트(번역 키가 없을 때 fallback)
 * - i18nKey: 번역 키가 있으면 이 값을 우선 표시
 */
//#region constants
export const DEVICE_VENDOR_OPTIONS: DeviceModelOption[] = [
  { value: "0", label: "0", i18nKey: "common.selectNone" },
  { value: "1", label: "HID AMICO" },
];

export const DEVICE_MODEL_OPTIONS: DeviceModelOption[] = [
  { value: "0", label: "0", i18nKey: "common.selectNone" },
  // TODO: 아래에 모델 코드를 직접 추가하세요.
  { value: "1", label: "HID AMICO VL35LF" },
  { value: "2", label: "HID AMICO VL70LF" },
];
//#endregion

//#region functions
export function getDeviceModelLabel(value: string, t: TFunction): string {
  const option = DEVICE_MODEL_OPTIONS.find((v) => v.value === value);
  if (!option) return value;
  if (option.i18nKey) return t(option.i18nKey);
  return option.label;
}
//#endregion
