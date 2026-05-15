"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Typography, IconButton, Slide } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import CrisisAlertIcon from "@mui/icons-material/CrisisAlert";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import CloseIcon from "@mui/icons-material/Close";
import { useApp } from "@/contexts/app-context";
import type { SystemState } from "@/hooks/use-patient-data";

interface EmergencyAlertProps {
  isEmergency: boolean;
  temperature?: number;
  systemState?: SystemState;
  onDismiss?: () => void;
  isMuted?: boolean;
}

const alertConfig: Record<
  "EMERGENCY" | "DANGER" | "WARNING",
  {
    icon: React.ElementType;
    gradient: string;
    gradientFlash: string;
    overlayColor: string;
    glowColor: string;
  }
> = {
  EMERGENCY: {
    icon: CrisisAlertIcon,
    gradient: "linear-gradient(135deg, #c62828 0%, #FF1744 50%, #FF5252 100%)",
    gradientFlash: "linear-gradient(135deg, #b71c1c 0%, #d32f2f 50%, #FF1744 100%)",
    overlayColor: "rgba(198, 40, 40, 0.15)",
    glowColor: "rgba(255, 23, 68, 0.4)",
  },
  DANGER: {
    icon: ErrorIcon,
    gradient: "linear-gradient(135deg, #FF3D71 0%, #FF6B9D 50%, #FF3D71 100%)",
    gradientFlash: "linear-gradient(135deg, #c62828 0%, #FF3D71 50%, #FF6B9D 100%)",
    overlayColor: "rgba(255, 61, 113, 0.1)",
    glowColor: "rgba(255, 61, 113, 0.3)",
  },
  WARNING: {
    icon: WarningAmberIcon,
    gradient: "linear-gradient(135deg, #FFAA00 0%, #FFD166 50%, #FFAA00 100%)",
    gradientFlash: "linear-gradient(135deg, #e65100 0%, #FFAA00 50%, #FFD166 100%)",
    overlayColor: "rgba(255, 170, 0, 0.08)",
    glowColor: "rgba(255, 170, 0, 0.3)",
  },
};

export function EmergencyAlert({
  isEmergency,
  temperature,
  systemState = "NORMAL",
  onDismiss,
  isMuted: externalMuted,
}: EmergencyAlertProps) {
  const [localMuted, setLocalMuted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const { t, direction } = useApp();

  const isMuted = externalMuted ?? localMuted;
  const isHighTemp = temperature !== undefined && temperature >= 38;
  const alertLevel = isEmergency || systemState === "EMERGENCY"
    ? "EMERGENCY"
    : systemState === "DANGER" || isHighTemp
      ? "DANGER"
      : systemState === "WARNING"
        ? "WARNING"
        : null;

  const showAlert = alertLevel !== null;
  const config = alertLevel ? alertConfig[alertLevel] : null;
  const Icon = config?.icon ?? WarningAmberIcon;

  // Flash effect
  useEffect(() => {
    if (!showAlert) {
      setIsFlashing(false);
      return;
    }

    const interval = setInterval(() => {
      setIsFlashing((prev) => !prev);
    }, alertLevel === "EMERGENCY" ? 300 : 500);

    return () => clearInterval(interval);
  }, [showAlert, alertLevel]);

  // Audio alert using Web Audio API
  useEffect(() => {
    const cleanup = async () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
        oscillatorRef.current = null;
      }

      if (audioContextRef.current) {
        const ctx = audioContextRef.current;
        audioContextRef.current = null; // Nullify early to avoid re-entry
        if (ctx.state !== "closed") {
          try {
            await ctx.close();
          } catch (e) {
            // Ignore errors during close
          }
        }
      }
    };

    if (showAlert && !isMuted && (alertLevel === "DANGER" || alertLevel === "EMERGENCY")) {
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      audioContextRef.current = audioContext;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = alertLevel === "EMERGENCY" ? 1000 : 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0;

      try {
        oscillator.start();
      } catch (e) {
        console.error("Failed to start oscillator", e);
      }

      const beepInterval = setInterval(() => {
        if (gainNode && audioContext.state === "running") {
          const now = audioContext.currentTime;
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        }
      }, alertLevel === "EMERGENCY" ? 500 : 1000);

      return () => {
        clearInterval(beepInterval);
        cleanup();
      };
    } else {
      cleanup();
    }
  }, [showAlert, isMuted, alertLevel]);

  if (!showAlert || !config) return null;

  const getAlertMessage = () => {
    if (isEmergency || systemState === "EMERGENCY") {
      return t("emergencyActivated");
    }
    if (systemState === "DANGER" || isHighTemp) {
      return temperature
        ? `${t("dangerState")}: ${temperature.toFixed(1)}°C`
        : t("dangerState");
    }
    if (systemState === "WARNING") {
      return t("warningState");
    }
    return t("highTempAlert");
  };

  return (
    <>
      {/* Overlay Flash Effect */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: config.overlayColor,
          opacity: isFlashing ? 1 : 0,
          transition: "opacity 0.2s",
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />

      {/* Alert Banner */}
      <Slide direction="down" in={showAlert}>
        <Box
          sx={{
            position: "fixed",
            top: 70,
            left: direction === "rtl" ? 0 : { xs: 0, md: 280 },
            right: direction === "rtl" ? { xs: 0, md: 280 } : 0,
            zIndex: 9999,
            background: isFlashing ? config.gradientFlash : config.gradient,
            color: "white",
            py: 2,
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            boxShadow: `0 8px 32px ${config.glowColor}`,
            transition: "background 0.2s",
            backdropFilter: "blur(10px)",
          }}
        >
          <Icon
            sx={{
              fontSize: 32,
              animation: "shake 0.5s infinite",
              filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))",
              "@keyframes shake": {
                "0%, 100%": { transform: "rotate(-5deg)" },
                "50%": { transform: "rotate(5deg)" },
              },
            }}
          />

          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              flex: 1,
              textAlign: "center",
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {getAlertMessage()}
          </Typography>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            {externalMuted === undefined && (
              <IconButton
                size="small"
                onClick={() => setLocalMuted(!localMuted)}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
                }}
              >
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
            )}
            {onDismiss && (
              <IconButton
                size="small"
                onClick={onDismiss}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      </Slide>
    </>
  );
}
