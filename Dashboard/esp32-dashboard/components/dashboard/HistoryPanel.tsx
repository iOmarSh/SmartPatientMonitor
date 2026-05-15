"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import type { TemperatureDataPoint } from "@/hooks/use-patient-data";
import { useApp } from "@/contexts/app-context";

interface HistoryPanelProps {
  temperatureHistory: TemperatureDataPoint[];
}

export function HistoryPanel({ temperatureHistory }: HistoryPanelProps) {
  const { t } = useApp();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Reverse to show most recent first
  const sortedHistory = [...temperatureHistory].reverse();

  const getStatusChip = (temp: number) => {
    if (temp >= 38) {
      return (
        <Chip
          label={t("high")}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.65rem",
            bgcolor: "rgba(255, 61, 113, 0.1)",
            color: "#FF3D71",
            border: "1px solid rgba(255, 61, 113, 0.25)",
          }}
        />
      );
    }
    if (temp >= 37.5) {
      return (
        <Chip
          label={t("elevated")}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.65rem",
            bgcolor: "rgba(255, 170, 0, 0.1)",
            color: "#FFAA00",
            border: "1px solid rgba(255, 170, 0, 0.25)",
          }}
        />
      );
    }
    if (temp < 36) {
      return (
        <Chip
          label={t("low")}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.65rem",
            bgcolor: "rgba(0, 176, 255, 0.1)",
            color: "#00B0FF",
            border: "1px solid rgba(0, 176, 255, 0.25)",
          }}
        />
      );
    }
    return (
      <Chip
        label={t("normal")}
        size="small"
        sx={{
          fontWeight: 700,
          fontSize: "0.65rem",
          bgcolor: "rgba(0, 230, 118, 0.1)",
          color: "#00E676",
          border: "1px solid rgba(0, 230, 118, 0.25)",
        }}
      />
    );
  };

  // Calculate statistics
  const temps = temperatureHistory.map((t) => t.temp);
  const avgTemp =
    temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;
  const minTemp = temps.length > 0 ? Math.min(...temps) : 0;
  const maxTemp = temps.length > 0 ? Math.max(...temps) : 0;

  const statCards = [
    {
      label: t("averageTemperature"),
      value: `${avgTemp.toFixed(1)}°C`,
      icon: <ThermostatIcon />,
      color: isDark ? "#00BFA6" : "#0077B6",
      gradient: isDark
        ? "linear-gradient(135deg, rgba(0, 191, 166, 0.08) 0%, rgba(124, 77, 255, 0.05) 100%)"
        : "linear-gradient(135deg, rgba(0, 119, 182, 0.06) 0%, rgba(108, 99, 255, 0.04) 100%)",
      borderColor: isDark ? "rgba(0, 191, 166, 0.15)" : "rgba(0, 119, 182, 0.12)",
    },
    {
      label: t("minimum"),
      value: `${minTemp.toFixed(1)}°C`,
      icon: <TrendingDownIcon />,
      color: "#00B0FF",
      gradient: "linear-gradient(135deg, rgba(0, 176, 255, 0.08) 0%, rgba(64, 196, 255, 0.05) 100%)",
      borderColor: "rgba(0, 176, 255, 0.15)",
    },
    {
      label: t("maximum"),
      value: `${maxTemp.toFixed(1)}°C`,
      icon: <TrendingUpIcon />,
      color: "#FFAA00",
      gradient: "linear-gradient(135deg, rgba(255, 170, 0, 0.08) 0%, rgba(255, 209, 102, 0.05) 100%)",
      borderColor: "rgba(255, 170, 0, 0.15)",
    },
  ];

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
      {/* Statistics Summary */}
      <Box
        sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2.5 }}
      >
        {statCards.map((stat, i) => (
          <Card
            key={i}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0 12px 32px rgba(0, 0, 0, 0.15)`,
              },
            }}
          >
            <CardContent
              sx={{
                textAlign: "center",
                py: 3,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -15,
                  right: -15,
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  bgcolor: stat.color,
                  opacity: 0.06,
                  filter: "blur(12px)",
                }}
              />
              <Box
                sx={{
                  display: "inline-flex",
                  p: 1,
                  borderRadius: 2,
                  background: stat.gradient,
                  border: "1px solid",
                  borderColor: stat.borderColor,
                  mb: 1.5,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {stat.label}
              </Typography>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ color: stat.color, letterSpacing: "-0.02em" }}
              >
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Data Table */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {t("readingHistory")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, opacity: 0.7 }}>
            {t("recentReadings")}
          </Typography>

          <TableContainer
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "text.secondary" }}>
                    {t("time")}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "text.secondary" }}>
                    {t("temperature")}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "text.secondary" }}>
                    {t("status")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedHistory.slice(0, 20).map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: isDark ? "rgba(0, 191, 166, 0.03)" : "rgba(0, 119, 182, 0.03)",
                      },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        sx={{
                          color: isDark ? "rgba(0, 191, 166, 0.7)" : "rgba(0, 119, 182, 0.7)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {row.time}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        fontWeight={600}
                        color={row.temp >= 38 ? "#FF3D71" : "text.primary"}
                        variant="body2"
                      >
                        {row.temp.toFixed(1)}°C
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{getStatusChip(row.temp)}</TableCell>
                  </TableRow>
                ))}
                {sortedHistory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography color="text.secondary" py={6}>
                        {t("noData")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
