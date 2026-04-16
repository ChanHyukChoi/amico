//#region imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ExpandMore, MoreVert } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
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

import { fetchDevices } from "@/api/devices/devices";
import { DataGridRowActionsMenu } from "@/components/common/DataGridRowActionsMenu";
import { ListPageHeader } from "@/components/common/ListPageHeader";
import { useRowActionMenu } from "@/hooks/useRowActionMenu";
import { useServerPaginationPage } from "@/hooks/useServerPaginationPage";
import type { Device, DeviceDetailRow } from "@/types/device";

//#endregion

//#region types
const DEVICE_GRID_COLUMN_COUNT = 6;

type DeviceGridRow = Device | DeviceDetailRow;

type DeviceListViewProps = {
  onAddDevice: () => void;
  onEditDevice: (deviceId: number) => void;
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
  }
  return 0;
}
//#endregion

//#region component
export default function DeviceListView({
  onAddDevice,
  onEditDevice,
}: DeviceListViewProps) {
  const { t } = useTranslation();
  const { page, setPage, pageSize, onPaginationModelChange } =
    useServerPaginationPage(1, 10);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [expandedDeviceIds, setExpandedDeviceIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const rowMenu = useRowActionMenu<Device>();

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
          isDeviceDetailRow(row) ? "" : (value ?? row.type),
      },
      {
        field: "model",
        headerName: t("devices.model"),
        flex: 1,
        minWidth: 50,
        valueGetter: (value, row) =>
          isDeviceDetailRow(row) ? "" : (value ?? row.model),
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
      },
      {
        field: "contorls",
        headerName: "제어",
        width: 56,
        sortable: false,
        filterable: false,
        flex: 1,
        renderCell: (params: GridRenderCellParams<DeviceGridRow>) => {
          const device = params.row;
          if (isDeviceDetailRow(device)) return null;
          return (
            <IconButton
              size="small"
              onClick={(e) => rowMenu.openMenu(e, device)}
              aria-label={t("devices.controls")}
            >
              <MoreVert fontSize="small" />
            </IconButton>
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
          const device = params.row;
          if (isDeviceDetailRow(device)) return null;
          return (
            <IconButton
              size="small"
              onClick={(e) => rowMenu.openMenu(e, device)}
              aria-label={t("devices.actions")}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          );
        },
      },
    ],
    [t],
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
    </Box>
  );
}
//#endregion
