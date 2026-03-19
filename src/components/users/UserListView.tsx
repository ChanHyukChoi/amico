import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid";
import {
  IconButton,
  Menu,
  MenuItem,
  Button,
  TextField,
  Box,
  type Theme,
} from "@mui/material";
import { MoreVert, Edit, Delete } from "@mui/icons-material";
import { useState, useMemo } from "react";
import { fetchUsers, deleteUser } from "@/api/users";
import type { User } from "@/types/user";

export default function UserListView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, appliedSearch],
    queryFn: () =>
      fetchUsers({ page, pageSize: 10, search: appliedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setAnchorEl(null);
      setSelectedUser(null);
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

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    user: User,
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleEdit = () => {
    if (selectedUser) navigate(`/users/${selectedUser.id}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedUser && window.confirm(t("users.deleteConfirm"))) {
      deleteMutation.mutate(selectedUser.id);
    } else {
      handleMenuClose();
    }
  };

  const handlePaginationModelChange = (model: {
    page: number;
    pageSize: number;
  }) => {
    setPage(model.page + 1);
  };

  const columns = useMemo<GridColDef<User>[]>(
    () => [
      {
        field: "userId",
        headerName: t("users.userId"),
        flex: 0.8,
        minWidth: 100,
      },
      {
        field: "name",
        headerName: t("users.name"),
        flex: 1,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams<User>) => (
          <Button
            variant="text"
            size="small"
            sx={{ textTransform: "none", fontWeight: 600 }}
            onClick={() => navigate(`/users/${params.row.id}`)}
          >
            {params.value}
          </Button>
        ),
      },
      {
        field: "department",
        headerName: t("users.department"),
        flex: 1,
        minWidth: 100,
        valueGetter: (_, row) => row.department ?? "-",
      },
      {
        field: "email",
        headerName: t("users.email"),
        flex: 1.2,
        minWidth: 160,
        valueGetter: (_, row) => row.email ?? "-",
      },
      {
        field: "actions",
        headerName: t("users.actions"),
        width: 56,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<User>) => (
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, params.row)}
            aria-label={t("users.actions")}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [t, navigate],
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
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          component="h1"
          sx={{ fontSize: "1.5rem", fontWeight: 600, m: 0 }}
        >
          {t("users.list")}
        </Box>
        <Button variant="contained" onClick={() => navigate("/users/new")}>
          {t("users.addUser")}
        </Button>
      </Box>

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
          placeholder={t("users.search")}
          size="small"
          sx={{ maxWidth: 280 }}
        />
        <Button type="submit" variant="outlined">
          {t("users.search")}
        </Button>
      </Box>

      {isLoading ? (
        <Box sx={{ color: "text.secondary", py: 4 }}>
          {t("common.loading")}
        </Box>
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
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[10, 25, 50]}
            loading={isLoading}
            disableRowSelectionOnClick
            localeText={{
              noRowsLabel: t("users.noData"),
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          {t("common.edit")}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          {t("common.delete")}
        </MenuItem>
      </Menu>
    </Box>
  );
}
