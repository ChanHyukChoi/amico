import { useParams, useLocation, useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DeviceListView from "@/components/Devices/DeviceListView";
import DeviceFormView from "@/components/Devices/DeviceFormView";
import DeviceSettingsLayout from "@/components/Devices/settings/DeviceSettingsLayout";

export function DevicesPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const isSettings = pathname.includes("/settings");

  if (id && isSettings) {
    return <DeviceSettingsLayout />;
  }

  const isNew = pathname.endsWith("/new");
  const isEdit = Boolean(id);
  const formOpen = isNew || isEdit;

  const closeForm = () => {
    navigate("/devices");
  };

  return (
    <>
      <DeviceListView
        onAddDevice={() => navigate("/devices/new")}
        onEditDevice={(deviceId) => navigate(`/devices/${deviceId}`)}
      />
      {formOpen ? (
        <Dialog
          open
          onClose={(_, reason) => {
            if (reason === "backdropClick" || reason === "escapeKeyDown") {
              return;
            }
          }}
          maxWidth="sm"
          fullWidth
          scroll="paper"
        >
          <DialogContent>
            <DeviceFormView
              key={isNew ? "create" : id}
              mode={isNew ? "create" : "edit"}
              onRequestClose={closeForm}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
