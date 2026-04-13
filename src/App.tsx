//#region imports
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { Layout } from "@/components/common/Layout";
import { SessionExpiredDialog } from "@/components/common/SessionExpiredDialog";
import { useSessionGuard } from "@/hooks/useSessionGuard";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
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
