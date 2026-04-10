//#region imports
import { useTranslation } from "react-i18next";
//#endregion

//#region component
export function DepartmentsPage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-semibold">{t("layout.nav.departments")}</h1>
      <p className="mt-2 text-gray-500">{t("common.comingSoon")}</p>
    </div>
  );
}
//#endregion
