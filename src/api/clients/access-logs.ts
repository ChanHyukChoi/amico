//#region imports
import { requestEnvelope } from "@/api/clients/client";
import type { ApiResponse, PaginatedResponse } from "@/types/common";
import type { AccessLog, AccessLogListParams } from "@/types/access-log";
//#endregion

//#region api
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
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.pageSize != null)
    searchParams.set("pageSize", String(params.pageSize));
  const query = searchParams.toString();
  const path = query
    ? `/api/hid/access-logs?${query}`
    : "/api/hid/access-logs";
  return requestEnvelope<PaginatedResponse<AccessLog>>(path);
}

/** 성공 시 서버는 `{ success: true, data: null }` */
export async function deleteAccessLog(
  id: number,
): Promise<ApiResponse<null>> {
  return requestEnvelope<null>(`/api/hid/access-logs/${id}`, {
    method: "DELETE",
  });
}
//#endregion
