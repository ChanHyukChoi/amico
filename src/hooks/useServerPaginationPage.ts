//#region imports
import { useCallback, useState } from "react";
import type { GridPaginationModel } from "@mui/x-data-grid";
//#endregion

/**
 * 서버 사이드 페이지네이션 + MUI DataGrid 연동.
 * API 요청은 보통 1-based `page`, DataGrid는 0-based `paginationModel.page`.
 */
//#region hook
export function useServerPaginationPage(
  initialPage = 1,
  initialPageSize = 10,
) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const onPaginationModelChange = useCallback((model: GridPaginationModel) => {
    setPage(model.page + 1);
    setPageSize(model.pageSize);
  }, []);

  return { page, setPage, pageSize, setPageSize, onPaginationModelChange };
}
//#endregion
