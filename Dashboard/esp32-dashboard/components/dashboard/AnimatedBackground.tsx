"use client";

import { useEffect, useRef } from "react";
import { Box, useTheme } from "@mui/material";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const PARTICLE_COUNT = isDark ? 80 : 50;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      hue: isDark ? 180 + Math.random() * 60 : 200 + Math.random() * 40,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const time = Date.now() * 0.001;

      // Update and draw particles
      particles.forEach((p, i) => {
        // Float motion
        p.x += p.vx + Math.sin(time + i * 0.5) * 0.15;
        p.y += p.vy + Math.cos(time + i * 0.3) * 0.15;
        p.z += Math.sin(time * 0.5 + i) * 2;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        if (p.z < 0) p.z = 1000;
        if (p.z > 1000) p.z = 0;

        // 3D perspective projection
        const perspective = 800;
        const scale = perspective / (perspective + p.z);
        const screenX = canvas.width / 2 + (p.x - canvas.width / 2) * scale;
        const screenY = canvas.height / 2 + (p.y - canvas.height / 2) * scale;
        const size = p.size * scale;

        // Mouse interaction
        const dx = screenX - mouse.x;
        const dy = screenY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;

        let glowMultiplier = 1;
        if (dist < maxDist) {
          glowMultiplier = 1 + (1 - dist / maxDist) * 2;
        }

        // Draw particle with glow
        const alpha = p.opacity * scale * glowMultiplier;
        const glowSize = size * 3 * glowMultiplier;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, glowSize
        );

        if (isDark) {
          gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${alpha * 0.6})`);
          gradient.addColorStop(0.4, `hsla(${p.hue}, 80%, 50%, ${alpha * 0.2})`);
          gradient.addColorStop(1, `hsla(${p.hue}, 60%, 30%, 0)`);
        } else {
          gradient.addColorStop(0, `hsla(${p.hue}, 60%, 50%, ${alpha * 0.4})`);
          gradient.addColorStop(0.4, `hsla(${p.hue}, 40%, 60%, ${alpha * 0.1})`);
          gradient.addColorStop(1, `hsla(${p.hue}, 30%, 70%, 0)`);
        }

        ctx.beginPath();
        ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `hsla(${p.hue}, 100%, 80%, ${alpha})`
          : `hsla(${p.hue}, 70%, 50%, ${alpha * 0.6})`;
        ctx.fill();
      });

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark
              ? `rgba(0, 191, 166, ${opacity})`
              : `rgba(0, 119, 182, ${opacity * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDark]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          opacity: isDark ? 0.6 : 0.3,
        }}
      />
    </Box>
  );
}
