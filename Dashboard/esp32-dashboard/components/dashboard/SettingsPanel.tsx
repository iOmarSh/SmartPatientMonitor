"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useApp } from "@/contexts/app-context";
import LinkIcon from "@mui/icons-material/Link";
import TuneIcon from "@mui/icons-material/Tune";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SaveIcon from "@mui/icons-material/Save";

interface SettingsPanelProps {
  esp32Url: string;
  onUrlChange: (url: string) => void;
  warningThreshold: number;
  dangerThreshold: number;
  onWarningChange: (value: number) => void;
  onDangerChange: (value: number) => void;
  isOnline?: boolean;
  isDemoMode?: boolean;
  error?: string | null;
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: subtitle ? 0.5 : 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2.5,
          background: isDark
            ? "linear-gradient(135deg, rgba(0, 191, 166, 0.1) 0%, rgba(124, 77, 255, 0.1) 100%)"
            : "linear-gradient(135deg, rgba(0, 119, 182, 0.08) 0%, rgba(108, 99, 255, 0.08) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid",
          borderColor: isDark ? "rgba(0, 191, 166, 0.2)" : "rgba(0, 119, 182, 0.15)",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export function SettingsPanel({
  esp32Url,
  onUrlChange,
  warningThreshold,
  dangerThreshold,
  onWarningChange,
  onDangerChange,
  isOnline = false,
  isDemoMode = true,
  error = null,
}: SettingsPanelProps) {
  const [tempUrl, setTempUrl] = useState(esp32Url);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { t } = useApp();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleSave = () => {
    onUrlChange(tempUrl);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        animation: "fadeIn 0.5s ease-out",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <Card>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<LinkIcon sx={{ color: "primary.main", fontSize: 20 }} />}
            title={t("connectionSettings")}
            subtitle={t("connectionDescription")}
          />

          <TextField
            fullWidth
            label={t("esp32Endpoint")}
            placeholder={t("esp32Placeholder")}
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            helperText={
              error
                ? error
                : isDemoMode
                  ? "Enter your ESP32 IP to connect (e.g. 192.168.1.100)"
                  : isOnline
                    ? `✓ Connected to ${esp32Url}`
                    : "Trying to connect..."
            }
            error={!!error}
            color={isOnline && !isDemoMode ? "success" : undefined}
            sx={{
              mt: 3,
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              },
              ...(isOnline && !isDemoMode && {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "success.main",
                },
              }),
            }}
          />

          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: 3,
              py: 1.2,
              background: isDark
                ? "linear-gradient(135deg, #00BFA6, #7C4DFF)"
                : "linear-gradient(135deg, #0077B6, #6C63FF)",
              "&:hover": {
                background: isDark
                  ? "linear-gradient(135deg, #00968A, #5C3DD8)"
                  : "linear-gradient(135deg, #005F8A, #5548D8)",
              },
            }}
          >
            {t("saveConnection")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<TuneIcon sx={{ color: "primary.main", fontSize: 20 }} />}
            title={t("alertThresholds")}
            subtitle={t("thresholdDescription")}
          />

          <Box sx={{ px: 2, mb: 4, mt: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "#FFAA00",
                  boxShadow: "0 0 8px rgba(255, 170, 0, 0.4)",
                }}
              />
              <Typography fontWeight={600} sx={{ color: "#FFAA00" }}>
                {t("warningThreshold")}: {warningThreshold}°C
              </Typography>
            </Box>
            <Slider
              value={warningThreshold}
              onChange={(_, value) => onWarningChange(value as number)}
              min={35}
              max={40}
              step={0.1}
              marks={[
                { value: 35, label: "35°C" },
                { value: 37, label: "37°C" },
                { value: 38, label: "38°C" },
                { value: 40, label: "40°C" },
              ]}
              valueLabelDisplay="auto"
              sx={{
                color: "#FFAA00",
                "& .MuiSlider-thumb": {
                  boxShadow: "0 0 12px rgba(255, 170, 0, 0.4)",
                  "&:hover": {
                    boxShadow: "0 0 20px rgba(255, 170, 0, 0.5)",
                  },
                },
                "& .MuiSlider-track": {
                  background: "linear-gradient(90deg, #FFD166, #FFAA00)",
                },
              }}
            />
          </Box>

          <Box sx={{ px: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "#FF3D71",
                  boxShadow: "0 0 8px rgba(255, 61, 113, 0.4)",
                }}
              />
              <Typography fontWeight={600} sx={{ color: "#FF3D71" }}>
                {t("dangerThreshold")}: {dangerThreshold}°C
              </Typography>
            </Box>
            <Slider
              value={dangerThreshold}
              onChange={(_, value) => onDangerChange(value as number)}
              min={36}
              max={42}
              step={0.1}
              marks={[
                { value: 36, label: "36°C" },
                { value: 38, label: "38°C" },
                { value: 40, label: "40°C" },
                { value: 42, label: "42°C" },
              ]}
              valueLabelDisplay="auto"
              sx={{
                color: "#FF3D71",
                "& .MuiSlider-thumb": {
                  boxShadow: "0 0 12px rgba(255, 61, 113, 0.4)",
                  "&:hover": {
                    boxShadow: "0 0 20px rgba(255, 61, 113, 0.5)",
                  },
                },
                "& .MuiSlider-track": {
                  background: "linear-gradient(90deg, #FF6B9D, #FF3D71)",
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<NotificationsIcon sx={{ color: "primary.main", fontSize: 20 }} />}
            title={t("notificationSettings")}
          />

          <Divider sx={{ my: 2, opacity: 0.3 }} />

          <FormControlLabel
            control={
              <Switch
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: isDark ? "#00BFA6" : "#0077B6",
                    "& + .MuiSwitch-track": {
                      bgcolor: isDark ? "rgba(0, 191, 166, 0.4)" : "rgba(0, 119, 182, 0.4)",
                    },
                  },
                }}
              />
            }
            label={
              <Typography fontWeight={500}>{t("enableAudioAlerts")}</Typography>
            }
          />
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ ml: 6, mt: -0.5, opacity: 0.7 }}
          >
            {t("audioDescription")}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: isDark ? "#00BFA6" : "#0077B6",
                    "& + .MuiSwitch-track": {
                      bgcolor: isDark ? "rgba(0, 191, 166, 0.4)" : "rgba(0, 119, 182, 0.4)",
                    },
                  },
                }}
              />
            }
            label={
              <Typography fontWeight={500}>{t("autoRefresh")}</Typography>
            }
            sx={{ mt: 2 }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ ml: 6, mt: -0.5, opacity: 0.7 }}
          >
            {t("autoRefreshDescription")}
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<InfoOutlinedIcon sx={{ color: "primary.main", fontSize: 20 }} />}
            title={t("about")}
          />
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
            {t("appName")} {t("version")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, opacity: 0.6 }}>
            {t("aboutDescription")}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
