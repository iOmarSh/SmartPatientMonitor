"use client";

import { Card, CardContent, Typography, Box, Chip, useTheme } from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import LightModeIcon from "@mui/icons-material/LightMode";
import StraightenIcon from "@mui/icons-material/Straighten";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useApp } from "@/contexts/app-context";

interface StatCardProps {
  title: string;
  value: number | null;
  unit: string;
  type: "temperature" | "light" | "distance";
  min?: number;
  max?: number;
  isWarning?: boolean;
}

const iconMap = {
  temperature: ThermostatIcon,
  light: LightModeIcon,
  distance: StraightenIcon,
};

const colorConfig = {
  temperature: {
    gradient: "linear-gradient(135deg, #FF3D71 0%, #FF6B9D 50%, #FF9E40 100%)",
    glow: "rgba(255, 61, 113, 0.3)",
    accent: "#FF3D71",
    bgLight: "rgba(255, 61, 113, 0.06)",
    bgDark: "rgba(255, 61, 113, 0.08)",
  },
  light: {
    gradient: "linear-gradient(135deg, #00BFA6 0%, #00B0FF 50%, #7C4DFF 100%)",
    glow: "rgba(0, 191, 166, 0.3)",
    accent: "#00BFA6",
    bgLight: "rgba(0, 191, 166, 0.06)",
    bgDark: "rgba(0, 191, 166, 0.08)",
  },
  distance: {
    gradient: "linear-gradient(135deg, #7C4DFF 0%, #B388FF 50%, #00BFA6 100%)",
    glow: "rgba(124, 77, 255, 0.3)",
    accent: "#7C4DFF",
    bgLight: "rgba(124, 77, 255, 0.06)",
    bgDark: "rgba(124, 77, 255, 0.08)",
  },
};

export function StatCard({
  title,
  value,
  unit,
  type,
  min,
  max,
  isWarning = false,
}: StatCardProps) {
  const Icon = iconMap[type];
  const colors = colorConfig[type];
  const { t } = useApp();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-6px) scale(1.01)",
          boxShadow: `0 16px 40px ${colors.glow}`,
          "& .stat-icon-box": {
            transform: "rotate(10deg) scale(1.1)",
          },
          "& .stat-bg-orb": {
            opacity: 1,
            transform: "scale(1.2)",
          },
        },
        ...(isWarning && {
          animation: "pulse-glow 1.5s infinite",
          border: "2px solid",
          borderColor: "error.main",
          boxShadow: "0 0 30px rgba(255, 61, 113, 0.2)",
        }),
      }}
    >
      {/* Background decorative orb */}
      <Box
        className="stat-bg-orb"
        sx={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: colors.gradient,
          opacity: 0.06,
          transition: "all 0.5s ease",
          filter: "blur(20px)",
        }}
      />

      <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2.5 }}>
          <Box
            className="stat-icon-box"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              background: colors.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 8px 24px ${colors.glow}`,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                inset: -2,
                borderRadius: "inherit",
                background: colors.gradient,
                opacity: 0.3,
                filter: "blur(8px)",
                zIndex: -1,
              },
            }}
          >
            <Icon sx={{ color: "white", fontSize: 28 }} />
          </Box>
          {isWarning && (
            <Chip
              label={t("alert")}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: "rgba(255, 61, 113, 0.12)",
                color: "#FF3D71",
                border: "1px solid rgba(255, 61, 113, 0.3)",
                animation: "pulse-glow 1s infinite",
              }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 1 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              color: isWarning ? "error.main" : "text.primary",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {value !== null ? value.toFixed(1) : "--"}
          </Typography>
          <Typography
            variant="h6"
            fontWeight={500}
            color="text.secondary"
            sx={{ opacity: 0.6 }}
          >
            {unit}
          </Typography>
        </Box>

        {/* Min/Max Stats */}
        {min !== undefined && max !== undefined && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 2,
              pt: 2,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: isDark ? "rgba(0, 176, 255, 0.08)" : "rgba(0, 176, 255, 0.06)",
              }}
            >
              <TrendingDownIcon sx={{ fontSize: 14, color: "info.main" }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {min.toFixed(1)}{unit}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: isDark ? "rgba(255, 170, 0, 0.08)" : "rgba(255, 170, 0, 0.06)",
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 14, color: "warning.main" }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {max.toFixed(1)}{unit}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
