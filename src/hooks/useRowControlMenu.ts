import { useCallback, useState } from "react";
import type { MouseEvent } from "react";

export function useRowControlMenu<T>() {
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
