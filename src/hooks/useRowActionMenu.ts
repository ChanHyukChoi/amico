import { useCallback, useState } from "react";
import type { MouseEvent } from "react";

/**
 * DataGrid 행 더보기(⋯) 메뉴: 앵커 + 선택 행 상태.
 * 목록 화면에서 반복되는 패턴을 묶은 초안 훅.
 */
export function useRowActionMenu<T>() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);

  const openMenu = useCallback((event: MouseEvent<HTMLElement>, row: T) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  }, []);

  const closeMenu = useCallback(() => {
    setAnchorEl(null);
    setSelectedRow(null);
  }, []);

  return {
    anchorEl,
    selectedRow,
    openMenu,
    closeMenu,
    menuOpen: Boolean(anchorEl),
  };
}
