//#region imports
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
//#endregion

//#region types
interface ProtectedRouteProps {
  children: React.ReactNode;
}
//#endregion

//#region component
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => !!s.accessToken);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
//#endregion
