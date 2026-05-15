"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useInterval } from "./use-interval";

export type SystemState = "NORMAL" | "WARNING" | "DANGER" | "EMERGENCY";

export interface PatientData {
  temp: number;
  light: number;
  dist: number;
  emergency: boolean;
  // RTOS diagnostics (optional - from ESP32)
  rssi?: number;
  freeHeap?: number;
  cpuUsage?: number;
  stackHighWaterMark?: number;
  taskJitter?: number;
}

export interface HistoricalStats {
  tempMin: number;
  tempMax: number;
  lightMin: number;
  lightMax: number;
  distMin: number;
  distMax: number;
}

export interface TemperatureDataPoint {
  time: string;
  temp: number;
  timestamp: number;
}

export interface EventLogEntry {
  id: string;
  timestamp: Date;
  event: string;
  details: string;
  state: SystemState;
}

interface UsePatientDataReturn {
  data: PatientData | null;
  isOnline: boolean;
  lastUpdated: Date | null;
  temperatureHistory: TemperatureDataPoint[];
  historicalStats: HistoricalStats | null;
  error: string | null;
  systemState: SystemState;
  eventLog: EventLogEntry[];
  uptime: number;
  clearAlarms: () => void;
  toggleBuzzer: () => Promise<void>;
  pingDevice: () => Promise<boolean>;
  buzzerEnabled: boolean;
  isDemoMode: boolean;
}

const POLL_INTERVAL = 1000; // 1 second
const HISTORY_DURATION = 30000; // 30 seconds
const FETCH_TIMEOUT = 3000; // 3 second timeout for ESP32 requests
const MAX_CONSECUTIVE_FAILURES = 5;

// Demo mode: simulate ESP32 data when no real device is connected
const generateDemoData = (): PatientData => {
  const baseTemp = 36.5;
  const tempVariation = Math.sin(Date.now() / 5000) * 0.5 + (Math.random() - 0.5) * 0.3;
  
  // Occasionally simulate warning/danger states in demo
  const shouldSimulateWarning = Math.random() < 0.02;
  const shouldSimulateDanger = Math.random() < 0.005;
  
  let temp = baseTemp + tempVariation;
  if (shouldSimulateDanger) {
    temp = 38.5 + Math.random() * 0.5;
  } else if (shouldSimulateWarning) {
    temp = 37.5 + Math.random() * 0.3;
  }
  
  return {
    temp: Math.round(temp * 10) / 10,
    light: Math.round(50 + Math.sin(Date.now() / 3000) * 30 + Math.random() * 10),
    dist: Math.round(100 + Math.sin(Date.now() / 4000) * 50 + Math.random() * 20),
    emergency: false,
    // Demo RTOS data
    rssi: Math.round(-50 - Math.random() * 30),
    freeHeap: Math.round(180000 + Math.random() * 20000),
    cpuUsage: Math.round(15 + Math.random() * 25),
    stackHighWaterMark: Math.round(2048 + Math.random() * 512),
    taskJitter: Math.round(Math.random() * 5),
  };
};

const calculateSystemState = (
  data: PatientData,
  warningThreshold: number = 37.5,
  dangerThreshold: number = 38,
  distanceWarning: number = 30
): SystemState => {
  if (data.emergency) return "EMERGENCY";
  if (data.temp >= dangerThreshold) return "DANGER";
  if (data.temp >= warningThreshold || data.dist < distanceWarning) return "WARNING";
  return "NORMAL";
};

/**
 * Normalize the ESP32 URL to ensure it points to the /data endpoint.
 * Users may enter just the IP, or IP with port, or full URL.
 * Examples:
 *   "192.168.1.100"         → "http://192.168.1.100/data"
 *   "http://192.168.1.100"  → "http://192.168.1.100/data"
 *   "http://192.168.1.100/" → "http://192.168.1.100/data"
 *   "http://192.168.1.100/data" → "http://192.168.1.100/data" (unchanged)
 */
function normalizeEsp32Url(url: string): string {
  let normalized = url.trim();
  if (!normalized) return "";
  
  // Add http:// if no protocol
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `http://${normalized}`;
  }
  
  // Remove trailing slash
  normalized = normalized.replace(/\/+$/, "");
  
  // Add /data if no path or just root
  try {
    const parsed = new URL(normalized);
    if (parsed.pathname === "/" || parsed.pathname === "") {
      normalized = `${normalized}/data`;
    }
  } catch {
    // If URL parsing fails, just append /data
    if (!normalized.includes("/data")) {
      normalized = `${normalized}/data`;
    }
  }
  
  return normalized;
}

