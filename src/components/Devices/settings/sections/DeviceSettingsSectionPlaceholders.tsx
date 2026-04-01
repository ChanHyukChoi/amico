import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { DeviceSettingsSectionPanel } from "@/components/Devices/settings/DeviceSettingsSectionPanel";

function PlaceholderBody() {
  const { t } = useTranslation();
  return (
    <Typography color="text.secondary" variant="body2">
      {t("common.comingSoon")}
    </Typography>
  );
}

export function DeviceSettingsIdentificationSection() {
  const { t } = useTranslation();
  return (
    <DeviceSettingsSectionPanel
      title={t("devices.settings.sections.identification")}
      onSave={() => {}}
    >
      <PlaceholderBody />
    </DeviceSettingsSectionPanel>
  );
}

export function DeviceSettingsWiegandSection() {
  const { t } = useTranslation();
  return (
    <DeviceSettingsSectionPanel
      title={t("devices.settings.sections.wiegand")}
      onSave={() => {}}
    >
      <PlaceholderBody />
    </DeviceSettingsSectionPanel>
  );
}

export function DeviceSettingsOsdpSection() {
  const { t } = useTranslation();
  return (
    <DeviceSettingsSectionPanel
      title={t("devices.settings.sections.osdp")}
      onSave={() => {}}
    >
      <PlaceholderBody />
    </DeviceSettingsSectionPanel>
  );
}

export function DeviceSettingsHidSection() {
  const { t } = useTranslation();
  return (
    <DeviceSettingsSectionPanel
      title={t("devices.settings.sections.hid")}
      onSave={() => {}}
    >
      <PlaceholderBody />
    </DeviceSettingsSectionPanel>
  );
}

export function DeviceSettingsDisplaySection() {
  const { t } = useTranslation();
  return (
    <DeviceSettingsSectionPanel
      title={t("devices.settings.sections.display")}
      onSave={() => {}}
    >
      <PlaceholderBody />
    </DeviceSettingsSectionPanel>
  );
}

export function DeviceSettingsIdentificationMethodsSection() {
  const { t } = useTranslation();
  return (
    <DeviceSettingsSectionPanel
      title={t("devices.settings.sections.identificationMethods")}
      onSave={() => {}}
    >
      <PlaceholderBody />
    </DeviceSettingsSectionPanel>
  );
}

export function DeviceSettingsFacialSection() {
  const { t } = useTranslation();
  return (
    <DeviceSettingsSectionPanel
      title={t("devices.settings.sections.facial")}
      onSave={() => {}}
    >
      <PlaceholderBody />
    </DeviceSettingsSectionPanel>
  );
}

export function DeviceSettingsAttendanceSection() {
  const { t } = useTranslation();
  return (
    <DeviceSettingsSectionPanel
      title={t("devices.settings.sections.attendance")}
      onSave={() => {}}
    >
      <PlaceholderBody />
    </DeviceSettingsSectionPanel>
  );
}

export function DeviceSettingsAccessDisplaySection() {
  const { t } = useTranslation();
  return (
    <DeviceSettingsSectionPanel
      title={t("devices.settings.sections.accessDisplay")}
      onSave={() => {}}
    >
      <PlaceholderBody />
    </DeviceSettingsSectionPanel>
  );
}
