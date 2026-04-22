import instance from "../common/instance";
import { assertApiSuccess } from "@/lib/apiEnvelope";
import type { ApiResponse } from "@/types/api";
import type {
  CreateDeviceRequest,
  UpdateDeviceRequest,
  Device,
  DeviceListParams,
  UpdateDeviceStatusRequest,
} from "@/types/device";

function buildDeviceListQuery(
  params?: DeviceListParams,
): Record<string, string | number> | undefined {
  if (!params) return undefined;
  const q: Record<string, string | number> = {};
  if (params.page != null) q.page = params.page;
  if (params.pageSize != null) q.size = params.pageSize;
  const s = params.search?.trim();
  if (s) q.search = s;
  return Object.keys(q).length ? q : undefined;
}

export const fetchDevices = async (
  params?: DeviceListParams,
): Promise<ApiResponse<Device[]>> => {
  const { data } = await instance.get<ApiResponse<Device[]>>("/api/devices", {
    params: buildDeviceListQuery(params),
  });
  assertApiSuccess(data);
  if (!Array.isArray(data.data)) {
    throw new Error("Invalid devices list response: data must be an array");
  }
  return data;
};

export const getDevice = async (id: number) => {
  const { data } = await instance.get<ApiResponse<Device>>(
    `/api/devices/${id}`,
  );
  assertApiSuccess(data);
  return data.data;
};

export const createDevice = async (body: CreateDeviceRequest) => {
  const { data } = await instance.post<ApiResponse<Device>>(
    `/api/devices`,
    body,
  );
  assertApiSuccess(data);
  return data.data;
};

export const updateDevice = async (id: number, body: UpdateDeviceRequest) => {
  const { data } = await instance.put<ApiResponse<Device>>(
    `/api/devices/${id}`,
    body,
  );
  assertApiSuccess(data);
  return data.data;
};

export const deleteDevice = async (id: number) => {
  const { data } = await instance.delete<ApiResponse<Device>>(
    `/api/devices/${id}`,
  );
  assertApiSuccess(data);
  return data.data;
};

export const updateDeviceStatus = async (
  id: number,
  body: UpdateDeviceStatusRequest,
) => {
  const { data } = await instance.patch<ApiResponse<boolean>>(
    `/api/devices/${id}/status`,
    body,
  );
  assertApiSuccess(data);
  return data.data;
};
