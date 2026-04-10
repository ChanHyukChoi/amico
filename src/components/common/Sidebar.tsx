//#region imports
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
//#endregion

//#region constants
const navItems: { to: string; key: string }[] = [
  { to: "/", key: "layout.nav.dashboard" },
  { to: "/users", key: "layout.nav.users" },
  { to: "/devices", key: "layout.nav.devices" },
  { to: "/access-log", key: "layout.nav.accessLog" },
];
//#endregion

//#region component
export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="w-56 shrink-0 border-r bg-gray-50 min-h-0 flex flex-col">
      <nav className="p-3 flex flex-col gap-1">
        {navItems.map(({ to, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-800"
                  : "text-gray-700 hover:bg-gray-200"
              }`
            }
          >
            {t(key)}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
//#endregion
