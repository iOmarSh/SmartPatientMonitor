"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
  useTheme,
} from "@mui/material";
import MemoryIcon from "@mui/icons-material/Memory";
import SpeedIcon from "@mui/icons-material/Speed";
import StorageIcon from "@mui/icons-material/Storage";
import TimerIcon from "@mui/icons-material/Timer";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import { useApp } from "@/contexts/app-context";
import type { PatientData } from "@/hooks/use-patient-data";

interface DiagnosticsPanelProps {
  data: PatientData | null;
  uptime: number;
  isOnline: boolean;
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function getSignalStrength(rssi: number): { label: string; color: "success" | "warning" | "error"; percent: number } {
  if (rssi >= -50) return { label: "excellent", color: "success", percent: 100 };
  if (rssi >= -60) return { label: "good", color: "success", percent: 75 };
  if (rssi >= -70) return { label: "fair", color: "warning", percent: 50 };
  return { label: "weak", color: "error", percent: 25 };
}

interface DiagCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  progress?: number;
  progressColor?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  chip?: { label: string; color: "success" | "warning" | "error" };
  gradient: string;
  glowColor: string;
}

function DiagCard({ icon, label, value, subtitle, progress, progressColor, chip, gradient, glowColor }: DiagCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
        border: "1px solid",
        borderColor: isDark ? "rgba(100, 180, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: isDark ? "rgba(100, 180, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
          boxShadow: `0 4px 20px ${glowColor}`,
          "& .diag-icon": {
            transform: "scale(1.1)",
          },
        },
      }}
    >
      {/* Background orb */}
      <Box
        sx={{
          position: "absolute",
          top: -10,
          right: -10,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: gradient,
          opacity: 0.06,
          filter: "blur(15px)",
        }}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box className="diag-icon" sx={{ transition: "transform 0.3s ease" }}>
          {icon}
        </Box>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, letterSpacing: "-0.02em" }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.6 }}>
          {subtitle}
        </Typography>
      )}
      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={progress}
          color={progressColor}
          sx={{
            mt: 1.5,
            height: 6,
            borderRadius: 3,
            bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)",
          }}
        />
      )}
      {chip && (
        <Chip
          label={chip.label}
          size="small"
          color={chip.color}
          sx={{ mt: 1.5, fontWeight: 600, fontSize: "0.7rem" }}
        />
      )}
    </Box>
  );
}

export function DiagnosticsPanel({ data, uptime, isOnline: _isOnline }: DiagnosticsPanelProps) {
  const { t } = useApp();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const rssi = data?.rssi ?? -65;
  const freeHeap = data?.freeHeap ?? 180000;
  const cpuUsage = data?.cpuUsage ?? 20;
  const stackHighWaterMark = data?.stackHighWaterMark ?? 2048;
  const taskJitter = data?.taskJitter ?? 2;

  const signal = getSignalStrength(rssi);
  const heapPercent = Math.round((freeHeap / 320000) * 100);
  const isSystemStable = heapPercent > 30 && taskJitter < 10;

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
      {/* System Health Summary */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {t("rtosDiagnostics")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                {t("rtosDescription")}
              </Typography>
            </Box>
            <Chip
              icon={isSystemStable ? <CheckCircleIcon /> : <WarningIcon />}
              label={isSystemStable ? t("systemStable") : t("memoryWarning")}
              sx={{
                fontWeight: 700,
                bgcolor: isSystemStable
                  ? isDark ? "rgba(0, 230, 118, 0.1)" : "rgba(0, 230, 118, 0.08)"
                  : isDark ? "rgba(255, 170, 0, 0.1)" : "rgba(255, 170, 0, 0.08)",
                color: isSystemStable ? "#00E676" : "#FFAA00",
                border: "1px solid",
                borderColor: isSystemStable
                  ? "rgba(0, 230, 118, 0.25)"
                  : "rgba(255, 170, 0, 0.25)",
                "& .MuiChip-icon": {
                  color: isSystemStable ? "#00E676" : "#FFAA00",
                },
              }}
            />
          </Box>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DiagCard
                icon={<SpeedIcon sx={{ color: isDark ? "#00BFA6" : "#0077B6" }} />}
                label={t("cpuUsage")}
                value={`${cpuUsage}%`}
                progress={cpuUsage}
                progressColor={cpuUsage > 80 ? "error" : cpuUsage > 60 ? "warning" : "primary"}
                gradient="linear-gradient(135deg, #00BFA6, #7C4DFF)"
                glowColor="rgba(0, 191, 166, 0.1)"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DiagCard
                icon={<MemoryIcon sx={{ color: isDark ? "#7C4DFF" : "#6C63FF" }} />}
                label={t("freeHeap")}
                value={`${Math.round(freeHeap / 1024)}KB`}
                progress={heapPercent}
                progressColor={heapPercent < 20 ? "error" : heapPercent < 40 ? "warning" : "success"}
                gradient="linear-gradient(135deg, #7C4DFF, #B388FF)"
                glowColor="rgba(124, 77, 255, 0.1)"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DiagCard
                icon={<TimerIcon sx={{ color: isDark ? "#00B0FF" : "#0091EA" }} />}
                label={t("uptime")}
                value={formatUptime(uptime)}
                subtitle="HH:MM:SS"
                gradient="linear-gradient(135deg, #00B0FF, #40C4FF)"
                glowColor="rgba(0, 176, 255, 0.1)"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DiagCard
                icon={<StorageIcon sx={{ color: "#FFAA00" }} />}
                label={t("stackHighWaterMark")}
                value={`${stackHighWaterMark}`}
                subtitle="bytes remaining"
                gradient="linear-gradient(135deg, #FFAA00, #FFD166)"
                glowColor="rgba(255, 170, 0, 0.1)"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DiagCard
                icon={<SpeedIcon sx={{ color: "#FF3D71" }} />}
                label={t("taskJitter")}
                value={`${taskJitter}ms`}
                chip={{
                  label: taskJitter < 5 ? "Excellent" : taskJitter < 10 ? "Good" : "High",
                  color: taskJitter < 5 ? "success" : taskJitter < 10 ? "warning" : "error",
                }}
                gradient="linear-gradient(135deg, #FF3D71, #FF6B9D)"
                glowColor="rgba(255, 61, 113, 0.1)"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <DiagCard
                icon={<SignalCellularAltIcon sx={{ color: isDark ? "#00BFA6" : "#0077B6" }} />}
                label={t("wifiRssi")}
                value={`${rssi} dBm`}
                progress={signal.percent}
                progressColor={signal.color}
                chip={{
                  label: t(signal.label as "excellent" | "good" | "fair" | "weak"),
                  color: signal.color,
                }}
                gradient="linear-gradient(135deg, #00BFA6, #00B0FF)"
                glowColor="rgba(0, 191, 166, 0.1)"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
