import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fetchUser, createUser, updateUser } from "@/api/users";
import type { CreateUserRequest, UpdateUserRequest } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const createUserFormSchema = z
  .object({
    userId: z.string().min(1, "필수 입력입니다."),
    password: z.string().min(1, "필수 입력입니다."),
    passwordConfirm: z.string().min(1, "필수 입력입니다."),
    name: z.string().min(1, "필수 입력입니다."),
    department: z.string().optional(),
    email: z.union([z.string().email("올바른 이메일 형식이 아닙니다."), z.literal("")]),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

const editUserFormSchema = z
  .object({
    userId: z.string().min(1, "필수 입력입니다."),
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
    name: z.string().min(1, "필수 입력입니다."),
    department: z.string().optional(),
    email: z.union([z.string().email("올바른 이메일 형식이 아닙니다."), z.literal("")]),
  })
  .refine(
    (data) =>
      !data.password || data.password === data.passwordConfirm,
    { message: "비밀번호가 일치하지 않습니다.", path: ["passwordConfirm"] }
  );

type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
type EditUserFormValues = z.infer<typeof editUserFormSchema>;
type UserFormValues = CreateUserFormValues | EditUserFormValues;

export default function UserFormView({ mode }: { mode: "create" | "edit" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id!),
    enabled: mode === "edit" && !!id,
  });

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

  const user = userData?.success && userData.data ? userData.data : null;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(
      mode === "create" ? createUserFormSchema : editUserFormSchema
    ),
    defaultValues: {
      userId: user?.userId ?? "",
      password: "",
      passwordConfirm: "",
      name: user?.name ?? "",
      department: user?.department ?? "",
      email: user?.email ?? "",
    },
    values:
      mode === "edit" && user
        ? {
            userId: user.userId,
            password: "",
            passwordConfirm: "",
            name: user.name,
            department: user.department ?? "",
            email: user.email ?? "",
          }
        : undefined,
  });

  const onSubmit = async (values: UserFormValues) => {
    const name = values.name.trim();
    const dept = values.department?.trim();
    const em = values.email?.trim();
    const uid = values.userId.trim();
    if (mode === "create") {
      const v = values as CreateUserFormValues;
      const body: CreateUserRequest = {
        userId: uid,
        password: v.password,
        name,
      };
      if (dept) body.department = dept;
      if (em) body.email = em;
      createMutation.mutate(body);
    } else {
      const v = values as EditUserFormValues;
      const body: UpdateUserRequest = { userId: uid, name };
      if (dept) body.department = dept;
      if (em) body.email = em;
      if (v.password?.trim()) body.password = v.password.trim();
      updateMutation.mutate(body);
    }
  };

  if (mode === "edit" && isLoading) {
    return (
      <p className="text-muted-foreground">{t("common.loading")}</p>
    );
  }
  if (mode === "edit" && !user) {
    return (
      <div>
        <p className="text-destructive">{t("users.notFound")}</p>
        <Button
          variant="link"
          className="mt-2 p-0 h-auto"
          onClick={() => navigate("/users")}
        >
          {t("users.backToList")}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">
        {mode === "create" ? t("users.addUser") : t("users.editUser")}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId">{t("users.userId")} *</Label>
          <Input
            id="userId"
            {...register("userId")}
            aria-invalid={!!errors.userId}
            readOnly={mode === "edit"}
            className={mode === "edit" ? "bg-muted" : undefined}
          />
          {errors.userId && (
            <p className="text-sm text-destructive">{t("users.required")}</p>
          )}
        </div>
        {mode === "create" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="password">{t("users.password")} *</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{t("users.required")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">
                {t("users.passwordConfirm")} *
              </Label>
              <Input
                id="passwordConfirm"
                type="password"
                {...register("passwordConfirm")}
                aria-invalid={!!errors.passwordConfirm}
              />
              {errors.passwordConfirm && (
                <p className="text-sm text-destructive">
                  {t("users.passwordMismatch")}
                </p>
              )}
            </div>
          </>
        )}
        {mode === "edit" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="password">{t("users.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("users.passwordChangeOptional")}
                {...register("password")}
                aria-invalid={!!errors.password}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">
                {t("users.passwordConfirm")}
              </Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder={t("users.passwordChangeOptional")}
                {...register("passwordConfirm")}
                aria-invalid={!!errors.passwordConfirm}
              />
              {errors.passwordConfirm && (
                <p className="text-sm text-destructive">
                  {t("users.passwordMismatch")}
                </p>
              )}
            </div>
          </>
        )}
        <div className="space-y-2">
          <Label htmlFor="name">{t("users.name")} *</Label>
          <Input
            id="name"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{t("users.required")}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">{t("users.department")}</Label>
          <Input id="department" {...register("department")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("users.email")}</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">
              {t("users.invalidEmail")}
            </p>
          )}
        </div>
        {errors.root && (
          <p className="text-sm text-destructive">{errors.root.message}</p>
        )}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {isSubmitting ||
            createMutation.isPending ||
            updateMutation.isPending
              ? t("common.loading")
              : t("common.save")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/users")}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
