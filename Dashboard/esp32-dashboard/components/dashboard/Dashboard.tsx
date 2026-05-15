"use client";

import { useState } from "react";
import { CssBaseline, Box, Toolbar, Card, CardContent, Typography } from "@mui/material";
import { usePatientData } from "@/hooks/use-patient-data";
import { AnimatedBackground } from "./AnimatedBackground";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { StatCard } from "./StatCard";
import { TemperatureChart } from "./TemperatureChart";
import { EmergencyAlert } from "./EmergencyAlert";
import { SettingsPanel } from "./SettingsPanel";
import { HistoryPanel } from "./HistoryPanel";
import { SystemStateBadge } from "./SystemStateBadge";
import { CommandCenter } from "./CommandCenter";
import { DiagnosticsPanel } from "./DiagnosticsPanel";
import { EventLogPanel } from "./EventLogPanel";
import { CircularGauge } from "./CircularGauge";
import { AppProvider, useApp } from "@/contexts/app-context";

const DRAWER_WIDTH = 280;

function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("overview");
  const [esp32Url, setEsp32Url] = useState("");
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [warningThreshold, setWarningThreshold] = useState(37.5);
  const [dangerThreshold, setDangerThreshold] = useState(38);
  const { t, direction } = useApp();

  const {
    data,
    isOnline,
    lastUpdated,
    temperatureHistory,
    historicalStats,
    systemState,
    eventLog,
    uptime,
    clearAlarms,
    toggleBuzzer,
    pingDevice,
    buzzerEnabled,
    isDemoMode,
    error,
  } = usePatientData(esp32Url || undefined, warningThreshold, dangerThreshold);

  const isHighTemp = data?.temp !== undefined && data.temp >= dangerThreshold;
  const showAlert = (data?.emergency || isHighTemp || systemState === "DANGER" || systemState === "EMERGENCY") && !alertDismissed;

  const handleDismiss = () => {
    setAlertDismissed(true);
    setTimeout(() => setAlertDismissed(false), 30000);
  };

  return (
    <>
      <CssBaseline />
      <AnimatedBackground />
      <Box
        dir={direction}
        sx={{ display: "flex", minHeight: "100vh", bgcolor: "transparent", position: "relative", zIndex: 1 }}
      >
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          isOnline={isOnline}
          lastUpdated={lastUpdated}
          systemState={systemState}
        />

        <EmergencyAlert
          isEmergency={data?.emergency ?? false}
          temperature={data?.temp}
          systemState={systemState}
          onDismiss={handleDismiss}
          isMuted={isMuted}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ...(direction === "rtl"
              ? { mr: { md: `${DRAWER_WIDTH}px` } }
              : { ml: { md: `${DRAWER_WIDTH}px` } }),
            mt: showAlert ? "120px" : 0,
            transition: "margin-top 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Toolbar />

          {currentPage === "overview" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                overflow: "hidden",
                animation: "fadeIn 0.5s ease-out",
                "@keyframes fadeIn": {
                  from: { opacity: 0, transform: "translateY(10px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              {/* System State Badge and Gauges */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                <Box sx={{ flex: { xs: "1 1 auto", md: "1 1 50%" }, minWidth: 0 }}>
                  <SystemStateBadge state={systemState} size="large" />
                </Box>
                <Box sx={{ flex: { xs: "1 1 auto", md: "1 1 50%" }, minWidth: 0 }}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {t("temperatureTrend")}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          justifyContent: "space-around",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <CircularGauge
                          value={data?.temp ?? 0}
                          min={35}
                          max={42}
                          unit="°C"
                          label={t("bodyTemperature")}
                          warningThreshold={warningThreshold}
                          dangerThreshold={dangerThreshold}
                          size={150}
                        />
                        <CircularGauge
                          value={data?.dist ?? 0}
                          min={0}
                          max={200}
                          unit="cm"
                          label={t("distance")}
                          warningThreshold={30}
                          size={150}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* Stat Cards */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  flexWrap: "wrap",
                  gap: 3,
                }}
              >
                <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", lg: "1 1 calc(33.333% - 16px)" }, minWidth: 0 }}>
                  <StatCard
                    title={t("bodyTemperature")}
                    value={data?.temp ?? null}
                    unit="°C"
                    type="temperature"
                    min={historicalStats?.tempMin}
                    max={historicalStats?.tempMax}
                    isWarning={isHighTemp}
                  />
                </Box>
                <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", lg: "1 1 calc(33.333% - 16px)" }, minWidth: 0 }}>
                  <StatCard
                    title={t("lightLevel")}
                    value={data?.light ?? null}
                    unit="%"
                    type="light"
                    min={historicalStats?.lightMin}
                    max={historicalStats?.lightMax}
                  />
                </Box>
                <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", lg: "1 1 calc(33.333% - 16px)" }, minWidth: 0 }}>
                  <StatCard
                    title={t("distance")}
                    value={data?.dist ?? null}
                    unit="cm"
                    type="distance"
                    min={historicalStats?.distMin}
                    max={historicalStats?.distMax}
                  />
                </Box>
              </Box>

              {/* Temperature Chart */}
              <TemperatureChart data={temperatureHistory} alertThreshold={dangerThreshold} />

              {/* Event Log Preview */}
              <EventLogPanel events={eventLog} />
            </Box>
          )}

          {currentPage === "history" && (
            <HistoryPanel temperatureHistory={temperatureHistory} />
          )}

          {currentPage === "diagnostics" && (
            <DiagnosticsPanel data={data} uptime={uptime} isOnline={isOnline} />
          )}

          {currentPage === "command" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <CommandCenter
                buzzerEnabled={buzzerEnabled}
                onClearAlarms={clearAlarms}
                onToggleBuzzer={toggleBuzzer}
                onPingDevice={pingDevice}
                onToggleMute={() => setIsMuted(!isMuted)}
                isMuted={isMuted}
              />
              <EventLogPanel events={eventLog} />
            </Box>
          )}

          {currentPage === "settings" && (
            <SettingsPanel
              esp32Url={esp32Url}
              onUrlChange={setEsp32Url}
              warningThreshold={warningThreshold}
              dangerThreshold={dangerThreshold}
              onWarningChange={setWarningThreshold}
              onDangerChange={setDangerThreshold}
              isOnline={isOnline}
              isDemoMode={isDemoMode}
              error={error}
            />
          )}
        </Box>
      </Box>
    </>
  );
}

export function Dashboard() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
