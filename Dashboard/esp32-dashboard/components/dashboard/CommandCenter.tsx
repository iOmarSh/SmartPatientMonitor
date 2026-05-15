"use client";

import { Card, CardContent, Typography, Box, Button, Divider, Chip, useTheme } from "@mui/material";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import NetworkPingIcon from "@mui/icons-material/NetworkPing";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import TerminalIcon from "@mui/icons-material/Terminal";
import { useState } from "react";
import { useApp } from "@/contexts/app-context";

interface CommandCenterProps {
  buzzerEnabled: boolean;
  onClearAlarms: () => void;
  onToggleBuzzer: () => Promise<void>;
  onPingDevice: () => Promise<boolean>;
  onToggleMute: () => void;
  isMuted: boolean;
}

interface CommandButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  gradient?: string;
  glowColor?: string;
  disabled?: boolean;
  active?: boolean;
}

function CommandButton({ icon, label, onClick, color, gradient, glowColor, disabled, active }: CommandButtonProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      fullWidth
      sx={{
        justifyContent: "flex-start",
        py: 2,
        px: 2.5,
        borderRadius: 3,
        textTransform: "none",
        fontWeight: 600,
        color: active ? "white" : color,
        bgcolor: active
          ? undefined
          : isDark ? `${color}08` : `${color}06`,
        background: active ? gradient : undefined,
        border: "1px solid",
        borderColor: active ? "transparent" : `${color}25`,
        boxShadow: active ? `0 8px 24px ${glowColor}` : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        gap: 1.5,
        "&:hover": {
          bgcolor: active ? undefined : isDark ? `${color}15` : `${color}10`,
          background: active ? gradient : undefined,
          borderColor: `${color}40`,
          transform: "translateY(-2px)",
          boxShadow: `0 6px 20px ${glowColor || `${color}20`}`,
        },
        "&:disabled": {
          opacity: 0.5,
        },
      }}
    >
      {icon}
      {label}
    </Button>
  );
}

export function CommandCenter({
  buzzerEnabled,
  onClearAlarms,
  onToggleBuzzer,
  onPingDevice,
  onToggleMute,
  isMuted,
}: CommandCenterProps) {
  const { t } = useApp();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [pingStatus, setPingStatus] = useState<"idle" | "success" | "failed">("idle");
  const [loading, setLoading] = useState(false);

  const handlePing = async () => {
    setLoading(true);
    const success = await onPingDevice();
    setPingStatus(success ? "success" : "failed");
    setLoading(false);
    setTimeout(() => setPingStatus("idle"), 3000);
  };

  const handleToggleBuzzer = async () => {
    setLoading(true);
    await onToggleBuzzer();
    setLoading(false);
  };

  return (
    <Card
      sx={{
        animation: "fadeIn 0.5s ease-out",
        "@keyframes fadeIn": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              background: isDark
                ? "linear-gradient(135deg, rgba(124, 77, 255, 0.15) 0%, rgba(0, 191, 166, 0.1) 100%)"
                : "linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(0, 119, 182, 0.08) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid",
              borderColor: isDark ? "rgba(124, 77, 255, 0.25)" : "rgba(108, 99, 255, 0.15)",
            }}
          >
            <TerminalIcon sx={{ color: "secondary.main", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {t("commandCenterTitle")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("commandCenterDescription")}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
          {/* Clear Alarms */}
          <CommandButton
            icon={<ClearAllIcon />}
            label={t("clearAlarms")}
            onClick={onClearAlarms}
            color="#FFAA00"
            glowColor="rgba(255, 170, 0, 0.15)"
          />

          <Divider sx={{ opacity: 0.3 }} />

          {/* Toggle Buzzer */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <CommandButton
                icon={buzzerEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                label={t("toggleBuzzer")}
                onClick={handleToggleBuzzer}
                disabled={loading}
                color={buzzerEnabled ? "#00E676" : "#FF3D71"}
                gradient={buzzerEnabled ? "linear-gradient(135deg, #00E676, #69F0AE)" : undefined}
                glowColor={buzzerEnabled ? "rgba(0, 230, 118, 0.2)" : "rgba(255, 61, 113, 0.15)"}
                active={buzzerEnabled}
              />
            </Box>
            <Chip
              label={buzzerEnabled ? t("buzzerOn") : t("buzzerOff")}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.7rem",
                bgcolor: buzzerEnabled ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 255, 255, 0.05)",
                color: buzzerEnabled ? "#00E676" : "text.secondary",
                border: "1px solid",
                borderColor: buzzerEnabled ? "rgba(0, 230, 118, 0.25)" : "divider",
              }}
            />
          </Box>

          <Divider sx={{ opacity: 0.3 }} />

          {/* Mute Alerts */}
          <CommandButton
            icon={isMuted ? <NotificationsOffIcon /> : <NotificationsActiveIcon />}
            label={isMuted ? t("unmuteAlerts") : t("muteAlerts")}
            onClick={onToggleMute}
            color={isMuted ? "#FF3D71" : isDark ? "#00BFA6" : "#0077B6"}
            gradient={isMuted ? "linear-gradient(135deg, #FF3D71, #FF6B9D)" : undefined}
            glowColor={isMuted ? "rgba(255, 61, 113, 0.2)" : "rgba(0, 191, 166, 0.1)"}
            active={isMuted}
          />

          <Divider sx={{ opacity: 0.3 }} />

          {/* Ping Device */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <CommandButton
                icon={<NetworkPingIcon />}
                label={t("pingDevice")}
                onClick={handlePing}
                disabled={loading}
                color={isDark ? "#00B0FF" : "#0091EA"}
                glowColor="rgba(0, 176, 255, 0.15)"
              />
            </Box>
            {pingStatus !== "idle" && (
              <Chip
                label={pingStatus === "success" ? t("devicePinged") : "Failed"}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  bgcolor: pingStatus === "success" ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 61, 113, 0.1)",
                  color: pingStatus === "success" ? "#00E676" : "#FF3D71",
                  border: "1px solid",
                  borderColor: pingStatus === "success" ? "rgba(0, 230, 118, 0.25)" : "rgba(255, 61, 113, 0.25)",
                }}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
