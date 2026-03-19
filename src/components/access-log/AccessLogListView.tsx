import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";

export default function AccessLogListView() {
  const { t } = useTranslation();

  return (
    <Box>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
        {t("layout.nav.accessLog")}
      </h1>
      <p className="mt-2 text-gray-500">{t("common.comingSoon")}</p>
    </Box>
  );
}
