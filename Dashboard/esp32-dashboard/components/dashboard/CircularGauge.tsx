"use client";

import { Box, Typography, useTheme } from "@mui/material";
import { useEffect, useRef } from "react";

interface CircularGaugeProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  warningThreshold?: number;
  dangerThreshold?: number;
  size?: number;
}

export function CircularGauge({
  value,
  min,
  max,
  unit,
  label,
  warningThreshold,
  dangerThreshold,
  size = 160,
}: CircularGaugeProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animatedValue = useRef(0);
  const animationRef = useRef<number>(0);

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  // Determine color based on thresholds
  let color: string;
  let glowColor: string;
  if (dangerThreshold !== undefined && value >= dangerThreshold) {
    color = "#FF3D71";
    glowColor = "rgba(255, 61, 113, 0.4)";
  } else if (warningThreshold !== undefined && value >= warningThreshold) {
    color = "#FFAA00";
    glowColor = "rgba(255, 170, 0, 0.4)";
  } else {
    color = isDark ? "#00BFA6" : "#0077B6";
    glowColor = isDark ? "rgba(0, 191, 166, 0.3)" : "rgba(0, 119, 182, 0.3)";
  }

  // 3D ring animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.38;
    const lineWidth = size * 0.06;

    const targetPercentage = percentage;

    const animate = () => {
      // Smooth easing
      animatedValue.current += (targetPercentage - animatedValue.current) * 0.08;

      ctx.clearRect(0, 0, size, size);

      // Background glow
      const bgGlow = ctx.createRadialGradient(
        centerX, centerY, radius - lineWidth,
        centerX, centerY, radius + lineWidth * 2
      );
      bgGlow.addColorStop(0, "transparent");
      bgGlow.addColorStop(0.5, isDark ? "rgba(0, 191, 166, 0.02)" : "rgba(0, 119, 182, 0.02)");
      bgGlow.addColorStop(1, "transparent");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, size, size);

      const startAngle = -Math.PI * 0.75;
      const totalArc = Math.PI * 1.5;

      // Background track with 3D effect
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + totalArc, false);
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();

      // Inner shadow track (3D depth)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 1, startAngle, startAngle + totalArc, false);
      ctx.strokeStyle = isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.03)";
      ctx.lineWidth = lineWidth - 2;
      ctx.lineCap = "round";
      ctx.stroke();

      // Value arc with gradient
      const endAngle = startAngle + (animatedValue.current / 100) * totalArc;
      if (animatedValue.current > 0.5) {
        // Create gradient along the arc
        const gradient = ctx.createLinearGradient(
          centerX - radius, centerY,
          centerX + radius, centerY
        );

        if (dangerThreshold !== undefined && value >= dangerThreshold) {
          gradient.addColorStop(0, "#FF6B9D");
          gradient.addColorStop(1, "#FF3D71");
        } else if (warningThreshold !== undefined && value >= warningThreshold) {
          gradient.addColorStop(0, "#FFD166");
          gradient.addColorStop(1, "#FFAA00");
        } else {
          gradient.addColorStop(0, isDark ? "#00BFA6" : "#48CAE4");
          gradient.addColorStop(1, isDark ? "#7C4DFF" : "#0077B6");
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.stroke();

        // Glow effect on the value arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = lineWidth + 6;
        ctx.lineCap = "round";
        ctx.filter = "blur(6px)";
        ctx.stroke();
        ctx.filter = "none";

        // End cap glow dot
        const dotX = centerX + Math.cos(endAngle) * radius;
        const dotY = centerY + Math.sin(endAngle) * radius;
        const dotGradient = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, lineWidth);
        dotGradient.addColorStop(0, color);
        dotGradient.addColorStop(0.5, glowColor);
        dotGradient.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(dotX, dotY, lineWidth, 0, Math.PI * 2);
        ctx.fillStyle = dotGradient;
        ctx.fill();
      }

      // Tick marks
      for (let i = 0; i <= 10; i++) {
        const tickAngle = startAngle + (i / 10) * totalArc;
        const innerR = radius + lineWidth * 0.8;
        const outerR = radius + lineWidth * (i % 5 === 0 ? 1.4 : 1.1);
        const x1 = centerX + Math.cos(tickAngle) * innerR;
        const y1 = centerY + Math.sin(tickAngle) * innerR;
        const x2 = centerX + Math.cos(tickAngle) * outerR;
        const y2 = centerY + Math.sin(tickAngle) * outerR;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isDark
          ? `rgba(255, 255, 255, ${i % 5 === 0 ? 0.3 : 0.12})`
          : `rgba(0, 0, 0, ${i % 5 === 0 ? 0.2 : 0.08})`;
        ctx.lineWidth = i % 5 === 0 ? 2 : 1;
        ctx.stroke();
      }

      if (Math.abs(animatedValue.current - targetPercentage) > 0.1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [value, percentage, size, isDark, color, glowColor, dangerThreshold, warningThreshold, min, max]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box sx={{ position: "relative", width: size, height: size }}>
        <canvas
          ref={canvasRef}
          style={{
            width: size,
            height: size,
          }}
        />
        {/* Center value overlay */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              color,
              lineHeight: 1,
              textShadow: `0 0 20px ${glowColor}`,
              letterSpacing: "-0.02em",
            }}
          >
            {value.toFixed(1)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ opacity: 0.6, fontWeight: 500, mt: 0.3 }}
          >
            {unit}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={600}
        sx={{ letterSpacing: "0.02em" }}
      >
        {label}
      </Typography>
    </Box>
  );
}
