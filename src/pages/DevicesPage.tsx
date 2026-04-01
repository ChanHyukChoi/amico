import { useParams, useLocation } from "react-router-dom";
import DeviceListView from "@/components/Devices/DeviceListView";
import DeviceFormView from "@/components/Devices/DeviceFormView";
import DeviceSettingsLayout from "@/components/Devices/settings/DeviceSettingsLayout";

export function DevicesPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname.endsWith("/new")) {
    return <DeviceFormView mode="create" />;
  }
  if (id && pathname.includes("/settings")) {
    return <DeviceSettingsLayout />;
  }
  if (id) {
    return <DeviceFormView mode="edit" />;
  }
  return <DeviceListView />;
}
