import { useTranslation } from "react-i18next";

export function SettingsSystemPage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-semibold">
        {t("layout.nav.settingsSystem")}
      </h1>
      <p className="mt-2 text-gray-500">{t("common.comingSoon")}</p>
    </div>
  );
}
