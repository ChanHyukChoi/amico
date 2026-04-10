//#region imports
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  DeviceSettingsIdentificationSection,
  DeviceSettingsWiegandSection,
  DeviceSettingsOsdpSection,
  DeviceSettingsHidSection,
  DeviceSettingsDisplaySection,
  DeviceSettingsIdentificationMethodsSection,
  DeviceSettingsFacialSection,
  DeviceSettingsAttendanceSection,
  DeviceSettingsAccessDisplaySection,
} from "@/components/Devices/settings/sections/DeviceSettingsSectionPlaceholders";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { Layout } from "@/components/common/Layout";
import { SessionExpiredDialog } from "@/components/common/SessionExpiredDialog";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { UsersPage } from "@/pages/UsersPage";
import { AccessLogPage } from "@/pages/AccessLogPage";
import { DevicesPage } from "@/pages/DevicesPage";
//#endregion

//#region constants
const queryClient = new QueryClient();

const muiTheme = createTheme({
  palette: { mode: "light" },
});
//#endregion

//#region components

function SessionGuard({ children }: { children: React.ReactNode }) {
  useSessionGuard();
  return (
    <>
      {children}
      <SessionExpiredDialog />
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SessionGuard>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="users/new" element={<UsersPage />} />
                <Route path="users/:id" element={<UsersPage />} />
                <Route path="access-log" element={<AccessLogPage />} />
                <Route path="devices" element={<DevicesPage />} />
                <Route path="devices/new" element={<DevicesPage />} />
                <Route path="devices/:id/settings" element={<DevicesPage />}>
                  <Route
                    index
                    element={<Navigate to="identification" replace relative="path" />}
                  />
                  <Route
                    path="identification"
                    element={<DeviceSettingsIdentificationSection />}
                  />
                  <Route path="wiegand" element={<DeviceSettingsWiegandSection />} />
                  <Route path="osdp" element={<DeviceSettingsOsdpSection />} />
                  <Route path="hid" element={<DeviceSettingsHidSection />} />
                  <Route path="display" element={<DeviceSettingsDisplaySection />} />
                  <Route
                    path="identification-methods"
                    element={<DeviceSettingsIdentificationMethodsSection />}
                  />
                  <Route path="facial" element={<DeviceSettingsFacialSection />} />
                  <Route
                    path="attendance"
                    element={<DeviceSettingsAttendanceSection />}
                  />
                  <Route
                    path="access-display"
                    element={<DeviceSettingsAccessDisplaySection />}
                  />
                </Route>
                <Route path="devices/:id" element={<DevicesPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SessionGuard>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
//#endregion
