import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { Layout } from "@/components/common/Layout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { UsersPage } from "@/pages/UsersPage";
import { AccessLogPage } from "@/pages/AccessLogPage";
import { DepartmentsPage } from "@/pages/DepartmentsPage";
import { DevicesPage } from "@/pages/DevicesPage";

const queryClient = new QueryClient();

const muiTheme = createTheme({
  palette: { mode: "light" },
});

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
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
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="devices" element={<DevicesPage />} />
              <Route path="devices/new" element={<DevicesPage />} />
              <Route path="devices/:id" element={<DevicesPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
