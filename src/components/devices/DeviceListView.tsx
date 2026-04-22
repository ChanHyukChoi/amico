//#region imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ExpandMore, MoreVert } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Checkbox,
  Stack,
  TextField,
  type Theme,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridSortModel,
} from "@mui/x-data-grid";

import {
  deleteDevice,
  fetchDevices,
  updateDeviceStatus,
} from "@/api/devices/devices";
import { DataGridRowActionsMenu } from "@/components/common/DataGridRowActionsMenu";
import { ListPageHeader } from "@/components/common/ListPageHeader";
import { useRowActionMenu } from "@/hooks/useRowActionMenu";
import { useServerPaginationPage } from "@/hooks/useServerPaginationPage";
import { useRowControlMenu } from "@/hooks/useRowControlMenu";
import {
  getDeviceModelLabel,
  getDeviceTypeLabel,
} from "@/constants/deviceModelOptions";
import type { Device, DeviceDetailRow } from "@/types/device";
import axios from "axios";
//#endregion

//#region types
const DEVICE_GRID_COLUMN_COUNT = 9;

type DeviceGridRow = Device | DeviceDetailRow;

type DeviceListViewProps = {
  onAddDevice: () => void;
  onEditDevice: (device: Device) => void;
};

//#endregion

//#region helpers
const isDeviceDetailRow = (row: DeviceGridRow): row is DeviceDetailRow => {
  return "__isDetail" in row && row.__isDetail === true;
};

