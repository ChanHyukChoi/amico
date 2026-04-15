import UserListView from "@/components/users/UserListView";

export function UserPage() {
  return (
    <div>
      <UserListView onAddUser={() => {}} onEditUser={() => {}} />
    </div>
  );
}
