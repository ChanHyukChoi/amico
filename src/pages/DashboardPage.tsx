//#region imports
import { useTranslation } from "react-i18next";
//#endregion

//#region component
export function DashboardPage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
      <p className="mt-2 text-gray-600">{t("dashboard.welcome")}</p>
    </div>
  );
}
//#endregion
