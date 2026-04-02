import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { useAuthStore } from "@/store/authStore";

export function SessionExpiredDialog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logoutReason = useAuthStore((s) => s.logoutReason);
  const consumeLogoutReason = useAuthStore((s) => s.consumeLogoutReason);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (logoutReason === "SESSION_REPLACED") {
      setOpen(true);
    }
  }, [logoutReason]);

  const handleConfirm = () => {
    setOpen(false);
    consumeLogoutReason();
    navigate("/login", { replace: true });
  };

  return (
    <Dialog open={open} disableEscapeKeyDown>
      <DialogTitle>{t("session.expiredTitle")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("session.expiredMessage")}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirm} variant="contained" autoFocus>
          {t("session.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
