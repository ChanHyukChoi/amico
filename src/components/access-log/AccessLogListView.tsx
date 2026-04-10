//#region imports
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Button, TextField, Box, type Theme } from "@mui/material";
import { endOfDay, format, fromUnixTime, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { fetchAccessLogs } from "@/api/access-logs";
import type { AccessLog } from "@/types/access-log";
import { useServerPaginationPage } from "@/hooks/useServerPaginationPage";
import { ListPageHeader } from "@/components/common/ListPageHeader";
//#endregion

//#region types
type AppliedTimeFilter =
  | { kind: "none" }
  | { kind: "range"; startTime: number; endTime: number };
//#endregion

//#region helpers
function rangeFromDateInputsSec(
  dateFrom: string,
  dateTo: string,
): { startTime: number; endTime: number } | null {
  const from = dateFrom.trim();
  const to = dateTo.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return null;
  }
  const [y1, m1, d1] = from.split("-").map(Number);
  const [y2, m2, d2] = to.split("-").map(Number);
  const start = startOfDay(new Date(y1, m1 - 1, d1));
  const end = endOfDay(new Date(y2, m2 - 1, d2));
  if (start.getTime() > end.getTime()) return null;
  return {
    startTime: Math.floor(start.getTime() / 1000),
    endTime: Math.floor(end.getTime() / 1000),
  };
}
//#endregion

//#region component
export default function AccessLogListView() {
  const { t } = useTranslation();
  const { page, setPage, onPaginationModelChange } = useServerPaginationPage(
    1,
  );
  const pageSize = 10;

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  /** 날짜 둘 다 비우면 startTime/endTime 생략 → 서버 최근 30일(hid-amico-server) */
  const [appliedTime, setAppliedTime] = useState<AppliedTimeFilter>({
    kind: "none",
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "accessLogs",
      page,
      pageSize,
      appliedTime.kind,
      appliedTime.kind === "range"
        ? `${appliedTime.startTime}-${appliedTime.endTime}`
        : "open",
    ],
    queryFn: () =>
      fetchAccessLogs(
        appliedTime.kind === "range"
          ? {
              startTime: appliedTime.startTime,
              endTime: appliedTime.endTime,
              page,
              pageSize,
            }
          : { page, pageSize },
      ),
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const from = dateFrom.trim();
    const to = dateTo.trim();
    if (from && to) {
      const parsed = rangeFromDateInputsSec(from, to);
      if (parsed) {
        setAppliedTime({ kind: "range", ...parsed });
        setPage(1);
        return;
      }
    }
    setAppliedTime({ kind: "none" });
    setPage(1);
  };

  const total = data?.success && data.data ? data.data.total : 0;
  const items = data?.success && data.data ? data.data.items : [];

  const columns = useMemo<GridColDef<AccessLog>[]>(
    () => [
      {
        field: "time",
        headerName: t("accessLog.time"),
        flex: 1.2,
        minWidth: 170,
        valueGetter: (_, row) => row.time,
        valueFormatter: (value: number | undefined) =>
          value != null
            ? format(fromUnixTime(value), "yyyy-MM-dd HH:mm:ss")
            : "-",
      },
      {
        field: "event",
        headerName: t("accessLog.event"),
        flex: 0.6,
        minWidth: 80,
        valueGetter: (_, row) => row.event ?? "-",
      },
      {
        field: "device_id",
        headerName: t("accessLog.deviceId"),
        flex: 0.7,
        minWidth: 100,
        valueGetter: (_, row) => row.device_id ?? "-",
      },
      {
        field: "user_id",
        headerName: t("accessLog.userId"),
        flex: 0.7,
        minWidth: 100,
        valueGetter: (_, row) => row.user_id ?? "-",
      },
      {
        field: "identifier_id",
        headerName: t("accessLog.identifierId"),
        flex: 0.8,
        minWidth: 110,
        valueGetter: (_, row) => row.identifier_id ?? "-",
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
      <ListPageHeader title={t("accessLog.list")} />

      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
        }}
      >
        <TextField
          name="dateFrom"
          type="date"
          label={t("accessLog.dateFrom")}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { "aria-label": t("accessLog.dateFrom") },
          }}
          sx={{ minWidth: 160 }}
        />
        <TextField
          name="dateTo"
          type="date"
          label={t("accessLog.dateTo")}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          size="small"
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { "aria-label": t("accessLog.dateTo") },
          }}
          sx={{ minWidth: 160 }}
        />
        <Button type="submit" variant="outlined">
          {t("accessLog.search")}
        </Button>
        <Box
          component="span"
          sx={{ fontSize: "0.8125rem", color: "text.secondary", width: "100%" }}
        >
          {t("accessLog.defaultRangeHint")}
        </Box>
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
              noRowsLabel: t("accessLog.noData"),
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
    </Box>
  );
}
//#endregion