/**
 * Extract the base URL from the data endpoint URL.
 * "http://192.168.1.100/data" → "http://192.168.1.100"
 */
function getBaseUrl(dataUrl: string): string {
  try {
    const parsed = new URL(dataUrl);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return dataUrl.replace(/\/data$/, "");
  }
}

export function usePatientData(
  esp32Url?: string,
  warningThreshold: number = 37.5,
  dangerThreshold: number = 38
): UsePatientDataReturn {
  const [data, setData] = useState<PatientData | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [temperatureHistory, setTemperatureHistory] = useState<TemperatureDataPoint[]>([]);
  const [historicalStats, setHistoricalStats] = useState<HistoricalStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [systemState, setSystemState] = useState<SystemState>("NORMAL");
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [uptime, setUptime] = useState(0);
  const [buzzerEnabled, setBuzzerEnabled] = useState(true);
  
  const isFirstFetch = useRef(true);
  const startTime = useRef(Date.now());
  const prevSystemState = useRef<SystemState>("NORMAL");
  const consecutiveFailures = useRef(0);

  // Normalize the URL once
  const normalizedUrl = esp32Url ? normalizeEsp32Url(esp32Url) : "";
  const isDemoMode = !normalizedUrl;
  const baseUrl = normalizedUrl ? getBaseUrl(normalizedUrl) : "";

  const addEventLog = useCallback((event: string, details: string, state: SystemState) => {
    const entry: EventLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      event,
      details,
      state,
    };
    setEventLog((prev) => [entry, ...prev].slice(0, 50)); // Keep last 50 events
  }, []);

  const updateHistoricalStats = useCallback((newData: PatientData, prevStats: HistoricalStats | null) => {
    if (!prevStats) {
      return {
        tempMin: newData.temp,
        tempMax: newData.temp,
        lightMin: newData.light,
        lightMax: newData.light,
        distMin: newData.dist,
        distMax: newData.dist,
      };
    }
    return {
      tempMin: Math.min(prevStats.tempMin, newData.temp),
      tempMax: Math.max(prevStats.tempMax, newData.temp),
      lightMin: Math.min(prevStats.lightMin, newData.light),
      lightMax: Math.max(prevStats.lightMax, newData.light),
      distMin: Math.min(prevStats.distMin, newData.dist),
      distMax: Math.max(prevStats.distMax, newData.dist),
    };
  }, []);

  const clearAlarms = useCallback(() => {
    addEventLog("Alarms Cleared", "User manually cleared all alarms", systemState);
  }, [addEventLog, systemState]);

  const toggleBuzzer = useCallback(async () => {
    if (baseUrl) {
      try {
        const response = await fetch(`${baseUrl}/buzzer`, {
          method: "POST",
          signal: AbortSignal.timeout(FETCH_TIMEOUT),
        });
        if (response.ok) {
          const result = await response.json();
          addEventLog(
            result.buzzerOverride ? "Buzzer Muted" : "Buzzer Enabled",
            `ESP32 buzzer override: ${result.buzzerOverride ? "ON" : "OFF"}`,
            systemState
          );
        }
      } catch {
        addEventLog("Buzzer Toggle", "Failed to reach ESP32 — toggled locally", "WARNING");
      }
    }
    setBuzzerEnabled((prev) => !prev);
    if (!baseUrl) {
      addEventLog(
        buzzerEnabled ? "Buzzer Disabled" : "Buzzer Enabled",
        `User ${buzzerEnabled ? "disabled" : "enabled"} the buzzer (demo mode)`,
        systemState
      );
    }
  }, [baseUrl, buzzerEnabled, addEventLog, systemState]);

  const pingDevice = useCallback(async (): Promise<boolean> => {
    if (!baseUrl) {
      addEventLog("Device Ping", "Demo mode — device simulated", "NORMAL");
      return true;
    }
    try {
      const response = await fetch(`${baseUrl}/ping`, { 
        method: "GET",
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) {
        const result = await response.json();
        addEventLog(
          "Device Ping",
          `ESP32 responded: ${result.device || "OK"}`,
          systemState
        );
        return true;
      }
      addEventLog("Device Ping", `HTTP ${response.status}`, "WARNING");
      return false;
    } catch (err) {
      addEventLog(
        "Device Ping",
        `Connection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        "WARNING"
      );
      return false;
    }
  }, [baseUrl, addEventLog, systemState]);

  const fetchData = useCallback(async () => {
    const now = Date.now();
    setUptime(Math.floor((now - startTime.current) / 1000));
    
    try {
      let newData: PatientData;
      
      if (isDemoMode) {
        // Demo mode — simulate data
        newData = generateDemoData();
        setIsOnline(true);
        setError(null);
      } else {
        // Real mode — fetch from ESP32
        const response = await fetch(normalizedUrl, {
          method: "GET",
          signal: AbortSignal.timeout(FETCH_TIMEOUT),
        });
        
        if (!response.ok) {
          throw new Error(`ESP32 returned HTTP ${response.status}`);
        }
        
        const rawData = await response.json();
        
        // Map ESP32 JSON to PatientData interface
        // The ESP32 sends: { temp, light, dist, emergency, state, rssi, freeHeap, ... }
        newData = {
          temp: typeof rawData.temp === "number" ? rawData.temp : 0,
          light: typeof rawData.light === "number" ? rawData.light : 0,
          dist: typeof rawData.dist === "number" ? rawData.dist : 0,
          emergency: rawData.emergency === true,
          rssi: rawData.rssi,
          freeHeap: rawData.freeHeap,
          cpuUsage: rawData.cpuUsage,
          stackHighWaterMark: rawData.stackHighWaterMark,
          taskJitter: rawData.taskJitter,
        };
        
        setIsOnline(true);
        setError(null);
        consecutiveFailures.current = 0;

        // Log first successful connection
        if (isFirstFetch.current) {
          addEventLog("Connected", `ESP32 device at ${baseUrl}`, "NORMAL");
        }
      }
      
      setData(newData);
      setLastUpdated(new Date());
      
      // Calculate and update system state
      const newState = calculateSystemState(newData, warningThreshold, dangerThreshold);
      
      // Log state changes
      if (newState !== prevSystemState.current) {
        const stateMessages: Record<SystemState, string> = {
          NORMAL: "System returned to normal state",
          WARNING: `Warning: Temperature ${newData.temp}°C`,
          DANGER: `Danger: Temperature ${newData.temp}°C`,
          EMERGENCY: "Emergency button activated!",
        };
        addEventLog(`State: ${newState}`, stateMessages[newState], newState);
        prevSystemState.current = newState;
      }
      
      setSystemState(newState);
      
      // Update temperature history
      const newPoint: TemperatureDataPoint = {
        time: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        temp: newData.temp,
        timestamp: now,
      };
      
      setTemperatureHistory((prev) => {
        const cutoff = now - HISTORY_DURATION;
        const filtered = prev.filter((p) => p.timestamp > cutoff);
        return [...filtered, newPoint];
      });
      
      // Update historical stats
      setHistoricalStats((prev) => updateHistoricalStats(newData, prev));
      
      isFirstFetch.current = false;
    } catch (err) {
      consecutiveFailures.current++;
      
      if (!isFirstFetch.current) {
        setIsOnline(false);
        
        const errorMessage = err instanceof Error ? err.message : "Connection failed";
        
        // Only update error state if this isn't a transient glitch
        if (consecutiveFailures.current >= 2) {
          setError(errorMessage);
        }
        
        // Log connection loss after a few failures (avoid spam)
        if (consecutiveFailures.current === MAX_CONSECUTIVE_FAILURES) {
          addEventLog(
            "Connection Lost",
            `ESP32 unreachable after ${MAX_CONSECUTIVE_FAILURES} attempts: ${errorMessage}`,
            "WARNING"
          );
        }
      } else {
        // First fetch failed — log it but don't block demo mode fallback
        const errorMessage = err instanceof Error ? err.message : "Connection failed";
        setError(errorMessage);
        setIsOnline(false);
        addEventLog("Connection Failed", `Could not reach ESP32: ${errorMessage}`, "WARNING");
        isFirstFetch.current = false;
      }
    }
  }, [normalizedUrl, isDemoMode, baseUrl, updateHistoricalStats, addEventLog, warningThreshold, dangerThreshold]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling
  useInterval(fetchData, POLL_INTERVAL);

  return {
    data,
    isOnline,
    lastUpdated,
    temperatureHistory,
    historicalStats,
    error,
    systemState,
    eventLog,
    uptime,
    clearAlarms,
    toggleBuzzer,
    pingDevice,
    buzzerEnabled,
    isDemoMode,
  };
}
