import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

/** 장치 생성·수정 폼 — UI 구현 전 임시 스텁 */
export default function DeviceFormView({
  mode,
}: {
  mode: "create" | "edit";
}) {
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 2, color: "text.secondary" }}>
      {t("common.comingSoon")} ({mode})
    </Box>
  );
}
