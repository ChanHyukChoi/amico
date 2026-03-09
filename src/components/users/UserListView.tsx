// ========== 외부 라이브러리 import ==========
// react-i18next: 다국어(한국어/영어) 지원. t('키')로 번역 텍스트 조회
import { useTranslation } from "react-i18next";
// react-router-dom: 라우팅. useNavigate로 페이지 이동, useLocation으로 현재 URL 정보
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
// @tanstack/react-query: 서버 상태 관리. useQuery(조회), useMutation(변경), useQueryClient(캐시 제어)
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
// 프로젝트 내 API 함수
import { fetchUsers, deleteUser } from "@/api/users";

// ========== 컴포넌트 정의 ==========
// export default: 이 파일의 메인 export. import UserListView from '...' 로 가져옴
export default function UserListView() {
  // ----- 훅: 라우팅 & 다국어 -----
  // useTranslation(): t 함수 반환. t('users.list') → "사용자 목록" (ko) / "User List" (en)
  const { t } = useTranslation();
  // useNavigate(): navigate 함수. navigate('/users/new') → 해당 경로로 이동
  const navigate = useNavigate();
  // useLocation(): 현재 URL 정보. location.search = "?page=1&search=홍"
  const location = useLocation();
  // useQueryClient(): TanStack Query 캐시 제어. invalidateQueries로 데이터 갱신 트리거
  const queryClient = useQueryClient();

  // ----- URL 쿼리 파라미터 파싱 -----
  // URLSearchParams: ?page=2&search=김 같은 쿼리스트링 파싱
  const searchParams = new URLSearchParams(location.search);
  // page: 1 이상 정수. 없으면 "1" 기본값
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  // search: 검색어. 없으면 빈 문자열
  const search = searchParams.get("search") ?? "";

  // ----- useQuery: 사용자 목록 조회 (GET) -----
  // queryKey: 캐시 키. [page, search]가 바뀌면 새로 fetch
  // queryFn: 실제 API 호출 함수. fetchUsers가 GET /api/users 호출
  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search],
    queryFn: () =>
      fetchUsers({ page, pageSize: 10, search: search || undefined }),
  });

  // ----- useMutation: 사용자 삭제 (DELETE) -----
  // mutationFn: deleteUser(id) 호출
  // onSuccess: 삭제 성공 시 users 목록 캐시 무효화 → 자동 재조회
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // ----- 검색 폼 제출 핸들러 -----
  // e.preventDefault(): 폼 기본 제출(페이지 새로고침) 방지
  // URL 쿼리로 검색어 전달 → 페이지 이동 → useQuery가 새 queryKey로 재조회
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="search"]');
    const value = input?.value ?? "";
    // encodeURIComponent: 한글 등 특수문자 URL 인코딩
    navigate(`/users?search=${encodeURIComponent(value)}&page=1`);
  };

  // ----- API 응답에서 데이터 추출 -----
  // data?.success: optional chaining. data가 없으면 undefined
  // API 응답: { success: true, data: { items, total, page, pageSize } }
  const total = data?.success && data.data ? data.data.total : 0;
  const items = data?.success && data.data ? data.data.items : [];
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize) || 1;

  // ----- JSX 렌더링 -----
  return (
    <div className="space-y-4">
      {/* 헤더: 제목 + 사용자 추가 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">{t("users.list")}</h1>
        <button
          type="button"
          onClick={() => navigate("/users/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          {t("users.addUser")}
        </button>
      </div>

      {/* 검색 폼 */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          name="search"
          type="text"
          defaultValue={search}
          placeholder={t("users.search")}
          className="flex-1 max-w-xs border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300"
        >
          {t("users.search")}
        </button>
      </form>

      {/* 조건부 렌더링: 로딩 / 빈 목록 / 테이블 */}
      {isLoading ? (
        <p className="text-gray-500">{t("common.loading")}</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 py-8">{t("users.noData")}</p>
      ) : (
        <>
          {/* 테이블 */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("users.name")}</th>
                  <th className="px-4 py-3 font-medium">
                    {t("users.department")}
                  </th>
                  <th className="px-4 py-3 font-medium">{t("users.email")}</th>
                  <th className="px-4 py-3 font-medium">
                    {t("users.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* items.map: 배열 각 요소를 <tr>로 렌더. key는 React가 리스트 구분용으로 필요 */}
                {items.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/users/${user.id}`)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {user.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.department ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {user.email ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {t("common.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(t("users.deleteConfirm"))) {
                              deleteMutation.mutate(user.id);
                            }
                          }}
                          className="text-red-600 hover:underline text-sm"
                        >
                          {t("common.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션: 2페이지 이상일 때만 표시 */}
          {totalPages > 1 && (
            <div className="flex gap-2 items-center">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  navigate(
                    `/users?search=${encodeURIComponent(search)}&page=${page - 1}`,
                  )
                }
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  navigate(
                    `/users?search=${encodeURIComponent(search)}&page=${page + 1}`,
                  )
                }
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
