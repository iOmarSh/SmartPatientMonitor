"use client";

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import BugReportIcon from "@mui/icons-material/BugReport";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useApp } from "@/contexts/app-context";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const DRAWER_WIDTH = 280;

export function Sidebar({
  open,
  onClose,
  currentPage,
  onPageChange,
}: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t, direction } = useApp();
  const isDark = theme.palette.mode === "dark";

  const menuItems = [
    { id: "overview", label: t("overview"), icon: <DashboardIcon /> },
    { id: "history", label: t("history"), icon: <HistoryIcon /> },
    { id: "diagnostics", label: t("diagnostics"), icon: <BugReportIcon /> },
    { id: "command", label: t("commandCenter"), icon: <SportsEsportsIcon /> },
    { id: "settings", label: t("settings"), icon: <SettingsIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Decorative gradient line at top */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #00BFA6, #7C4DFF, #FF3D71)",
          borderRadius: "0 0 4px 4px",
        }}
      />

      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          pt: 4,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            background: isDark
              ? "linear-gradient(135deg, #00BFA6 0%, #7C4DFF 100%)"
              : "linear-gradient(135deg, #0077B6 0%, #6C63FF 100%)",
            boxShadow: isDark
              ? "0 4px 20px rgba(0, 191, 166, 0.3)"
              : "0 4px 20px rgba(0, 119, 182, 0.3)",
            animation: "breathe 3s ease-in-out infinite",
          }}
        >
          <MonitorHeartIcon sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              background: isDark
                ? "linear-gradient(135deg, #00BFA6, #7C4DFF)"
                : "linear-gradient(135deg, #0077B6, #6C63FF)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            {t("appName")}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
            {t("appSubtitle")}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ opacity: 0.3, mx: 2 }} />

      {/* Navigation */}
      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const isSelected = currentPage === item.id;
          return (
            <ListItemButton
              key={item.id}
              selected={isSelected}
              onClick={() => {
                onPageChange(item.id);
                if (isMobile) onClose();
              }}
              sx={{
                borderRadius: 3,
                mb: 0.5,
                py: 1.2,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&::before": isSelected
                  ? {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: isDark
                      ? "linear-gradient(135deg, rgba(0, 191, 166, 0.15) 0%, rgba(124, 77, 255, 0.1) 100%)"
                      : "linear-gradient(135deg, rgba(0, 119, 182, 0.1) 0%, rgba(108, 99, 255, 0.08) 100%)",
                    borderRadius: "inherit",
                  }
                  : {},
                "&.Mui-selected": {
                  bgcolor: "transparent",
                  border: "1px solid",
                  borderColor: isDark
                    ? "rgba(0, 191, 166, 0.3)"
                    : "rgba(0, 119, 182, 0.2)",
                  boxShadow: isDark
                    ? "0 4px 16px rgba(0, 191, 166, 0.1)"
                    : "0 4px 16px rgba(0, 119, 182, 0.08)",
                  "&:hover": {
                    bgcolor: "transparent",
                  },
                  "& .MuiListItemIcon-root": {
                    color: isDark ? "#00BFA6" : "#0077B6",
                  },
                  "& .MuiListItemText-root .MuiTypography-root": {
                    color: isDark ? "#00BFA6" : "#0077B6",
                    fontWeight: 700,
                  },
                },
                "&:hover": {
                  bgcolor: isDark
                    ? "rgba(0, 191, 166, 0.05)"
                    : "rgba(0, 119, 182, 0.04)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isSelected
                    ? isDark
                      ? "#00BFA6"
                      : "#0077B6"
                    : "text.secondary",
                  transition: "color 0.3s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={isSelected ? 700 : 500}>
                    {item.label}
                  </Typography>
                }
              />
              {/* Active indicator dot */}
              {isSelected && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: isDark ? "#00BFA6" : "#0077B6",
                    boxShadow: isDark
                      ? "0 0 8px rgba(0, 191, 166, 0.6)"
                      : "0 0 8px rgba(0, 119, 182, 0.4)",
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2.5, borderTop: 1, borderColor: "divider" }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: isDark
              ? "linear-gradient(135deg, rgba(0, 191, 166, 0.05) 0%, rgba(124, 77, 255, 0.05) 100%)"
              : "linear-gradient(135deg, rgba(0, 119, 182, 0.04) 0%, rgba(108, 99, 255, 0.04) 100%)",
            border: "1px solid",
            borderColor: isDark ? "rgba(100, 180, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <FavoriteIcon sx={{ fontSize: 14, color: "#FF3D71" }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {t("footerText")}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.6 }}>
            {t("version")}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor={direction === "rtl" ? "right" : "left"}
        open={open && isMobile}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        anchor={direction === "rtl" ? "right" : "left"}
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: direction === "rtl" ? "none" : "1px solid",
            borderLeft: direction === "rtl" ? "1px solid" : "none",
            borderColor: "divider",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
