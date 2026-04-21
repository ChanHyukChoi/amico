import {
  Autocomplete,
  Box,
  Button,
  Drawer,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDevice, updateDevice } from "@/api/devices/devices";
import type { DeviceModelOption } from "@/constants/deviceModelOptions";
import {
  getDeviceModelSelectOptions,
  getDeviceTypeSelectOptions,
} from "@/constants/deviceModelOptions";
import type { Device } from "@/types/device";

const deviceSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  ip: z.ipv4({ message: "Invalid IP address" }),
  userId: z.string().min(1, { message: "User ID is required" }),
  password: z.string().optional(),
  isActive: z.boolean().default(true),
});

type DeviceForm = z.input<typeof deviceSchema>;

type DeviceDrawerProps = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
  device?: Device;
};

export default function DeviceDrawer({
  open,
  onClose,
  mode,
  device,
}: DeviceDrawerProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeviceForm>({
    resolver: zodResolver(deviceSchema),
    defaultValues:
      mode === "update" && device
        ? {
            description: device.description,
            type: String(device.type),
            model: String(device.model),
            ip: device.ip,
            userId: device.userId,
            password: "",
            isActive: device.isActive,
          }
        : {
            description: "",
            type: "",
            model: "",
            ip: "",
            userId: "",
            password: "",
            isActive: true,
          },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "update" && device) {
      reset({
        description: device.description,
        type: String(device.type),
        model: String(device.model),
        ip: device.ip,
        userId: device.userId,
        password: "",
        isActive: device.isActive,
      });
    } else {
      reset({
        description: "",
        type: "",
        model: "",
        ip: "",
        userId: "",
        password: "",
        isActive: true,
      });
    }
  }, [open, mode, device, reset]);

  const deviceTypeValue = watch("type");

  const typeComboOptions = useMemo(() => getDeviceTypeSelectOptions(), []);
  const modelComboOptions = useMemo(
    () => getDeviceModelSelectOptions(deviceTypeValue),
    [deviceTypeValue],
  );

  const resolveOptionLabel = (opt: DeviceModelOption) =>
    opt.i18nKey ? t(opt.i18nKey) : opt.label;

  const createMutation = useMutation({
    mutationFn: createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: Parameters<typeof updateDevice>[1];
    }) => updateDevice(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      handleClose();
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: DeviceForm) => {
    if (mode === "create") {
      if (!data.password) return; // create는 password 필수
      createMutation.mutate({
        description: data.description,
        type: data.type,
        model: data.model,
        ip: data.ip,
        userId: data.userId,
        password: data.password,
        isActive: data.isActive ?? true,
      });
    } else {
      if (!device) return;
      const body = {
        description: data.description,
        type: data.type,
        model: data.model,
        ip: data.ip,
        userId: data.userId,
        isActive: data.isActive,
        ...(data.password ? { password: data.password } : {}),
      };
      updateMutation.mutate({ id: device.id, body });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Drawer anchor="right" open={open} onClose={handleClose}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          width: 400,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          height: "100%",
        }}
      >
        <Typography variant="h6">
          {mode === "create" ? t("devices.addDevice") : t("devices.editDevice")}
        </Typography>

        <Stack spacing={2} sx={{ flex: 1 }}>
          <TextField
            label={t("devices.description")}
            size="small"
            fullWidth
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Autocomplete
                size="small"
                fullWidth
                options={typeComboOptions}
                getOptionLabel={(opt) => resolveOptionLabel(opt)}
                isOptionEqualToValue={(a, b) => a.value === b.value}
                value={
                  typeComboOptions.find((o) => o.value === field.value) ?? null
                }
                onChange={(_, newValue) => {
                  const next = newValue?.value ?? "";
                  if (next !== field.value) {
                    setValue("model", "");
                  }
                  field.onChange(next);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("devices.type")}
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  />
                )}
              />
            )}
          />
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <Autocomplete
                size="small"
                fullWidth
                disabled={!deviceTypeValue}
                options={modelComboOptions}
                getOptionLabel={(opt) => resolveOptionLabel(opt)}
                isOptionEqualToValue={(a, b) => a.value === b.value}
                value={
                  modelComboOptions.find((o) => o.value === field.value) ?? null
                }
                onChange={(_, newValue) => {
                  field.onChange(newValue?.value ?? "");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("devices.model")}
                    error={!!errors.model}
                    helperText={errors.model?.message}
                  />
                )}
              />
            )}
          />
          <TextField
            label={t("devices.ip")}
            size="small"
            fullWidth
            {...register("ip")}
            error={!!errors.ip}
            helperText={errors.ip?.message}
          />
          <TextField
            label={t("devices.userId")}
            size="small"
            fullWidth
            {...register("userId")}
            error={!!errors.userId}
            helperText={errors.userId?.message}
          />
          <TextField
            label={
              mode === "update"
                ? t("devices.passwordChangeOptional")
                : t("devices.password")
            }
            type="password"
            size="small"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label={t("devices.isActive")}
              />
            )}
          />
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="contained" loading={isPending}>
            {t("common.save")}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
