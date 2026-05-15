"use client";

import { Box, Typography, Chip, useTheme } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import { useApp } from "@/contexts/app-context";
import type { SystemState } from "@/hooks/use-patient-data";

interface SystemStateBadgeProps {
  state: SystemState;
  size?: "small" | "large";
}

const stateConfig: Record<
  SystemState,
  {
    icon: React.ElementType;
    color: string;
    gradient: string;
    glowColor: string;
    labelKey: "stateNormal" | "stateWarning" | "stateDanger" | "stateEmergency";
  }
> = {
  NORMAL: {
    icon: CheckCircleIcon,
    color: "#00E676",
    gradient: "linear-gradient(135deg, #00E676, #69F0AE)",
    glowColor: "rgba(0, 230, 118, 0.3)",
    labelKey: "stateNormal",
  },
  WARNING: {
    icon: WarningIcon,
    color: "#FFAA00",
    gradient: "linear-gradient(135deg, #FFAA00, #FFD166)",
    glowColor: "rgba(255, 170, 0, 0.3)",
    labelKey: "stateWarning",
  },
  DANGER: {
    icon: ErrorIcon,
    color: "#FF3D71",
    gradient: "linear-gradient(135deg, #FF3D71, #FF6B9D)",
    glowColor: "rgba(255, 61, 113, 0.3)",
    labelKey: "stateDanger",
  },
  EMERGENCY: {
    icon: CrisisAlertIcon,
    color: "#FF1744",
    gradient: "linear-gradient(135deg, #FF1744, #FF5252)",
    glowColor: "rgba(255, 23, 68, 0.4)",
    labelKey: "stateEmergency",
  },
};

export function SystemStateBadge({ state, size = "large" }: SystemStateBadgeProps) {
  const { t } = useApp();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const config = stateConfig[state];
  const Icon = config.icon;

  if (size === "small") {
    return (
      <Chip
        icon={<Icon sx={{ color: `${config.color} !important`, fontSize: 16 }} />}
        label={t(config.labelKey)}
        size="small"
        sx={{
          bgcolor: `${config.color}12`,
          color: config.color,
          fontWeight: 700,
          fontSize: "0.7rem",
          border: "1px solid",
          borderColor: `${config.color}33`,
          "& .MuiChip-icon": { color: config.color },
          ...(state === "EMERGENCY" && {
            animation: "pulse-glow 1s infinite",
          }),
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2.5,
        borderRadius: 4,
        background: isDark
          ? `linear-gradient(135deg, ${config.color}08 0%, ${config.color}04 100%)`
          : `linear-gradient(135deg, ${config.color}0A 0%, ${config.color}06 100%)`,
        border: "1px solid",
        borderColor: `${config.color}25`,
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s ease",
        "&:hover": {
          borderColor: `${config.color}40`,
          boxShadow: `0 8px 32px ${config.glowColor}`,
        },
        ...(state === "EMERGENCY" && {
          animation: "pulse-glow 1s infinite",
        }),
      }}
    >
      {/* Background gradient orb */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: config.gradient,
          opacity: 0.08,
          filter: "blur(20px)",
        }}
      />

      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 3,
          background: config.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 24px ${config.glowColor}`,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: -3,
            borderRadius: "inherit",
            background: config.gradient,
            opacity: 0.3,
            filter: "blur(8px)",
            zIndex: -1,
          },
        }}
      >
        <Icon sx={{ color: "white", fontSize: 28 }} />
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {t("systemState")}
        </Typography>
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{
            color: config.color,
            letterSpacing: "0.04em",
            textShadow: `0 0 16px ${config.glowColor}`,
          }}
        >
          {t(config.labelKey)}
        </Typography>
      </Box>
    </Box>
  );
}
