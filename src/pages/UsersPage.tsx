import { useParams, useLocation } from "react-router-dom";
import UserListView from "@/components/users/UserListView";
import UserFormView from "@/components/users/UserFormView";

export function UsersPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const pathname = location.pathname;

  if (pathname.endsWith("/new")) {
    return <UserFormView mode="create" />;
  }
  if (id) {
    return <UserFormView mode="edit" />;
  }
  return <UserListView />;
}
