import UserListView from "@/components/users/UserListView";

/** Layout `main`이 flex 컬럼이므로 래퍼 없이 두어 그리드가 남은 높이를 채웁니다. */
export function UserPage() {
  return (
    <UserListView onAddUser={() => {}} onEditUser={() => {}} />
  );
}
