//#region imports
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Stack, Typography } from "@mui/material";
//#endregion

//#region types
type DeviceSettingsSectionPanelProps = {
  title: string;
  /** 섹션별 저장 — 이후 PATCH settings 일부만 전송 등으로 연결 */
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  children?: ReactNode;
};
//#endregion

/** 장치 설정: 섹션 단위 저장 UX용 공통 패널 */
//#region component
export function DeviceSettingsSectionPanel({
  title,
  onSave,
  isSaving = false,
  children,
}: DeviceSettingsSectionPanelProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <Typography variant="h6" component="h2" fontWeight={600}>
          {title}
        </Typography>
        <Button
          type="button"
          variant="contained"
          disabled={isSaving || !onSave}
          onClick={() => onSave?.()}
        >
          {isSaving ? t("common.loading") : t("devices.settingsSaveSection")}
        </Button>
      </Stack>
      <Box>{children}</Box>
    </Stack>
  );
}
//#endregion
