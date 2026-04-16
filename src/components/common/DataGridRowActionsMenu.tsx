//#region imports
import type { ReactNode } from "react";
import { Menu, MenuItem } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
//#endregion

//#region types
export type DataGridRowActionsMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  /** 수정·삭제 아래에만 렌더 (예: 장치 목록의 설정 메뉴) */
  extra?: ReactNode;
};
//#endregion

/** 목록 그리드 행 액션(수정/삭제) 공통 메뉴 */
//#region component
export function DataGridRowActionsMenu({
  anchorEl,
  open,
  onClose,
  onEdit,
  onDelete,
  extra,
}: DataGridRowActionsMenuProps) {
  const { t } = useTranslation();

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={onEdit}>
        <Edit fontSize="small" sx={{ mr: 1 }} />
        {t("common.edit")}
      </MenuItem>
      <MenuItem onClick={onDelete} sx={{ color: "error.main" }}>
        <Delete fontSize="small" sx={{ mr: 1 }} />
        {t("common.delete")}
      </MenuItem>
      {extra}
    </Menu>
  );
}
//#endregion
