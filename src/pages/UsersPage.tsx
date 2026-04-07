import { useParams, useLocation, useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import UserListView from "@/components/users/UserListView";
import UserFormView from "@/components/users/UserFormView";

export function UsersPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const isNew = pathname.endsWith("/new");
  const isEdit = Boolean(id);
  const formOpen = isNew || isEdit;

  const closeForm = () => {
    navigate("/users");
  };

  return (
    <>
      <UserListView
        onAddUser={() => navigate("/users/new")}
        onEditUser={(userId) => navigate(`/users/${userId}`)}
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
          fullWidth={true}
          scroll="paper"
        >
          <DialogContent>
            <UserFormView
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
