import { apiFetch } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common";
import type { AccessLog, AccessLogListParams } from "@/types/access-log";

export async function fetchAccessLogs(
  params?: AccessLogListParams,
): Promise<ApiResponse<PaginatedResponse<AccessLog>>> {
  const searchParams = new URLSearchParams();
  if (params?.startTime != null)
    searchParams.set("startTime", String(params.startTime));
  if (params?.endTime != null)
    searchParams.set("endTime", String(params.endTime));
  if (params?.event != null) searchParams.set("event", String(params.event));
  if (params?.userId != null)
    searchParams.set("userId", String(params.userId));
  if (params?.deviceId != null)
    searchParams.set("deviceId", String(params.deviceId));
  const query = searchParams.toString();
  const path = query ? `/api/hid/access-logs?${query}` : "/api/hid/access-logs";
  const res = await apiFetch(path);
  return res.json() as Promise<ApiResponse<PaginatedResponse<AccessLog>>>;
}

export async function deleteAccessLog(
  id: number,
): Promise<ApiResponse<void>> {
  const res = await apiFetch(`/api/hid/access-logs/${id}`, {
    method: "DELETE",
  });
  return res.json() as Promise<ApiResponse<void>>;
}