function compareDevicesByField(
  a: Device,
  b: Device,
  field: string,
  direction: "asc" | "desc",
): number {
  const dir = direction === "desc" ? -1 : 1;
  switch (field) {
    case "description":
      return (
        dir *
        String(a.description).localeCompare(String(b.description), undefined, {
          sensitivity: "base",
        })
      );
    case "ip":
      return (
        dir *
        String(a.ip).localeCompare(String(b.ip), undefined, {
          sensitivity: "base",
        })
      );
    case "type":
      return (
        dir *
        String(a.type).localeCompare(String(b.type), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    case "model":
      return (
        dir *
        String(a.model).localeCompare(String(b.model), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    case "userId":
      return (
        dir *
        String(a.userId).localeCompare(String(b.userId), undefined, {
          sensitivity: "base",
        })
      );
    case "isActive": {
      const av = a.isActive ? 1 : 0;
      const bv = b.isActive ? 1 : 0;
      return dir * (av - bv);
    }
    case "updatedAt": {
      const at = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const bt = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return dir * (at - bt);
    }
    default:
      return 0;
  }
}

/** 뮤테이션 실패 시 alert용: ApiResponse.message, Axios 본문, HTTP 상태 */
function getMutationErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const d = err.response?.data;
    if (
      d &&
      typeof d === "object" &&
      "message" in d &&
      typeof (d as { message: unknown }).message === "string"
    ) {
      return (d as { message: string }).message;
    }
    const status = err.response?.status;
    if (status != null) {
      return `${err.message} (HTTP ${status})`;
    }
  }
  if (err instanceof Error) return err.message;
  return String(err);
}
//#endregion

//#region component
export default function DeviceListView({
  onAddDevice,
  onEditDevice,
}: DeviceListViewProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { page, setPage, pageSize, onPaginationModelChange } =
    useServerPaginationPage(1, 10);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [expandedDeviceIds, setExpandedDeviceIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const rowMenu = useRowActionMenu<Device>();
  const controlMenu = useRowControlMenu<Device>();

  //#region effects
  useEffect(() => {
    setExpandedDeviceIds(new Set());
  }, [page, appliedSearch]);
  //#endregion

  //#region queries
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["devices", page, pageSize, appliedSearch],
    queryFn: () =>
      fetchDevices({
        page,
        pageSize,
        search: appliedSearch || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
      rowMenu.closeMenu();
    },
  });

  const updateDeviceStatusMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: Parameters<typeof updateDeviceStatus>[1];
    }) => updateDeviceStatus(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
  //#endregion

  //#region handlers

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAppliedSearch(searchValue.trim());
    setPage(1);
  };

  const listRows = data?.data ?? [];
  const total = data?.total ?? 0;

  /** 현재 페이지 행 — 표시용 정렬만 클라이언트. */
  const sortedItems = useMemo(() => {
    const first = sortModel[0];
    if (!first?.sort || !first.field) return listRows;
    return [...listRows].sort((a, b) =>
      compareDevicesByField(a, b, first.field, first.sort as "asc" | "desc"),
    );
  }, [listRows, sortModel]);

  const gridRows = useMemo((): DeviceGridRow[] => {
    const out: DeviceGridRow[] = [];
    for (const d of sortedItems) {
      out.push(d);
      if (expandedDeviceIds.has(d.id)) {
        out.push({ id: `detail-${d.id}`, __isDetail: true, parent: d });
      }
    }
    return out;
  }, [sortedItems, expandedDeviceIds]);

  const toggleDeviceExpanded = useCallback((deviceId: number) => {
    setExpandedDeviceIds((prev) => {
      const next = new Set(prev);
      if (next.has(deviceId)) next.delete(deviceId);
      else next.add(deviceId);
      return next;
    });
  }, []);

  const handleEdit = () => {
    if (rowMenu.selectedRow) onEditDevice(rowMenu.selectedRow);
    rowMenu.closeMenu();
  };

  const handleDelete = () => {
    if (rowMenu.selectedRow && window.confirm(t("devices.deleteConfirm"))) {
      deleteMutation.mutate(rowMenu.selectedRow.id);
    } else {
      rowMenu.closeMenu();
    }
  };

  const handleActiveChange = useCallback(
    (deviceId: number, isActive: boolean) => {
      const ok = window.confirm(
        isActive
          ? t("devices.setActiveConfirm")
          : t("devices.setInactiveConfirm"),
      );
      if (!ok) return;
      updateDeviceStatusMutation.mutate({
        id: deviceId,
        body: { isActive },
      });
    },
    [t, updateDeviceStatusMutation.mutate],
  );
  //#endregion

  const columns = useMemo<GridColDef<DeviceGridRow>[]>(
    () => [
      {
        field: "toggleDetails",
        headerName: "",
        width: 52,
        minWidth: 52,
        maxWidth: 52,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "center",
        display: "flex",
        valueGetter: () => null,
        colSpan: (_value, row) =>
          isDeviceDetailRow(row) ? DEVICE_GRID_COLUMN_COUNT : 1,
        renderCell: (params: GridRenderCellParams<DeviceGridRow>) => {
          if (isDeviceDetailRow(params.row)) {
            return (
              <Box
                component="div"
                sx={{
                  width: "100%",
                  py: 1.5,
                  boxSizing: "border-box",
                  borderTop: 1,
                  borderColor: "divider",
                  bgcolor: "grey.200",
                }}
              >
                <Stack direction="row" spacing={1}>
                  <Button sx={{ bgcolor: "red" }}>a</Button>
                  <Button sx={{ bgcolor: "blue" }}>b</Button>
                </Stack>
              </Box>
            );
          }
          const device = params.row;
          const open = expandedDeviceIds.has(device.id);
          return (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleDeviceExpanded(device.id);
              }}
              aria-label={
                open ? t("devices.collapseDetails") : t("devices.expandDetails")
              }
              aria-expanded={open}
            >
              {open ? (
                <ExpandMore fontSize="small" />
              ) : (
                <ChevronRight fontSize="small" />
              )}
            </IconButton>
          );
        },
      },
      {
        field: "description",
        headerName: t("devices.description"),
        flex: 1,
        minWidth: 80,
        valueGetter: (value, row) =>
          isDeviceDetailRow(row) ? "" : (value ?? row.description),
      },
      {
        field: "ip",
        headerName: t("devices.ip"),
        flex: 1,
        minWidth: 50,
        valueGetter: (value, row) =>
          isDeviceDetailRow(row) ? "" : (value ?? row.ip),
      },
      {
        field: "type",
        headerName: t("devices.type"),
        flex: 1,
        minWidth: 50,
        valueGetter: (value, row) =>
          isDeviceDetailRow(row)
            ? ""
            : getDeviceTypeLabel(String(value ?? row.type ?? ""), t),
      },
      {
        field: "model",
        headerName: t("devices.model"),
        flex: 1,
        minWidth: 50,
        valueGetter: (value, row) =>
          isDeviceDetailRow(row)
            ? ""
            : getDeviceModelLabel(
                String(row.type ?? ""),
                String(value ?? row.model ?? ""),
                t,
              ),
      },
      {
        field: "userId",
        headerName: t("devices.userId"),
        flex: 1,
        minWidth: 50,
        valueGetter: (value, row) =>
          isDeviceDetailRow(row) ? "" : (value ?? row.userId),
      },
      {
        field: "isActive",
        headerName: t("devices.isActive"),
        flex: 1,
        minWidth: 50,
        valueGetter: (value, row) =>
          isDeviceDetailRow(row) ? "" : (value ?? row.isActive),
        renderCell: (params: GridRenderCellParams<DeviceGridRow>) => {
          const row = params.row;
          if (isDeviceDetailRow(row)) return null;
          return (
            <Checkbox
              checked={row.isActive ?? false}
              onChange={(e) => handleActiveChange(row.id, e.target.checked)}
            />
          );
        },
      },
      {
        field: "actions",
        headerName: t("devices.actions"),
        width: 56,
        sortable: false,
        filterable: false,
        flex: 1,
        renderCell: (params: GridRenderCellParams<DeviceGridRow>) => {
          const row = params.row;
          if (isDeviceDetailRow(row)) return null;
          return (
            <IconButton
              size="small"
              onClick={(e) => rowMenu.openMenu(e, row)}
              aria-label={t("devices.actions")}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          );
        },
      },
    ],
    [
      t,
      onEditDevice,
      rowMenu.openMenu,
      expandedDeviceIds,
      toggleDeviceExpanded,
      handleActiveChange,
    ],
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        flex: 1,
        minHeight: 0,
      }}
    >
      <ListPageHeader
        title={t("devices.list")}
        actionLabel={t("devices.addDevice")}
        onAction={onAddDevice}
      />
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ display: "flex", gap: 1, alignItems: "center" }}
      >
        <TextField
          name="search"
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t("common.search")}
          size="small"
          sx={{ maxWidth: 280 }}
        />
        <Button type="submit" variant="outlined">
          {t("common.search")}
        </Button>
      </Box>

      {isError && (
        <Box sx={{ color: "error.main", py: 1 }}>
          {error instanceof Error ? error.message : String(error)}
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ color: "text.secondary", py: 4 }}>{t("common.loading")}</Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 300, width: "100%" }}>
          <DataGrid
            rows={gridRows}
            columns={columns}
            getRowId={(row) => row.id}
            getRowClassName={(params) =>
              isDeviceDetailRow(params.row as DeviceGridRow)
                ? "device-list-detail-row"
                : ""
            }
            getRowHeight={({ model }) =>
              isDeviceDetailRow(model as DeviceGridRow) ? "auto" : 52
            }
            pagination
            paginationMode="server"
            rowCount={total}
            paginationModel={{
              page: page - 1,
              pageSize,
            }}
            onPaginationModelChange={onPaginationModelChange}
            pageSizeOptions={[10, 25, 50]}
            sortingMode="client"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            loading={isLoading}
            disableRowSelectionOnClick
            localeText={{
              noRowsLabel: t("devices.noData"),
            }}
            sx={{
              "& .MuiDataGrid-cell:focus": { outline: "none" },
              /* 기본 셀의 text-overflow: ellipsis가 아이콘·인접 텍스트에 잘림/점(…) 조각으로 보이는 현상 방지 */
              "& .MuiDataGrid-columnHeader[data-field='toggleDetails']": {
                px: 0,
              },
              "& .MuiDataGrid-row:not(.device-list-detail-row) .MuiDataGrid-cell[data-field='toggleDetails']":
                {
                  px: 0,
                  textOverflow: "clip",
                  justifyContent: "center",
                },
              "& .device-list-detail-row .MuiDataGrid-cell": {
                borderBottomColor: "transparent",
                px: 0,
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: (theme: Theme) =>
                  theme.palette.mode === "light"
                    ? theme.palette.grey[100]
                    : theme.palette.grey[900],
              },
            }}
          />
        </Box>
      )}

      <DataGridRowActionsMenu
        anchorEl={rowMenu.anchorEl}
        open={rowMenu.menuOpen}
        onClose={rowMenu.closeMenu}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Box>
  );
}
//#endregion
