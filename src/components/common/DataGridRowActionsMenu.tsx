import { Menu, MenuItem } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

type DataGridRowActionsMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/** 목록 그리드 행 액션(수정/삭제) 공통 메뉴 */
export function DataGridRowActionsMenu({
  anchorEl,
  open,
  onClose,
  onEdit,
  onDelete,
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
    </Menu>
  );
}
