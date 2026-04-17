//#region imports
import type { TFunction } from "i18next";
//#endregion

//#region types
/** 백엔드 `Device.type`과 동일한 식별자 (숫자). */
export const DEVICE_TYPE_IDS = [1, 2] as const;
export type DeviceTypeId = (typeof DEVICE_TYPE_IDS)[number];

export type DeviceTypeDef = {
  id: DeviceTypeId;
  label: string;
  i18nKey?: string;
};

/**
 * 셀렉트 / API 저장용 옵션.
 * - value: API/DB에 저장되는 문자열 (type은 `"1"`처럼 id 문자열)
 * - label: 기본 표시 텍스트
 * - i18nKey: 있으면 `t(i18nKey)` 우선
 */
export type DeviceModelOption = {
  value: string;
  label: string;
  i18nKey?: string;
};
//#endregion

//#region definitions
/** 유형(vendor) — 백엔드 type 값과 `id`가 대응됩니다. */
export const DEVICE_TYPES: readonly DeviceTypeDef[] = [
  { id: 1, label: "HID AMICO" },
  { id: 2, label: "Suprema" },
];

/**
 * 유형별 모델 목록. `value`는 해당 유형 안에서만 유일하면 됩니다.
 * 새 유형/모델은 여기만 추가하면 됩니다.
 */
export const DEVICE_MODELS_BY_TYPE: Record<DeviceTypeId, DeviceModelOption[]> = {
  1: [
    { value: "1", label: "HID AMICO VL35LF" },
    { value: "2", label: "HID AMICO VL70LF" },
  ],
  2: [
    { value: "1", label: "FaceStation 2" },
    { value: "2", label: "BioStation 3" },
  ],
};

export const DEVICE_TYPE_SELECT_PLACEHOLDER: DeviceModelOption = {
  value: "",
  label: "",
  i18nKey: "common.selectNone",
};

export const DEVICE_MODEL_SELECT_PLACEHOLDER: DeviceModelOption = {
  value: "",
  label: "",
  i18nKey: "common.selectNone",
};
//#endregion

//#region select options
export function getDeviceTypeSelectOptions(): DeviceModelOption[] {
  return [
    DEVICE_TYPE_SELECT_PLACEHOLDER,
    ...DEVICE_TYPES.map((row) => ({
      value: String(row.id),
      label: row.label,
      i18nKey: row.i18nKey,
    })),
  ];
}

/** 유형에 맞는 모델 정의만 (플레이스홀더 없음). 표시/검증 조회용. */
export function getDeviceModelDefinitionsForType(
  typeValue: string,
): DeviceModelOption[] {
  const id = Number(typeValue);
  if (!Number.isInteger(id) || !DEVICE_TYPE_IDS.includes(id as DeviceTypeId)) {
    return [];
  }
  return DEVICE_MODELS_BY_TYPE[id as DeviceTypeId] ?? [];
}

/** 폼 셀렉트용: 플레이스홀더 + 해당 유형 모델. */
export function getDeviceModelSelectOptions(
  typeValue: string,
): DeviceModelOption[] {
  return [
    DEVICE_MODEL_SELECT_PLACEHOLDER,
    ...getDeviceModelDefinitionsForType(typeValue),
  ];
}
//#endregion

//#region labels
function optionLabel(option: DeviceModelOption, t: TFunction): string {
  if (option.i18nKey) return t(option.i18nKey);
  return option.label;
}

export function getDeviceTypeLabel(typeValue: string, t: TFunction): string {
  if (!typeValue) return "";
  const id = Number(typeValue);
  const def = DEVICE_TYPES.find((row) => row.id === id);
  if (!def) return typeValue;
  if (def.i18nKey) return t(def.i18nKey);
  return def.label;
}

/**
 * 유형 + 모델 저장값으로 표시 라벨. (목록/상세에서 사용)
 * 알 수 없는 조합은 `modelValue`를 그대로 반환합니다.
 */
export function getDeviceModelLabel(
  typeValue: string,
  modelValue: string,
  t: TFunction,
): string {
  if (!modelValue) return "";
  const option = getDeviceModelDefinitionsForType(typeValue).find(
    (m) => m.value === modelValue,
  );
  if (!option) return modelValue;
  return optionLabel(option, t);
}
//#endregion

//#region legacy flat exports
/** 목록/검색 등 단순 나열이 필요할 때만 사용. 폼은 `getDeviceTypeSelectOptions` 권장. */
export const DEVICE_VENDOR_OPTIONS: DeviceModelOption[] =
  getDeviceTypeSelectOptions();

/**
 * 모든 유형의 모델을 한 배열로 펼친 것 (디버그·레거시용).
 * 동일 `value`가 유형마다 있을 수 있어, 표시에는 `getDeviceModelLabel(type, model, t)` 사용.
 */
export const DEVICE_MODEL_OPTIONS: DeviceModelOption[] =
  DEVICE_TYPE_IDS.flatMap((id) => DEVICE_MODELS_BY_TYPE[id]);
//#endregion
