//#region imports

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import { Button, TextField, Box, type Theme, IconButton, MenuItem } from "@mui/material";
import { MoreVert, Settings } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { fetchDevices, deleteDevice } from "@/api/devices";
import type { Device } from "@/types/device";
import { useRowActionMenu } from "@/hooks/useRowActionMenu";
import { useServerPaginationPage } from "@/hooks/useServerPaginationPage";
import { DataGridRowActionsMenu } from "@/components/common/DataGridRowActionsMenu";
import { ListPageHeader } from "@/components/common/ListPageHeader";

//#endregion
export default function DeviceListView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { page, setPage, onPaginationModelChange } = useServerPaginationPage(1);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAppliedSearch(searchValue.trim());
    setPage(1);
  };

  const total = data?.success && data.data ? data.data.total : 0;
  const items = data?.success && data.data ? data.data.items : [];
  const pageSize = 10;

  const handleEdit = () => {
    if (rowMenu.selectedRow) navigate(`/devices/${rowMenu.selectedRow.id}`);
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

  const columns = useMemo<GridColDef<Device>[]>(
    () => [
      {
        field: "description",
        headerName: t("devices.description"),
        flex: 1,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams<Device>) => (
          <Button
            variant="text"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}
            onClick={() => navigate(`/devices/${params.row.id}`)}
          >
            {params.value}
          </Button>
        ),
      },
      {
        field: "ip",
        headerName: t("devices.ip"),
        flex: 1,
        minWidth: 120,
      },
      {
        field: "type",
        headerName: t("devices.type"),
        flex: 0.8,
        minWidth: 90,
      },
      {
        field: "model",
        headerName: t("devices.model"),
        flex: 1,
        minWidth: 100,
      },
      {
        field: "userId",
        headerName: t("devices.userId"),
        flex: 0.8,
        minWidth: 100,
      },
      {
        field: "isActive",
        headerName: t("devices.isActive"),
        flex: 0.8,
        minWidth: 100,
      },
      {
        field: "actions",
        headerName: t("devices.actions"),
        width: 56,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<Device>) => (
          <IconButton
            size="small"
            onClick={(e) => rowMenu.openMenu(e, params.row)}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [t, navigate, rowMenu.openMenu],
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
        onAction={() => navigate("/devices/new")}
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
            rows={items}
            columns={columns}
            getRowId={(row) => row.id}
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
}
