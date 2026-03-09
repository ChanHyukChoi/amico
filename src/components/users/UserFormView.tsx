// ========== 외부 라이브러리 import ==========
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// API 함수
import { fetchUser, createUser, updateUser } from "@/api/users";
// 타입
import type { CreateUserRequest, UpdateUserRequest } from "@/types/user";

// ========== Zod 폼 검증 스키마 ==========
// z.object: 객체 형태 검증
// name: string, 최소 1글자 (필수)
// department: 선택(optional)
// email: 이메일 형식이거나 빈 문자열 (빈 문자열 허용)
const userFormSchema = z.object({
  name: z.string().min(1),
  department: z.string().optional(),
  email: z.union([z.string().email(), z.literal("")]),
});

// z.infer: 스키마에서 TypeScript 타입 추출. { name: string; department?: string; email: string }
type UserFormValues = z.infer<typeof userFormSchema>;

// ========== 컴포넌트 정의 ==========
// props: { mode: "create" | "edit" } - 문자열 리터럴 유니온 타입
export default function UserFormView({ mode }: { mode: "create" | "edit" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // useParams: URL 경로 파라미터. /users/123 → id = "123"
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // ----- useQuery: 사용자 단건 조회 (수정 모드일 때만) -----
  // enabled: false면 query 실행 안 함. create 모드일 때는 fetch 불필요
  // id!: non-null assertion. "id가 있다고 단언" (enabled로 이미 제어됨)
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id!),
    enabled: mode === "edit" && !!id,
  });

  // ----- useMutation: 사용자 생성 (POST) -----
  // onSuccess: res.success가 true면 목록 갱신 후 /users로 이동
  // onError: 네트워크 에러 등. setError로 폼에 에러 표시 (setError는 useForm에서 나옴)
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        navigate("/users");
      } else {
        setError("root", {
          message:
            (res as { message?: string }).message ?? "저장에 실패했습니다.",
        });
      }
    },
    onError: (err: Error) => {
      setError("root", { message: err.message || "저장에 실패했습니다." });
    },
  });

  // ----- useMutation: 사용자 수정 (PUT) -----
  // mutationFn: (body) => updateUser(id!, body) - id를 클로저로 캡처
  const updateMutation = useMutation({
    mutationFn: (body: UpdateUserRequest) => updateUser(id!, body),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["user", id] });
        navigate("/users");
      } else {
        setError("root", {
          message:
            (res as { message?: string }).message ?? "수정에 실패했습니다.",
        });
      }
    },
    onError: (err: Error) => {
      setError("root", { message: err.message || "수정에 실패했습니다." });
    },
  });

  // ----- API 응답에서 user 객체 추출 -----
  const user = userData?.success && userData.data ? userData.data : null;

  // ----- useForm: React Hook Form + Zod -----
  // register: input에 연결. {...register("name")} → name, onChange, onBlur, ref 등 주입
  // handleSubmit: 제출 시 Zod 검증 후 통과하면 onSubmit 호출
  // setError: 폼 에러 수동 설정. "root"는 폼 전체 에러
  // formState.errors: 필드별 검증 에러
  // formState.isSubmitting: 제출 중 여부
  // defaultValues: 초기값 (create 모드)
  // values: 제어 모드. edit 모드일 때 user 데이터로 폼 값 동기화
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      department: user?.department ?? "",
      email: user?.email ?? "",
    },
    values:
      mode === "edit" && user
        ? {
            name: user.name,
            department: user.department ?? "",
            email: user.email ?? "",
          }
        : undefined,
  });

  // ----- 폼 제출 핸들러 -----
  // values: Zod 검증 통과한 값. trim()으로 공백 제거
  // create: CreateUserRequest. update: UpdateUserRequest
  // mutate(): mutation 실행. 비동기이므로 await 없음
  const onSubmit = async (values: UserFormValues) => {
    const name = values.name.trim();
    const dept = values.department?.trim();
    const em = values.email?.trim();
    if (mode === "create") {
      const body: CreateUserRequest = { name };
      if (dept) body.department = dept;
      if (em) body.email = em;
      createMutation.mutate(body);
    } else {
      const body: UpdateUserRequest = { name };
      if (dept) body.department = dept;
      if (em) body.email = em;
      updateMutation.mutate(body);
    }
  };

  // ----- Early return: 로딩 / 사용자 없음 -----
  // 수정 모드일 때 데이터 로딩 중이면 로딩 메시지
  if (mode === "edit" && isLoading) {
    return <p className="text-gray-500">{t("common.loading")}</p>;
  }
  // 수정 모드인데 user가 없으면 (404) 에러 메시지 + 목록으로 버튼
  if (mode === "edit" && !user) {
    return (
      <div>
        <p className="text-red-600">{t("users.notFound")}</p>
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="mt-2 text-blue-600 hover:underline"
        >
          {t("users.backToList")}
        </button>
      </div>
    );
  }

  // ----- 폼 JSX -----
  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">
        {mode === "create" ? t("users.addUser") : t("users.editUser")}
      </h1>
      {/* handleSubmit(onSubmit): 제출 시 검증 후 onSubmit 호출 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("users.name")} *
          </label>
          <input
            {...register("name")}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{t("users.required")}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("users.department")}
          </label>
          <input
            {...register("department")}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("users.email")}
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {t("users.invalidEmail")}
            </p>
          )}
        </div>
        {/* API 에러 전체 폼 에러 표시 */}
        {errors.root && (
          <p className="text-sm text-red-600">{errors.root.message}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              createMutation.isPending ||
              updateMutation.isPending
            }
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ||
            createMutation.isPending ||
            updateMutation.isPending
              ? t("common.loading")
              : t("common.save")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
