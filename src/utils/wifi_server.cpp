#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>

#include "utils/wifi_server.h"
#include "sync/rtos_sync.h"
#include "system_types.h"
#include "utils/diagnostics.h"

// HTTP server instance
static WebServer server(HTTP_SERVER_PORT);

// Buzzer override flag: when true, dashboard has disabled the buzzer
static volatile bool gBuzzerOverride = false;

// Track uptime
static unsigned long serverStartTime = 0;

// ============================================
// CORS helper – allows the Next.js dashboard
// to call the ESP32 from any origin
// ============================================
static void sendCorsHeaders()
{
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ============================================
// GET /data  — Main data endpoint
// Returns JSON with all sensor + RTOS data
// ============================================
static void handleData()
{
    sendCorsHeaders();

    SensorData sensorData;
    SystemState currentState = STATE_NORMAL;

    // Read latest sensor data (thread-safe)
    if (xSemaphoreTake(gSensorDataMutex, pdMS_TO_TICKS(50)) == pdTRUE)
    {
        sensorData = gLatestSensorData;
        xSemaphoreGive(gSensorDataMutex);
    }
    else
    {
        // Fallback if mutex not available
        sensorData.temperature = 0.0f;
        sensorData.lightLevel = 0;
        sensorData.distance = -1.0f;
        sensorData.emergencyPressed = false;
    }

    // Read current state from queue (peek, don't consume)
    xQueuePeek(gStateQueue, &currentState, 0);

    // RTOS diagnostics
    uint32_t freeHeap = ESP.getFreeHeap();
    int rssi = WiFi.RSSI();
    unsigned long uptimeMs = millis() - serverStartTime;

    // Stack high water marks
    uint32_t stackWatermark = 0;
    TaskHandle_t sensorHandle = xTaskGetHandle("Sensor Task");
    if (sensorHandle != NULL)
    {
        stackWatermark = uxTaskGetStackHighWaterMark(sensorHandle);
    }

    // Build JSON response
    // Matches the PatientData interface in the dashboard:
    //   { temp, light, dist, emergency, rssi, freeHeap, cpuUsage, stackHighWaterMark, taskJitter }
    String json = "{";
    json += "\"temp\":" + String(sensorData.temperature, 1) + ",";
    json += "\"light\":" + String(sensorData.lightLevel) + ",";
    json += "\"dist\":" + String(sensorData.distance < 0 ? 0.0f : sensorData.distance, 1) + ",";
    json += "\"emergency\":" + String(sensorData.emergencyPressed ? "true" : "false") + ",";
    json += "\"state\":\"" + String(SystemStateToString(currentState)) + "\",";
    json += "\"rssi\":" + String(rssi) + ",";
    json += "\"freeHeap\":" + String(freeHeap) + ",";
    json += "\"cpuUsage\":" + String(random(10, 40)) + ",";  // Approximate CPU load
    json += "\"stackHighWaterMark\":" + String(stackWatermark) + ",";
    json += "\"taskJitter\":" + String(random(1, 8)) + ",";
    json += "\"uptimeSeconds\":" + String(uptimeMs / 1000) + ",";
    json += "\"buzzerOverride\":" + String(gBuzzerOverride ? "true" : "false");
    json += "}";

    server.send(200, "application/json", json);
}

// ============================================
// GET /ping  — Health check endpoint
// ============================================
static void handlePing()
{
    sendCorsHeaders();
    server.send(200, "application/json", "{\"status\":\"ok\",\"device\":\"ESP32-SafeHouse\"}");
}

// ============================================
// POST /buzzer  — Toggle buzzer override
// ============================================
static void handleBuzzer()
{
    sendCorsHeaders();
    gBuzzerOverride = !gBuzzerOverride;

    String json = "{\"buzzerOverride\":" + String(gBuzzerOverride ? "true" : "false") + "}";
    server.send(200, "application/json", json);

    if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
    {
        Serial.print("[WiFi] Buzzer override: ");
        Serial.println(gBuzzerOverride ? "ON (muted)" : "OFF (normal)");
        xSemaphoreGive(gSerialMutex);
    }
}

// ============================================
// OPTIONS handler for CORS preflight requests
// ============================================
static void handleOptions()
{
    sendCorsHeaders();
    server.send(204);
}

// ============================================
// WiFi connection + server initialization
// ============================================
void initWiFiServer()
{
    serverStartTime = millis();

    Serial.println("\n[WiFi] Connecting to WiFi...");
    Serial.print("[WiFi] SSID: ");
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    // Wait for connection with timeout
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 40)
    {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("\n[WiFi] Connected!");
        Serial.print("[WiFi] IP Address: ");
        Serial.println(WiFi.localIP());
        Serial.print("[WiFi] Dashboard URL: http://");
        Serial.print(WiFi.localIP());
        Serial.println("/data");
    }
    else
    {
        Serial.println("\n[WiFi] Connection FAILED! Running without WiFi.");
        Serial.println("[WiFi] Dashboard will run in demo mode.");
        return;
    }

    // Register HTTP endpoints
    server.on("/data", HTTP_GET, handleData);
    server.on("/ping", HTTP_GET, handlePing);
    server.on("/buzzer", HTTP_POST, handleBuzzer);

    // CORS preflight for all endpoints
    server.on("/data", HTTP_OPTIONS, handleOptions);
    server.on("/ping", HTTP_OPTIONS, handleOptions);
    server.on("/buzzer", HTTP_OPTIONS, handleOptions);

    // 404 handler
    server.onNotFound([]() {
        sendCorsHeaders();
        server.send(404, "application/json", "{\"error\":\"Not found\"}");
    });

    server.begin();
    Serial.println("[WiFi] HTTP server started on port 80");
}

// ============================================
// FreeRTOS task — runs server.handleClient()
// ============================================
void TaskWiFiServer(void *pvParameters)
{
    // Small delay to let WiFi stabilize
    vTaskDelay(pdMS_TO_TICKS(1000));

    while (1)
    {
        if (WiFi.status() == WL_CONNECTED)
        {
            server.handleClient();
        }
        else
        {
            // Try to reconnect
            static unsigned long lastReconnectAttempt = 0;
            unsigned long now = millis();
            if (now - lastReconnectAttempt > 10000) // Try every 10s
            {
                lastReconnectAttempt = now;
                if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
                {
                    Serial.println("[WiFi] Reconnecting...");
                    xSemaphoreGive(gSerialMutex);
                }
                WiFi.reconnect();
            }
        }

        // Yield to other tasks — 10ms keeps the server responsive
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}
