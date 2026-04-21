import instance from "@/api/common/instance";
import { assertApiSuccess } from "@/lib/apiEnvelope";
import type { ApiResponse } from "@/types/api";
import type {
  AmicoLoginResponse,
  AmicoLogoutResponse,
} from "@/types/vendor/amico/amico";

export const loginDevice = async (deviceId: number) => {
  const { data } = await instance.post<ApiResponse<AmicoLoginResponse>>(
    `/api/devices/${deviceId}/amico/auth/login`,
  );
  assertApiSuccess(data);
  return data.data.session;
};

export const logoutDevice = async (deviceId: number) => {
  const { data } = await instance.delete<ApiResponse<AmicoLogoutResponse>>(
    `/api/devices/${deviceId}/amico/auth/logout`,
  );
  assertApiSuccess(data);
  return data.data.message;
};

export const checkSession = async (deviceId: number) => {
  const { data } = await instance.post<ApiResponse<AmicoLoginResponse>>(
    `/api/devices/${deviceId}/amico/auth/check`,
  );
  assertApiSuccess(data);
  return data.data.session;
};
