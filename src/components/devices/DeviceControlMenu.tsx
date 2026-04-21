import { Menu, MenuItem } from "@mui/material";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import CheckIcon from "@mui/icons-material/Check";
import SensorsOffIcon from "@mui/icons-material/SensorsOff";
import { useTranslation } from "react-i18next";

export type DeviceControlMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onCheckSession: () => void;
};

export function DeviceControlMenu({
  anchorEl,
  open,
  onClose,
  onConnect,
  onDisconnect,
  onCheckSession,
}: DeviceControlMenuProps) {
  const { t } = useTranslation();

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={onConnect}>
        <ConnectWithoutContactIcon fontSize="small" sx={{ mr: 1 }} />
        {t("devices.connect")}
      </MenuItem>
      <MenuItem onClick={onDisconnect}>
        <SensorsOffIcon fontSize="small" sx={{ mr: 1 }} />
        {t("devices.disconnect")}
      </MenuItem>
      <MenuItem onClick={onCheckSession}>
        <CheckIcon fontSize="small" sx={{ mr: 1 }} />
        {t("devices.checkSession")}
      </MenuItem>
    </Menu>
  );
}
