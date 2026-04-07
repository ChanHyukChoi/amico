import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fetchUser, createUser, updateUser } from "@/api/users";
import { getApiErrorMessage } from "@/api/apiErrorMessages";
import { API_ERROR_CODES } from "@/api/apiErrorCodes";
import type { CreateUserRequest, UpdateUserRequest } from "@/types/user";
import { Button, TextField, Box, Stack } from "@mui/material";

const createUserFormSchema = z
  .object({
    userId: z.string().min(1, "필수 입력입니다."),
    password: z.string().min(1, "필수 입력입니다."),
    passwordConfirm: z.string().min(1, "필수 입력입니다."),
    name: z.string().min(1, "필수 입력입니다."),
    department: z.string().optional(),
    email: z.union([
      z.string().email("올바른 이메일 형식이 아닙니다."),
      z.literal(""),
    ]),
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
    email: z.union([
      z.string().email("올바른 이메일 형식이 아닙니다."),
      z.literal(""),
    ]),
  })
  .refine((data) => !data.password || data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["passwordConfirm"],
  });

type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
type EditUserFormValues = z.infer<typeof editUserFormSchema>;
type UserFormValues = CreateUserFormValues | EditUserFormValues;

export default function UserFormView({
  mode,
  onRequestClose,
}: {
  mode: "create" | "edit";
  onRequestClose: () => void;
}) {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(Number(id)),
    enabled: mode === "edit" && !!id,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (res) => {
      if (!res.success) {
        if (res.code === API_ERROR_CODES.USER_ID_DUPLICATE) {
          setError("userId", {
            message: getApiErrorMessage(t, res.code, res.status),
          });
        } else {
          setError("root", {
            message: getApiErrorMessage(t, res.code, res.status),
          });
        }
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onRequestClose();
    },
    onError: (err: Error) => {
      setError("root", { message: err.message || "저장에 실패했습니다." });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: UpdateUserRequest) => updateUser(Number(id), body),
    onSuccess: (res) => {
      if (!res.success) {
        if (res.code === API_ERROR_CODES.USER_ID_DUPLICATE) {
          setError("userId", {
            message: getApiErrorMessage(t, res.code, res.status),
          });
        } else {
          setError("root", {
            message: getApiErrorMessage(t, res.code, res.status),
          });
        }
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", Number(id)] });
      onRequestClose();
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
      mode === "create" ? createUserFormSchema : editUserFormSchema,
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

  const registerTextField = (name: keyof UserFormValues) => {
    const { ref, ...rest } = register(name);
    return { ...rest, inputRef: ref };
  };

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
    return <p className="text-gray-500">{t("common.loading")}</p>;
  }
  if (mode === "edit" && !user) {
    return (
      <Box>
        <p style={{ color: "#dc2626" }}>{t("users.notFound")}</p>
        <Button
          variant="text"
          sx={{ mt: 2, p: 0, minHeight: "auto" }}
          onClick={onRequestClose}
        >
          {t("users.backToList")}
        </Button>
      </Box>
    );
  }

  //return
  return (
    <Box sx={{ width: "100%", maxWidth: 500 }}>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={2}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          {mode === "create" ? t("users.addUser") : t("users.editUser")}
        </h1>

        <TextField
          label={`${t("users.userId")} *`}
          {...registerTextField("userId")}
          error={!!errors.userId}
          helperText={errors.userId?.message}
          InputProps={{ readOnly: mode === "edit" }}
          fullWidth
        />

        {mode === "create" && (
          <>
            <TextField
              label={`${t("users.password")} *`}
              type="password"
              {...registerTextField("password")}
              error={!!errors.password}
              helperText={errors.password ? t("users.required") : undefined}
              fullWidth
            />
            <TextField
              label={`${t("users.passwordConfirm")} *`}
              type="password"
              {...registerTextField("passwordConfirm")}
              error={!!errors.passwordConfirm}
              helperText={
                errors.passwordConfirm ? t("users.passwordMismatch") : undefined
              }
              fullWidth
            />
          </>
        )}

        {mode === "edit" && (
          <>
            <TextField
              label={t("users.password")}
              type="password"
              placeholder={t("users.passwordChangeOptional")}
              {...registerTextField("password")}
              fullWidth
            />
            <TextField
              label={t("users.passwordConfirm")}
              type="password"
              placeholder={t("users.passwordChangeOptional")}
              {...registerTextField("passwordConfirm")}
              error={!!errors.passwordConfirm}
              helperText={
                errors.passwordConfirm ? t("users.passwordMismatch") : undefined
              }
              fullWidth
            />
          </>
        )}

        <TextField
          label={`${t("users.name")} *`}
          {...registerTextField("name")}
          error={!!errors.name}
          helperText={errors.name ? t("users.required") : undefined}
          fullWidth
        />

        <TextField
          label={t("users.department")}
          {...registerTextField("department")}
          fullWidth
        />

        <TextField
          label={t("users.email")}
          type="email"
          {...registerTextField("email")}
          error={!!errors.email}
          helperText={errors.email ? t("users.invalidEmail") : undefined}
          fullWidth
        />

        {errors.root && (
          <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>
            {errors.root.message}
          </p>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            type="submit"
            variant="contained"
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
          <Button type="button" variant="outlined" onClick={onRequestClose}>
            {t("common.cancel")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
