#pragma once

#include <Arduino.h>

// ============================================
// WiFi Configuration - CHANGE THESE VALUES
// ============================================
#define WIFI_SSID "note 11"
#define WIFI_PASSWORD "10101010"

// HTTP server port
#define HTTP_SERVER_PORT 80

/**
 * Initialize WiFi connection and start HTTP server.
 * Must be called from setup() AFTER initRtosSyncPrimitives().
 */
void initWiFiServer();

/**
 * FreeRTOS task that runs the WiFi HTTP server.
 * Serves JSON data at /data, handles /ping and /buzzer endpoints.
 */
void TaskWiFiServer(void* pvParameters);
