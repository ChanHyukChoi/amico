//#region imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  ExpandMore,
  MoreVert,
  Settings,
} from "@mui/icons-material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridSortModel,
} from "@mui/x-data-grid";
import {
  Button,
  TextField,
  Box,
  IconButton,
  MenuItem,
  type Theme,
  Stack,
} from "@mui/material";
import { fetchDevices, deleteDevice } from "@/api/devices";
import { useRowActionMenu } from "@/hooks/useRowActionMenu";
import { useServerPaginationPage } from "@/hooks/useServerPaginationPage";
import { DataGridRowActionsMenu } from "@/components/common/DataGridRowActionsMenu";
import { ListPageHeader } from "@/components/common/ListPageHeader";
import { getDeviceModelLabel } from "@/constants/deviceModelOptions";
import type { Device, DeviceDetailRow } from "@/types/device";

//#endregion

//#region types
const DEVICE_GRID_COLUMN_COUNT = 8;

type DeviceGridRow = Device | DeviceDetailRow;

type DeviceListViewProps = {
  onAddDevice: () => void;
  onEditDevice: (deviceId: number) => void;
};

//#endregion

//#region helpers

function isDeviceDetailRow(row: DeviceGridRow): row is DeviceDetailRow {
  return "__isDetail" in row && row.__isDetail === true;
}

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
          numeric: true,
          sensitivity: "base",
        })
      );
    case "ip":
      return (
        dir *
        String(a.ip).localeCompare(String(b.ip), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    case "type":
      return (
        dir *
        String(a.type).localeCompare(String(b.type), undefined, {
          sensitivity: "base",
        })
      );
    case "model":
      return (
        dir *
        String(a.model).localeCompare(String(b.model), undefined, {
          sensitivity: "base",
        })
      );
    case "userId":
      return (
        dir *
        String(a.userId).localeCompare(String(b.userId), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    case "isActive":
      return (
        dir *
        String(a.isActive).localeCompare(String(b.isActive), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    default:
      return 0;
  }
}
//#endregion

//#region component
export default function DeviceListView({
  onAddDevice,
  onEditDevice,
}: DeviceListViewProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { page, setPage, onPaginationModelChange } = useServerPaginationPage(1);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [expandedDeviceIds, setExpandedDeviceIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const rowMenu = useRowActionMenu<Device>();

  useEffect(() => {
    setExpandedDeviceIds(new Set());
  }, [page, appliedSearch]);

  //#region queries
  const { data, isLoading } = useQuery({
    queryKey: ["devices", page, appliedSearch],
    queryFn: () =>
      fetchDevices({ page, pageSize: 10, search: appliedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["devices"] });
      }
      rowMenu.closeMenu();
    },
  });
  //#endregion

  //#region handlers
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAppliedSearch(searchValue.trim());
    setPage(1);
  };

  const total = data?.success && data.data ? data.data.total : 0;
  const items = data?.success && data.data ? data.data.items : [];
  const pageSize = 10;

  const sortedItems = useMemo(() => {
    const first = sortModel[0];
    if (!first?.sort || !first.field) return items;
    return [...items].sort((a, b) =>
      compareDevicesByField(a, b, first.field, first.sort as "asc" | "desc"),
    );
  }, [items, sortModel]);
  const gridRows = useMemo((): DeviceGridRow[] => {
    const out: DeviceGridRow[] = [];
    for (const d of sortedItems) {
      out.push(d);
      if (expandedDeviceIds.has(d.id)) {
        out.push({
          id: `detail-${d.id}`,
          __isDetail: true,
          parent: d,
        });
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
    if (rowMenu.selectedRow) onEditDevice(rowMenu.selectedRow.id);
    rowMenu.closeMenu();
  };

  const handleDelete = () => {
    if (rowMenu.selectedRow && window.confirm(t("devices.deleteConfirm"))) {
      deleteMutation.mutate(rowMenu.selectedRow.id);
    } else {
      rowMenu.closeMenu();
    }
  };

  const handleSettings = () => {
    if (rowMenu.selectedRow) {
      navigate(`/devices/${rowMenu.selectedRow.id}/settings`);
    }
    rowMenu.closeMenu();
  };
  //#endregion

  //#region grid
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
                <Stack direction="row" sx={{ mt: 1, ml: 1 }}>
                  <Button variant="contained" size="small">
                    Token
                  </Button>
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
        minWidth: 120,
        renderCell: (params: GridRenderCellParams<DeviceGridRow>) => {
          const row = params.row;
          if (isDeviceDetailRow(row)) return null;
          return (
            <Button
              variant="text"
              size="small"
              sx={{ textTransform: "none", fontWeight: 600 }}
              onClick={() => onEditDevice(row.id)}
            >
              {row.description}
            </Button>
          );
        },
      },
      {
        field: "ip",
        headerName: t("devices.ip"),
        flex: 1,
        minWidth: 120,
        valueGetter: (_, row) => (isDeviceDetailRow(row) ? "" : row.ip),
      },
      {
        field: "type",
        headerName: t("devices.type"),
        flex: 0.8,
        minWidth: 90,
        valueGetter: (_, row) => (isDeviceDetailRow(row) ? "" : row.type),
      },
      {
        field: "model",
        headerName: t("devices.model"),
        flex: 1,
        minWidth: 100,
        valueGetter: (_, row) => (isDeviceDetailRow(row) ? "" : row.model),
        renderCell: (params: GridRenderCellParams<DeviceGridRow>) => {
          const row = params.row;
          if (isDeviceDetailRow(row)) return null;
          return getDeviceModelLabel(String(row.model ?? ""), t);
        },
      },
      {
        field: "userId",
        headerName: t("devices.userId"),
        flex: 0.8,
        minWidth: 100,
        valueGetter: (_, row) => (isDeviceDetailRow(row) ? "" : row.userId),
      },
      {
        field: "isActive",
        headerName: t("devices.isActive"),
        flex: 0.8,
        minWidth: 100,
        valueGetter: (_, row) =>
          isDeviceDetailRow(row) ? "" : String(row.isActive),
      },
      {
        field: "actions",
        headerName: t("devices.actions"),
        width: 56,
        sortable: false,
        filterable: false,
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
    ],
  );
  //#endregion

  //#region render
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
          placeholder={t("devices.search")}
          size="small"
          sx={{ maxWidth: 280 }}
        />
        <Button type="submit" variant="outlined">
          {t("devices.search")}
        </Button>
      </Box>

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
            paginationMode="server"
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            rowCount={total}
            paginationModel={{
              page: page - 1,
              pageSize,
            }}
            onPaginationModelChange={onPaginationModelChange}
            pageSizeOptions={[10, 25, 50]}
            loading={isLoading}
            disableRowSelectionOnClick
            localeText={{
              noRowsLabel: t("devices.noData"),
            }}
            sx={{
              "& .MuiDataGrid-cell:focus": { outline: "none" },
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
        extra={
          <MenuItem onClick={handleSettings}>
            <Settings fontSize="small" sx={{ mr: 1 }} />
            {t("devices.rowMenuSettings")}
          </MenuItem>
        }
      />
    </Box>
  );
  //#endregion
}

//#endregion
