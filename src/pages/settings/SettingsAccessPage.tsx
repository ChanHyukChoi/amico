import { useTranslation } from "react-i18next";

export function SettingsAccessPage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-semibold">
        {t("layout.nav.settingsAccess")}
      </h1>
      <p className="mt-2 text-gray-500">{t("common.comingSoon")}</p>
    </div>
  );
}
