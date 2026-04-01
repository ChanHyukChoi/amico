import { useTranslation } from "react-i18next";
import { Link as RouterLink, NavLink, Outlet, useParams } from "react-router-dom";
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

const sxNavButton = {
  borderRadius: 1,
  "&.active": {
    bgcolor: "action.selected",
  },
};

export default function DeviceSettingsLayout() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const items: { path: string; labelKey: string }[] = [
    { path: "identification", labelKey: "devices.settings.nav.identification" },
    { path: "wiegand", labelKey: "devices.settings.nav.wiegand" },
    { path: "osdp", labelKey: "devices.settings.nav.osdp" },
    { path: "hid", labelKey: "devices.settings.nav.hid" },
    { path: "display", labelKey: "devices.settings.nav.display" },
    {
      path: "identification-methods",
      labelKey: "devices.settings.nav.identificationMethods",
    },
    { path: "facial", labelKey: "devices.settings.nav.facial" },
    { path: "attendance", labelKey: "devices.settings.nav.attendance" },
    { path: "access-display", labelKey: "devices.settings.nav.accessDisplay" },
  ];

  return (
    <Stack spacing={2} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
      >
        <Typography variant="h5" component="h1" fontWeight={600}>
          {t("devices.settingsTitle", { id: id ?? "" })}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            component={RouterLink}
            to={`/devices/${id ?? ""}`}
            size="small"
            variant="text"
          >
            {t("devices.settingsEditDevice")}
          </Button>
          <Button component={RouterLink} to="/devices" size="small" variant="text">
            {t("devices.backToList")}
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            width: { xs: "100%", md: 240 },
            flexShrink: 0,
            maxHeight: { xs: 280, md: "none" },
            overflow: "auto",
          }}
        >
          <List dense disablePadding sx={{ py: 1, px: 0.5 }}>
            {items.map(({ path, labelKey }) => (
              <ListItemButton
                key={path}
                component={NavLink}
                to={path}
                relative="path"
                sx={sxNavButton}
              >
                <ListItemText
                  primary={t(labelKey)}
                  primaryTypographyProps={{ variant: "body2" }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            minWidth: 0,
            p: 2,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Paper>
      </Box>
    </Stack>
  );
}
