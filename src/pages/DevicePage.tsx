import { useState } from "react";
import DeviceListView from "@/components/devices/DeviceListView";
import DeviceDrawer from "@/components/devices/DeviceDrawer";
import type { Device } from "@/types/device";

export function DevicePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "update">("create");
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingDevice(null);
  };

  return (
    <>
      <DeviceListView
        onAddDevice={() => {
          setDrawerMode("create");
          setEditingDevice(null);
          setDrawerOpen(true);
        }}
        onEditDevice={(device) => {
          setDrawerMode("update");
          setEditingDevice(device);
          setDrawerOpen(true);
        }}
      />
      <DeviceDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        mode={drawerMode}
        device={drawerMode === "update" ? (editingDevice ?? undefined) : undefined}
      />
    </>
  );
}
