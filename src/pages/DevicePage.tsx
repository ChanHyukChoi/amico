import { useState } from "react";
import DeviceListView from "@/components/devices/DeviceListView";
import DeviceDrawer from "@/components/devices/DeviceDrawer";

export function DevicePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <DeviceListView
        onAddDevice={() => setDrawerOpen(true)}
        onEditDevice={() => {}}
      />
      <DeviceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode="create"
      />
    </>
  );
}
