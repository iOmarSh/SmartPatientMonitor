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
  Button,
  useTheme,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import TimelineIcon from "@mui/icons-material/Timeline";
import { useApp } from "@/contexts/app-context";
import type { EventLogEntry, SystemState } from "@/hooks/use-patient-data";

interface EventLogPanelProps {
  events: EventLogEntry[];
}

const stateColors: Record<SystemState, { color: string; bg: string; border: string }> = {
  NORMAL: { color: "#00E676", bg: "rgba(0, 230, 118, 0.1)", border: "rgba(0, 230, 118, 0.25)" },
  WARNING: { color: "#FFAA00", bg: "rgba(255, 170, 0, 0.1)", border: "rgba(255, 170, 0, 0.25)" },
  DANGER: { color: "#FF3D71", bg: "rgba(255, 61, 113, 0.1)", border: "rgba(255, 61, 113, 0.25)" },
  EMERGENCY: { color: "#FF1744", bg: "rgba(255, 23, 68, 0.15)", border: "rgba(255, 23, 68, 0.3)" },
};

export function EventLogPanel({ events }: EventLogPanelProps) {
  const { t } = useApp();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const downloadCsv = () => {
    const headers = ["Timestamp", "Event", "Details", "State"];
    const rows = events.map((e) => [
      e.timestamp.toISOString(),
      e.event,
      e.details,
      e.state,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safe-house-events-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
              <TimelineIcon sx={{ color: "primary.main", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {t("eventLog")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("eventLogDescription")}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={downloadCsv}
            disabled={events.length === 0}
            sx={{
              borderRadius: 2.5,
              borderColor: isDark ? "rgba(0, 191, 166, 0.2)" : "rgba(0, 119, 182, 0.2)",
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: isDark ? "rgba(0, 191, 166, 0.05)" : "rgba(0, 119, 182, 0.05)",
              },
            }}
          >
            {t("downloadCsv")}
          </Button>
        </Box>

        {events.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            <TimelineIcon sx={{ fontSize: 48, opacity: 0.2, mb: 2 }} />
            <Typography>{t("noEvents")}</Typography>
          </Box>
        ) : (
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
                    {t("timestamp")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "text.secondary" }}>
                    {t("event")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "text.secondary" }}>
                    {t("details")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "text.secondary" }}>
                    {t("status")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.slice(0, 20).map((event) => {
                  const colors = stateColors[event.state];
                  return (
                    <TableRow
                      key={event.id}
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: isDark ? "rgba(0, 191, 166, 0.03)" : "rgba(0, 119, 182, 0.03)",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          sx={{
                            color: isDark ? "rgba(0, 191, 166, 0.7)" : "rgba(0, 119, 182, 0.7)",
                            fontSize: "0.8rem",
                          }}
                        >
                          {event.timestamp.toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {event.event}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
                          {event.details}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.state}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            minWidth: 80,
                            bgcolor: colors.bg,
                            color: colors.color,
                            border: "1px solid",
                            borderColor: colors.border,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
