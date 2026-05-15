"use client";

import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import TranslateIcon from "@mui/icons-material/Translate";
import CheckIcon from "@mui/icons-material/Check";
import PulseIcon from "@mui/icons-material/FiberManualRecord";
import { useApp } from "@/contexts/app-context";
import { SystemStateBadge } from "./SystemStateBadge";
import type { Language } from "@/lib/translations";
import type { SystemState } from "@/hooks/use-patient-data";

interface TopBarProps {
  onMenuClick: () => void;
  isOnline: boolean;
  lastUpdated: Date | null;
  systemState?: SystemState;
}

const DRAWER_WIDTH = 280;

export function TopBar({ onMenuClick, isOnline, lastUpdated, systemState = "NORMAL" }: TopBarProps) {
  const { mode, toggleMode, language, setLanguage, t, direction } = useApp();
  const [timeAgo, setTimeAgo] = useState<string>("");
  const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdated) {
        setTimeAgo(t("never"));
        return;
      }

      const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);

      if (seconds < 5) {
        setTimeAgo(t("justNow"));
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}${t("secondsAgo")}`);
      } else {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`${minutes}${t("minutesAgo")}`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated, t]);

  const handleLangMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchor(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangAnchor(null);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    handleLangMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ...(direction === "rtl"
          ? { mr: { md: `${DRAWER_WIDTH}px` } }
          : { ml: { md: `${DRAWER_WIDTH}px` } }),
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: { xs: 64, sm: 70 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            color="inherit"
            onClick={onMenuClick}
            sx={{
              display: { md: "none" },
              color: "text.primary",
              "&:hover": {
                bgcolor: isDark ? "rgba(0, 191, 166, 0.08)" : "rgba(0, 119, 182, 0.08)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1 }}>
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight={700}
              sx={{ letterSpacing: "-0.01em" }}
            >
              {t("dashboardTitle")}
            </Typography>
            {/* Live pulse indicator */}
            {isOnline && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1.5,
                  py: 0.3,
                  borderRadius: 2,
                  bgcolor: isDark ? "rgba(0, 230, 118, 0.1)" : "rgba(46, 125, 50, 0.08)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(0, 230, 118, 0.2)" : "rgba(46, 125, 50, 0.15)",
                }}
              >
                <PulseIcon
                  sx={{
                    fontSize: 8,
                    color: "success.main",
                    animation: "pulse-glow 1.5s ease-in-out infinite",
                  }}
                />
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  LIVE
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Last Updated */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)",
            }}
          >
            <AccessTimeIcon fontSize="small" sx={{ color: "text.secondary", fontSize: 16 }} />
            <Typography variant="caption" color="text.secondary">
              {t("updated")}: {timeAgo}
            </Typography>
          </Box>

          {/* System State Badge */}
          <Box sx={{ display: { xs: "none", lg: "flex" } }}>
            <SystemStateBadge state={systemState} size="small" />
          </Box>

          {/* Connection Status */}
          <Chip
            icon={
              isOnline ? (
                <WifiIcon sx={{ fontSize: 16 }} />
              ) : (
                <WifiOffIcon sx={{ fontSize: 16 }} />
              )
            }
            label={isOnline ? t("online") : t("offline")}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: isOnline
                ? isDark
                  ? "rgba(0, 230, 118, 0.12)"
                  : "rgba(0, 230, 118, 0.1)"
                : isDark
                  ? "rgba(255, 61, 113, 0.12)"
                  : "rgba(255, 61, 113, 0.1)",
              color: isOnline ? "success.main" : "error.main",
              border: "1px solid",
              borderColor: isOnline
                ? isDark
                  ? "rgba(0, 230, 118, 0.3)"
                  : "rgba(0, 230, 118, 0.2)"
                : isDark
                  ? "rgba(255, 61, 113, 0.3)"
                  : "rgba(255, 61, 113, 0.2)",
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />

          {/* Language Selector */}
          <IconButton
            onClick={handleLangMenuOpen}
            sx={{
              color: "text.secondary",
              "&:hover": {
                bgcolor: isDark ? "rgba(0, 191, 166, 0.08)" : "rgba(0, 119, 182, 0.08)",
                color: "primary.main",
              },
              transition: "all 0.3s ease",
            }}
          >
            <TranslateIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={langAnchor}
            open={Boolean(langAnchor)}
            onClose={handleLangMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: direction === "rtl" ? "left" : "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: direction === "rtl" ? "left" : "right",
            }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: isDark ? "rgba(12, 20, 40, 0.95)" : "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                },
              },
            }}
          >
            <MenuItem onClick={() => handleLanguageChange("en")} sx={{ borderRadius: 2, mx: 1 }}>
              <ListItemIcon>
                {language === "en" && <CheckIcon fontSize="small" color="primary" />}
              </ListItemIcon>
              <ListItemText>{t("english")}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange("ar")} sx={{ borderRadius: 2, mx: 1 }}>
              <ListItemIcon>
                {language === "ar" && <CheckIcon fontSize="small" color="primary" />}
              </ListItemIcon>
              <ListItemText>{t("arabic")}</ListItemText>
            </MenuItem>
          </Menu>

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleMode}
            sx={{
              color: "text.secondary",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                bgcolor: isDark ? "rgba(0, 191, 166, 0.08)" : "rgba(0, 119, 182, 0.08)",
                color: "primary.main",
              },
              transition: "all 0.3s ease",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: mode === "dark" ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              {mode === "light" ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            </Box>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
