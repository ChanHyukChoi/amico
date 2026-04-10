//#region imports

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  Button,
  TextField,
  Box,
  IconButton,
  MenuItem,
  type Theme,
  Stack,
  Typography,
} from "@mui/material";
import {
  ChevronRight,
  ExpandMore,
  MoreVert,
  Settings,
} from "@mui/icons-material";
import { useMemo, useState, useEffect, useCallback } from "react";
import { fetchDevices, deleteDevice } from "@/api/devices";
import { connectAmicoDevice } from "@/api/vendors/amico";
import { getApiErrorMessage } from "@/api/apiErrorMessages";
import type { Device, DeviceDetailRow } from "@/types/device";
import { useRowActionMenu } from "@/hooks/useRowActionMenu";
import { useServerPaginationPage } from "@/hooks/useServerPaginationPage";
import { DataGridRowActionsMenu } from "@/components/common/DataGridRowActionsMenu";
import { ListPageHeader } from "@/components/common/ListPageHeader";
import { DeviceControlActionsMenu } from "@/components/common/DeviceControlActionsMenu";
import { getDeviceModelLabel } from "@/constants/deviceModelOptions";

//#endregion

const DEVICE_GRID_COLUMN_COUNT = 9;

type DeviceGridRow = Device | DeviceDetailRow;

function isDeviceDetailRow(row: DeviceGridRow): row is DeviceDetailRow {
  return "__isDetail" in row && row.__isDetail === true;
}

type DeviceListViewProps = {
  onAddDevice: () => void;
  onEditDevice: (deviceId: number) => void;
};

export default function DeviceListView({
  onAddDevice,
  onEditDevice,
}: DeviceListViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { page, setPage, onPaginationModelChange } = useServerPaginationPage(1);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [deviceSessionsById, setDeviceSessionsById] = useState<
    Record<number, string>
  >({});
  const [expandedDeviceIds, setExpandedDeviceIds] = useState<Set<number>>(
    () => new Set(),
  );
  const controlMenu = useRowActionMenu<Device>();
  const rowMenu = useRowActionMenu<Device>();

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

  useEffect(() => {
    setExpandedDeviceIds(new Set());
  }, [page, appliedSearch]);

  const connectMutation = useMutation({
    mutationFn: connectAmicoDevice,
    onSuccess: (res, deviceId) => {
      if (!res.success) {
        window.alert(getApiErrorMessage(t, res.code, res.status));
        return;
      }
      const session = res.data?.session;
      if (typeof session === "string" && session.trim().length > 0) {
        setDeviceSessionsById((prev) => ({ ...prev, [deviceId]: session }));
      }
    },
  });
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAppliedSearch(searchValue.trim());
    setPage(1);
  };

  const total = data?.success && data.data ? data.data.total : 0;
  const items = data?.success && data.data ? data.data.items : [];
  const pageSize = 10;

  const toggleDeviceExpanded = useCallback((deviceId: number) => {
    setExpandedDeviceIds((prev) => {
      const next = new Set(prev);
      if (next.has(deviceId)) next.delete(deviceId);
      else next.add(deviceId);
      return next;
    });
  }, []);

  const gridRows = useMemo((): DeviceGridRow[] => {
    const out: DeviceGridRow[] = [];
    for (const d of items) {
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
  }, [items, expandedDeviceIds]);

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

  const handleConnect = () => {
    if (controlMenu.selectedRow) {
      connectMutation.mutate(controlMenu.selectedRow.id);
    }
    controlMenu.closeMenu();
  };

  const handleRestart = () => {
    if (controlMenu.selectedRow) {
      //restartDevice(controlMenu.selectedRow.id);
    }
    controlMenu.closeMenu();
  };

  const handleReset = () => {
    if (controlMenu.selectedRow) {
      //resetDevice(controlMenu.selectedRow.id);
    }
    controlMenu.closeMenu();
  };

  const handleUpdate = () => {
    if (controlMenu.selectedRow) {
      //updateDevice(controlMenu.selectedRow.id);
    }
    controlMenu.closeMenu();
  };

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
            const deviceId = params.row.parent.id;
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
                <Stack direction="row" sx={{ gap: 1, ml: 1 }}>
                  <Button
                    variant="contained"
                    color="error"
                    disabled={
                      connectMutation.isPending &&
                      connectMutation.variables === deviceId
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deviceSessionsById[deviceId]) {
                        window.alert("이미 토큰(session)을 보유 중입니다.");
                        return;
                      }
                      connectMutation.mutate(deviceId);
                    }}
                  >
                    Token
                  </Button>
                  <Typography
                    variant="body2"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    title={deviceSessionsById[deviceId] ?? ""}
                    sx={{
                      bgcolor: "black",
                      color: "white",
                      px: 1,
                      borderRadius: 0.5,
                      fontFamily: "monospace",
                      minHeight: 32,
                      maxWidth: 360,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {deviceSessionsById[deviceId] ?? ""}
                  </Typography>
                </Stack>
                <Stack direction="row" sx={{ gap: 1, mt: 1, ml: 1 }}>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={!deviceSessionsById[deviceId]}
                  >
                    Check
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
        valueGetter: (value, row) =>
          isDeviceDetailRow(row) ? "" : (value ?? row.description),
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
          if (isDeviceDetailRow(params.row)) return null;
          return getDeviceModelLabel(String(params.value ?? ""), t);
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
        field: "controls",
        headerName: t("devices.controls"),
        width: 56,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<DeviceGridRow>) => {
          if (isDeviceDetailRow(params.row)) return null;
          return (
            <IconButton
              size="small"
              onClick={(e) => controlMenu.openMenu(e, params.row as Device)}
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
        renderCell: (params: GridRenderCellParams<DeviceGridRow>) => {
          if (isDeviceDetailRow(params.row)) return null;
          return (
            <IconButton
              size="small"
              onClick={(e) => rowMenu.openMenu(e, params.row as Device)}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          );
        },
      },
    ],
    [
      t,
      navigate,
      onEditDevice,
      rowMenu.openMenu,
      controlMenu.openMenu,
      expandedDeviceIds,
      toggleDeviceExpanded,
      deviceSessionsById,
      connectMutation.isPending,
      connectMutation.variables,
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

      <DeviceControlActionsMenu
        anchorEl={controlMenu.anchorEl}
        open={controlMenu.menuOpen}
        onClose={controlMenu.closeMenu}
        onConnect={handleConnect}
        onRestart={handleRestart}
        onReset={handleReset}
        onUpdate={handleUpdate}
      />

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
}
