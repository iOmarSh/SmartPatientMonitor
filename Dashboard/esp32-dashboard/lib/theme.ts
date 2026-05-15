"use client";

import { createTheme, Theme } from "@mui/material/styles";

export const createMedicalTheme = (mode: "light" | "dark"): Theme => {
  const isDark = mode === "dark";

  return createTheme({
    direction: "ltr",
    palette: {
      mode,
      primary: {
        main: isDark ? "#00BFA6" : "#0077B6",
        light: isDark ? "#64FFDA" : "#48CAE4",
        dark: isDark ? "#009682" : "#023E8A",
        contrastText: isDark ? "#000B14" : "#FFFFFF",
      },
      secondary: {
        main: isDark ? "#7C4DFF" : "#6C63FF",
        light: isDark ? "#B47CFF" : "#9D97FF",
        dark: isDark ? "#3F1DCB" : "#4338CA",
        contrastText: "#FFFFFF",
      },
      error: {
        main: "#FF3D71",
        light: "#FF708D",
        dark: "#DB2C56",
      },
      warning: {
        main: "#FFAA00",
        light: "#FFD166",
        dark: "#CC8800",
      },
      success: {
        main: "#00E676",
        light: "#69F0AE",
        dark: "#00C853",
      },
      info: {
        main: "#00B0FF",
        light: "#40C4FF",
        dark: "#0091EA",
      },
      background: {
        default: isDark ? "#050A18" : "#F0F4FF",
        paper: isDark ? "#0C1428" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#E8F0FE" : "#0D1B2A",
        secondary: isDark ? "#8892B0" : "#546E7A",
      },
      divider: isDark ? "rgba(100, 180, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h3: { fontWeight: 800, letterSpacing: "-0.02em" },
      h4: { fontWeight: 700, letterSpacing: "-0.01em" },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      body1: { lineHeight: 1.7 },
      body2: { lineHeight: 1.6 },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "*": {
            scrollbarWidth: "thin",
            scrollbarColor: isDark ? "#1A2744 #0C1428" : "#C0C8D4 #F0F4FF",
          },
          "*::-webkit-scrollbar": {
            width: "6px",
          },
          "*::-webkit-scrollbar-track": {
            background: isDark ? "#0C1428" : "#F0F4FF",
          },
          "*::-webkit-scrollbar-thumb": {
            background: isDark ? "#1A2744" : "#C0C8D4",
            borderRadius: "3px",
          },
          body: {
            transition: "background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s ease",
          },
          "@keyframes pulse-glow": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.5 },
          },
          "@keyframes float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-8px)" },
          },
          "@keyframes shimmer": {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" },
          },
          "@keyframes rotate3d": {
            "0%": { transform: "rotateY(0deg)" },
            "100%": { transform: "rotateY(360deg)" },
          },
          "@keyframes breathe": {
            "0%, 100%": { transform: "scale(1)", opacity: 0.8 },
            "50%": { transform: "scale(1.05)", opacity: 1 },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: isDark
              ? "linear-gradient(135deg, rgba(12, 20, 40, 0.9) 0%, rgba(15, 25, 50, 0.7) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.9) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
              : "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
            border: "1px solid",
            borderColor: isDark ? "rgba(100, 180, 255, 0.1)" : "rgba(0, 100, 200, 0.08)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: isDark
                ? "0 12px 48px rgba(0, 191, 166, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
                : "0 12px 48px rgba(0, 119, 182, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
              borderColor: isDark ? "rgba(0, 191, 166, 0.2)" : "rgba(0, 119, 182, 0.15)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 12,
            padding: "10px 24px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          contained: {
            boxShadow: isDark
              ? "0 4px 16px rgba(0, 191, 166, 0.2)"
              : "0 4px 16px rgba(0, 119, 182, 0.25)",
            "&:hover": {
              boxShadow: isDark
                ? "0 6px 24px rgba(0, 191, 166, 0.35)"
                : "0 6px 24px rgba(0, 119, 182, 0.35)",
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark
              ? "linear-gradient(180deg, #0C1428 0%, #060D1F 100%)"
              : "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)",
            borderRight: "1px solid",
            borderColor: isDark ? "rgba(100, 180, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark
              ? "rgba(12, 20, 40, 0.85)"
              : "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px) saturate(180%)",
            color: isDark ? "#E8F0FE" : "#0D1B2A",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? "rgba(100, 180, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            height: 8,
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.06)",
          },
        },
      },
    },
  });
};

// Create RTL theme variant
export const createRTLTheme = (mode: "light" | "dark"): Theme => {
  const theme = createMedicalTheme(mode);
  return createTheme({
    ...theme,
    direction: "rtl",
  });
};

// Default export for backwards compatibility
export const medicalTheme = createMedicalTheme("light");
