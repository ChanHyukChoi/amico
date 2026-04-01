import { Menu, MenuItem } from "@mui/material";
import { RestartAlt, Update } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

type DeviceControlActionsMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
  onReset: () => void;
  onUpdate: () => void;
};

export function DeviceControlActionsMenu({
  anchorEl,
  open,
  onClose,
  onRestart,
  onReset,
  onUpdate,
}: DeviceControlActionsMenuProps) {
  const { t } = useTranslation();

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={onRestart}>
        <RestartAlt fontSize="small" sx={{ mr: 1 }} />
        {t("devices.controlsRestart")}
      </MenuItem>
      <MenuItem onClick={onReset}>
        <RestartAlt fontSize="small" sx={{ mr: 1 }} />
        {t("devices.controlsReset")}
      </MenuItem>
      <MenuItem onClick={onUpdate}>
        <Update fontSize="small" sx={{ mr: 1 }} />
        {t("devices.controlsUpdate")}
      </MenuItem>
    </Menu>
  );
}
