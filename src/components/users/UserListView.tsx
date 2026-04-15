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

import { deleteUser, fetchUsers } from "@/api/users/users";
import { DataGridRowActionsMenu } from "@/components/common/DataGridRowActionsMenu";
import { ListPageHeader } from "@/components/common/ListPageHeader";
import { useRowActionMenu } from "@/hooks/useRowActionMenu";
import type { User, UserDetailRow } from "@/types/user";

//#endregion

//#region types
const USER_GRID_COLUMN_COUNT = 6;

type UserGridRow = User | UserDetailRow;

type UserListViewProps = {
  onAddUser: () => void;
  onEditUser: (userId: number) => void;
};

//#endregion

//#region helpers

function isUserDetailRow(row: UserGridRow): row is UserDetailRow {
  return "__isDetail" in row && row.__isDetail === true;
}

function compareUsersByField(
  a: User,
  b: User,
  field: string,
  direction: "asc" | "desc",
): number {
  const dir = direction === "desc" ? -1 : 1;
  switch (field) {
    case "username":
      return (
        dir *
        String(a.username).localeCompare(String(b.username), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    case "name":
      return (
        dir *
        String(a.name).localeCompare(String(b.name), undefined, {
          sensitivity: "base",
        })
      );
    case "department":
      return (
        dir *
        String(a.department ?? "").localeCompare(
          String(b.department ?? ""),
          undefined,
          { sensitivity: "base" },
        )
      );
    case "email":
      return (
        dir *
        String(a.email ?? "").localeCompare(String(b.email ?? ""), undefined, {
          sensitivity: "base",
        })
      );
    default:
      return 0;
  }
}

//#endregion

//#region component

export default function UserListView({
  onAddUser,
  onEditUser,
}: UserListViewProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [appliedSearch, setAppliedSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [expandedUserIds, setExpandedUserIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const rowMenu = useRowActionMenu<User>();

  //#region effects
  useEffect(() => {
    setExpandedUserIds(new Set());
  }, [appliedSearch]);
  //#endregion

  //#region queries
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      rowMenu.closeMenu();
    },
  });
  //#endregion

  //#region handlers
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAppliedSearch(searchValue.trim());
  };

  /** 서버는 전체 목록만 반환. 검색은 클라이언트에서 필터. */
  const items = useMemo(() => {
    const rows = data ?? [];
    const q = appliedSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((u) => {
      const blob = [u.username, u.name, u.department, u.email]
        .map((x) => (x ?? "").toLowerCase())
        .join("\0");
      return blob.includes(q);
    });
  }, [data, appliedSearch]);

  /** 표시용 정렬(클라이언트). */
  const sortedItems = useMemo(() => {
    const first = sortModel[0];
    if (!first?.sort || !first.field) return items;
    return [...items].sort((a, b) =>
      compareUsersByField(a, b, first.field, first.sort as "asc" | "desc"),
    );
  }, [items, sortModel]);

  const gridRows = useMemo((): UserGridRow[] => {
    const out: UserGridRow[] = [];
    for (const u of sortedItems) {
      out.push(u);
      if (expandedUserIds.has(u.id)) {
        out.push({
          id: `detail-${u.id}`,
          __isDetail: true,
          parent: u,
        });
      }
    }
    return out;
  }, [sortedItems, expandedUserIds]);

  const toggleUserExpanded = useCallback((userId: number) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const handleEdit = () => {
    if (rowMenu.selectedRow) onEditUser(rowMenu.selectedRow.id);
    rowMenu.closeMenu();
  };

  const handleDelete = () => {
    if (rowMenu.selectedRow && window.confirm(t("users.deleteConfirm"))) {
      deleteMutation.mutate(rowMenu.selectedRow.id);
    } else {
      rowMenu.closeMenu();
    }
  };
  //#endregion

  //#region grid
  const columns = useMemo<GridColDef<UserGridRow>[]>(
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
          isUserDetailRow(row) ? USER_GRID_COLUMN_COUNT : 1,
        renderCell: (params: GridRenderCellParams<UserGridRow>) => {
          if (isUserDetailRow(params.row)) {
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
          const user = params.row;
          const open = expandedUserIds.has(user.id);
          return (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleUserExpanded(user.id);
              }}
              aria-label={
                open ? t("users.collapseDetails") : t("users.expandDetails")
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
        field: "username",
        headerName: t("users.userId"),
        flex: 0.8,
        minWidth: 100,
        valueGetter: (value, row) =>
          isUserDetailRow(row) ? "" : (value ?? row.username),
      },
      {
        field: "name",
        headerName: t("users.name"),
        flex: 1,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams<UserGridRow>) => {
          const row = params.row;
          if (isUserDetailRow(row)) return null;
          return (
            <Button
              variant="text"
              size="small"
              sx={{ textTransform: "none", fontWeight: 600 }}
              onClick={() => onEditUser(row.id)}
            >
              {row.name}
            </Button>
          );
        },
      },
      {
        field: "department",
        headerName: t("users.department"),
        flex: 1,
        minWidth: 100,
        valueGetter: (_, row) =>
          isUserDetailRow(row) ? "" : (row.department ?? "-"),
      },
      {
        field: "email",
        headerName: t("users.email"),
        flex: 1.2,
        minWidth: 160,
        valueGetter: (_, row) =>
          isUserDetailRow(row) ? "" : (row.email ?? "-"),
      },
      {
        field: "actions",
        headerName: t("users.actions"),
        width: 56,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<UserGridRow>) => {
          const row = params.row;
          if (isUserDetailRow(row)) return null;
          return (
            <IconButton
              size="small"
              onClick={(e) => rowMenu.openMenu(e, row)}
              aria-label={t("users.actions")}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          );
        },
      },
    ],
    [t, onEditUser, rowMenu.openMenu, expandedUserIds, toggleUserExpanded],
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
        title={t("users.list")}
        actionLabel={t("users.addUser")}
        onAction={onAddUser}
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
          placeholder={t("users.search")}
          size="small"
          sx={{ maxWidth: 280 }}
        />
        <Button type="submit" variant="outlined">
          {t("users.search")}
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
              isUserDetailRow(params.row as UserGridRow)
                ? "user-list-detail-row"
                : ""
            }
            getRowHeight={({ model }) =>
              isUserDetailRow(model as UserGridRow) ? "auto" : 52
            }
            sortingMode="client"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            loading={isLoading}
            disableRowSelectionOnClick
            localeText={{
              noRowsLabel: t("users.noData"),
            }}
            sx={{
              "& .MuiDataGrid-cell:focus": { outline: "none" },
              /* 기본 셀의 text-overflow: ellipsis가 아이콘·인접 텍스트에 잘림/점(…) 조각으로 보이는 현상 방지 */
              "& .MuiDataGrid-columnHeader[data-field='toggleDetails']": {
                px: 0,
              },
              "& .MuiDataGrid-row:not(.user-list-detail-row) .MuiDataGrid-cell[data-field='toggleDetails']":
                {
                  px: 0,
                  textOverflow: "clip",
                  justifyContent: "center",
                },
              "& .user-list-detail-row .MuiDataGrid-cell": {
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
  //#endregion
}

//#endregion
