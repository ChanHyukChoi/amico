export const AccessEvent = {
  INVALID_READER: 1,
  INVALID_IDENTIFICATION_RULE: 2,
  NOT_IDENTIFIED: 3,
  PENDING_IDENTIFICATION: 4,
  IDENTIFICATION_TIME_EXPIRED: 5,
  ACCESS_DENIED: 6,
  ACCESS_GRANTED: 7,
  PENDING_ACCESS: 8,
  NOT_ADMIN: 9,
  NON_IDENTIFIED_ACCESS: 10,
  ACCESS_VIA_PUSHBUTTON: 11,
  ACCESS_VIA_WEB: 12,
  NO_RESPONSE: 13,
} as const;

export type AccessEvent = (typeof AccessEvent)[keyof typeof AccessEvent];

export interface AccessLog {
  id: number; // required
  time?: number; // Unix Timestamp
  event?: AccessEvent;
  device_id?: number;
  identifier_id?: number;
  user_id?: number;
  portal_id?: number;
  identification_rule_id?: number;
  qrcode_value?: string;
  pin_value?: string;
  card_value?: number;
  confidence?: number; // 0 ~ 1800
  mask?: 0 | 1;
}

/** 접근 로그 조회 파라미터 — start/end 둘 다 없으면 서버가 최근 30일(hid-amico-server 계약) */
export interface AccessLogListParams {
  startTime?: number; // Unix Timestamp (초)
  endTime?: number; // Unix Timestamp (초)
  page?: number;
  pageSize?: number;
  event?: AccessEvent; // 선택: 특정 이벤트만
  userId?: number; // 선택: 특정 유저만
  deviceId?: number; // 선택: 특정 리더기만
}
