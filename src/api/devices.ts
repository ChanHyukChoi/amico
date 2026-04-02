import { requestEnvelope } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common";
import type {
  Device,
  DeviceListParams,
  CreateDeviceRequest,
  UpdateDeviceRequest,
} from "@/types/device";

export async function fetchDevices(
  params?: DeviceListParams,
): Promise<ApiResponse<PaginatedResponse<Device>>> {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.pageSize != null)
    searchParams.set("pageSize", String(params.pageSize));
  if (params?.search) searchParams.set("search", params.search);
  const query = searchParams.toString();
  const path = query ? `/api/devices?${query}` : "/api/devices";
  return requestEnvelope<PaginatedResponse<Device>>(path);
}

export async function fetchDevice(id: number): Promise<ApiResponse<Device>> {
  return requestEnvelope<Device>(`/api/devices/${id}`);
}

export async function createDevice(
  body: CreateDeviceRequest,
): Promise<ApiResponse<Device>> {
  return requestEnvelope<Device>("/api/devices", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateDevice(
  id: number,
  body: UpdateDeviceRequest,
): Promise<ApiResponse<Device>> {
  return requestEnvelope<Device>(`/api/devices/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteDevice(id: number): Promise<ApiResponse<void>> {
  return requestEnvelope<void>(`/api/devices/${id}`, { method: "DELETE" });
}

/** AMICO 세션: POST /api/devices/{id}/connect (Bearer는 client에서 자동) */
export async function connectDevice(id: number): Promise<ApiResponse<null>> {
  return requestEnvelope<null>(`/api/devices/${id}/connect`, {
    method: "POST",
  });
}
