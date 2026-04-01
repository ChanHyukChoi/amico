import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fetchDevice, createDevice, updateDevice } from "@/api/devices";
import { getApiErrorMessage } from "@/api/apiErrorMessages";
import { API_ERROR_CODES } from "@/api/apiErrorCodes";
import type { CreateDeviceRequest, UpdateDeviceRequest } from "@/types/device";
import {
  DEVICE_MODEL_OPTIONS,
  getDeviceModelLabel,
} from "@/constants/deviceModelOptions";
import {
  Button,
  TextField,
  Box,
  Stack,
  Checkbox,
  FormControlLabel,
  MenuItem,
} from "@mui/material";

const createDeviceFormSchema = z.object({
  description: z.string().min(1, "필수 입력입니다."),
  ip: z
    .string()
    .min(1, "필수 입력입니다.")
    .pipe(z.ipv4("올바른 IPv4 형식이 아닙니다.")),
  type: z.string().min(1, "필수 입력입니다."),
  model: z.string().min(1, "필수 입력입니다."),
  userId: z.string().min(1, "필수 입력입니다."),
  password: z.string().min(1, "필수 입력입니다."),
  isActive: z.boolean(),
});

const editDeviceFormSchema = z.object({
  description: z.string().min(1, "필수 입력입니다."),
  ip: z
    .string()
    .min(1, "필수 입력입니다.")
    .pipe(z.ipv4("올바른 IPv4 형식이 아닙니다.")),
  type: z.string().min(1, "필수 입력입니다."),
  model: z.string().min(1, "필수 입력입니다."),
  userId: z.string().min(1, "필수 입력입니다."),
  password: z.string().optional(),
  isActive: z.boolean(),
});

type CreateDeviceFormValues = z.infer<typeof createDeviceFormSchema>;
type EditDeviceFormValues = z.infer<typeof editDeviceFormSchema>;
type DeviceFormValues = CreateDeviceFormValues | EditDeviceFormValues;

export default function DeviceFormView({ mode }: { mode: "create" | "edit" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: deviceData, isLoading } = useQuery({
    queryKey: ["device", id],
    queryFn: () => fetchDevice(Number(id)),
    enabled: mode === "edit" && !!id,
  });

  const createMutation = useMutation({
    mutationFn: createDevice,
    onSuccess: (res) => {
      if (!res.success) {
        if (res.code === API_ERROR_CODES.USER_INVALID_ID) {
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
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      navigate("/devices");
    },
    onError: (err: Error) => {
      setError("root", { message: err.message || "저장에 실패했습니다." });
    },
  });
  const updateMutation = useMutation({
    mutationFn: (body: UpdateDeviceRequest) => updateDevice(Number(id), body),
    onSuccess: (res) => {
      if (!res.success) {
        if (res.code === API_ERROR_CODES.USER_INVALID_ID) {
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
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["device", Number(id)] });
      navigate("/devices");
    },
    onError: (err: Error) => {
      setError("root", { message: err.message || "수정에 실패했습니다." });
    },
  });
  const device =
    deviceData?.success && deviceData.data ? deviceData.data : null;
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DeviceFormValues>({
    resolver: zodResolver(
      mode === "create" ? createDeviceFormSchema : editDeviceFormSchema,
    ),
    defaultValues: {
      description: device?.description ?? "",
      ip: device?.ip ?? "",
      type: device?.type ?? "",
      model: device?.model ?? "0",
      userId: device?.userId != null ? String(device.userId) : "",
      password: "",
      isActive: device?.isActive ?? true,
    },
    values:
      mode === "edit" && device
        ? {
            description: device.description ?? "",
            ip: device.ip ?? "",
            type: device.type ?? "",
            model: device.model ?? "0",
            userId: String(device.userId),
            password: "",
            isActive: device.isActive ?? true,
          }
        : undefined,
  });
  const registerTextField = (name: keyof DeviceFormValues) => {
    const { ref, ...rest } = register(name);
    return { ...rest, inputRef: ref };
  };
  const onSubmit = async (values: DeviceFormValues) => {
    const description = values.description.trim();
    const ip = values.ip.trim();
    const type = values.type.trim();
    const model = values.model.trim();
    const userId = values.userId.trim();
    const password = (values as CreateDeviceFormValues).password?.trim();
    const isActive = values.isActive;
    if (mode === "create") {
      const body: CreateDeviceRequest = {
        description,
        ip,
        type,
        model,
        userId,
        password: password ?? "",
        isActive,
      };
      createMutation.mutate(body);
    } else {
      const v = values as EditDeviceFormValues;
      const body: UpdateDeviceRequest = {
        description,
        ip,
        type,
        model,
        userId,
        isActive,
      };
      if (v.password?.trim()) body.password = v.password.trim();
      updateMutation.mutate(body);
    }
  };
  if (mode === "edit" && isLoading) {
    return <p className="text-gray-500">{t("common.loading")}</p>;
  }
  if (mode === "edit" && !device) {
    return (
      <Box>
        <p style={{ color: "#dc2626" }}>{t("devices.notFound")}</p>
        <Button
          variant="text"
          sx={{ mt: 2, p: 0, minHeight: "auto" }}
          onClick={() => navigate("/devices")}
        >
          {t("devices.backToList")}
        </Button>
      </Box>
    );
  }
  return (
    <Box sx={{ maxWidth: 448 }}>
      <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={2}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          {mode === "create" ? t("devices.addDevice") : t("devices.editDevice")}
        </h1>

        <TextField
          label={`${t("devices.description")} *`}
          {...registerTextField("description")}
          error={!!errors.description}
          helperText={errors.description?.message}
          fullWidth
        />

        <TextField
          label={`${t("devices.ip")} *`}
          {...registerTextField("ip")}
          error={!!errors.ip}
          helperText={errors.ip?.message}
          fullWidth
        />

        <TextField
          label={`${t("devices.type")} *`}
          {...registerTextField("type")}
          error={!!errors.type}
          helperText={errors.type?.message}
          fullWidth
        />

        <Controller
          name="model"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label={`${t("devices.model")} *`}
              value={field.value ?? "0"}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              error={!!errors.model}
              helperText={errors.model?.message}
              fullWidth
            >
              {DEVICE_MODEL_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {getDeviceModelLabel(opt.value, t)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <TextField
          label={`${t("devices.userId")} *`}
          inputMode="numeric"
          {...registerTextField("userId")}
          error={!!errors.userId}
          helperText={errors.userId?.message}
          fullWidth
        />

        {mode === "create" && (
          <TextField
            label={`${t("devices.password")} *`}
            type="password"
            {...registerTextField("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
          />
        )}

        {mode === "edit" && (
          <TextField
            label={t("devices.password")}
            type="password"
            placeholder={t("devices.passwordChangeOptional")}
            {...registerTextField("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            fullWidth
          />
        )}

        <FormControlLabel
          control={<Checkbox {...register("isActive")} />}
          label={t("devices.isActive")}
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
          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate("/devices")}
          >
            {t("common.cancel")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
