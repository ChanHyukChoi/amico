//#region imports
import { Outlet } from "react-router-dom";
import { TopBar } from "@/components/common/TopBar";
import { Sidebar } from "@/components/common/Sidebar";
//#endregion

//#region component
export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex-1 flex min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 min-h-0 flex flex-col p-4 overflow-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
//#endregion
