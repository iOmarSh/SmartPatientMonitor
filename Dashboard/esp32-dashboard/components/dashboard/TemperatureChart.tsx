"use client";

import { Card, CardContent, Typography, Box, useTheme } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { TemperatureDataPoint } from "@/hooks/use-patient-data";
import { useApp } from "@/contexts/app-context";

interface TemperatureChartProps {
  data: TemperatureDataPoint[];
  alertThreshold?: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "rgba(12, 20, 40, 0.95)",
          p: 2,
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          border: "1px solid rgba(0, 191, 166, 0.2)",
          backdropFilter: "blur(20px)",
          minWidth: 120,
        }}
      >
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }} display="block">
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ color: "#00BFA6" }}>
          {payload[0].value.toFixed(1)}°C
        </Typography>
      </Box>
    );
  }
  return null;
};

export function TemperatureChart({ data, alertThreshold = 38 }: TemperatureChartProps) {
  const theme = useTheme();
  const { t } = useApp();
  const isDark = theme.palette.mode === "dark";

  // Calculate domain for better visualization
  const temps = data.map((d) => d.temp);
  const minTemp = temps.length > 0 ? Math.floor(Math.min(...temps) - 1) : 35;
  const maxTemp = temps.length > 0 ? Math.ceil(Math.max(...temps) + 1) : 40;

  const gradientId = "tempGradient";
  const lineColor = isDark ? "#00BFA6" : "#0077B6";
  const fillColor = isDark ? "#00BFA6" : "#0077B6";

  return (
    <Card sx={{ height: "100%", overflow: "visible" }}>
      <CardContent sx={{ p: 3, height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {t("temperatureTrend")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
              {t("last30Seconds")}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.8,
              borderRadius: 3,
              bgcolor: isDark ? "rgba(255, 61, 113, 0.08)" : "rgba(255, 61, 113, 0.06)",
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 61, 113, 0.2)" : "rgba(255, 61, 113, 0.15)",
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#FF3D71",
                boxShadow: "0 0 8px rgba(255, 61, 113, 0.6)",
                animation: "pulse-glow 1.5s infinite",
              }}
            />
            <Typography variant="caption" sx={{ color: "#FF3D71" }} fontWeight={600}>
              {t("alertThreshold")}: {alertThreshold}°C
            </Typography>
          </Box>
        </Box>

        <Box sx={{ height: 300, width: "100%" }}>
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fillColor} stopOpacity={0.25} />
                  <stop offset="50%" stopColor={fillColor} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(100, 180, 255, 0.06)" : "rgba(0, 0, 0, 0.04)"}
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                tickLine={false}
                axisLine={{ stroke: isDark ? "rgba(100, 180, 255, 0.08)" : "rgba(0, 0, 0, 0.06)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minTemp, maxTemp]}
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={alertThreshold}
                stroke="#FF3D71"
                strokeDasharray="8 4"
                strokeWidth={2}
                strokeOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke={lineColor}
                strokeWidth={3}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 7,
                  fill: lineColor,
                  stroke: isDark ? "#0C1428" : "#FFFFFF",
                  strokeWidth: 3,
                  style: {
                    filter: `drop-shadow(0 0 8px ${isDark ? "rgba(0, 191, 166, 0.5)" : "rgba(0, 119, 182, 0.5)"})`,
                  },
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
