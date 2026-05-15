#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "tasks/task_output.h"
#include "outputs/indicators.h"
#include "outputs/lcd_display.h"
#include "sync/rtos_sync.h"
#include "utils/diagnostics.h"

namespace
{
    bool warningBlinkState = false;
    bool emergencyBlinkState = false;
    const TickType_t warningBlinkInterval = pdMS_TO_TICKS(600);
    const TickType_t emergencyBlinkInterval = pdMS_TO_TICKS(250);
}

void TaskOutput(void *pvParameters)
{
    TickType_t lastWarningToggle = xTaskGetTickCount();
    TickType_t lastEmergencyToggle = xTaskGetTickCount();
    SystemState currentState = STATE_NORMAL;
    SystemState previousState = STATE_NORMAL;

    while (1)
    {
        telemetryRecordCycleStart(outputMetrics, millis());
        uint32_t exec_start = micros();

        if (xQueueReceive(gStateQueue, &currentState, pdMS_TO_TICKS(100)) == pdPASS)
        {
            if (currentState != previousState && xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
            {
                Serial.print("[Output] State received: ");
                Serial.println(SystemStateToString(currentState));
                xSemaphoreGive(gSerialMutex);
            }

            previousState = currentState;
        }

        TickType_t now = xTaskGetTickCount();

        bool greenOn = false;
        bool redOn = false;
        bool buzzerOn = false;

        switch (currentState)
        {
            case STATE_NORMAL:
                greenOn = true;
                redOn = false;
                buzzerOn = false;
                warningBlinkState = false;
                emergencyBlinkState = false;
                break;
            case STATE_WARNING:
                greenOn = true;
                if ((now - lastWarningToggle) >= warningBlinkInterval)
                {
                    warningBlinkState = !warningBlinkState;
                    lastWarningToggle = now;
                }
                redOn = warningBlinkState;
                buzzerOn = false;
                emergencyBlinkState = false;
                break;
            case STATE_DANGER:
                greenOn = false;
                redOn = true;
                buzzerOn = true;
                warningBlinkState = false;
                emergencyBlinkState = false;
                break;
            case STATE_EMERGENCY:
                greenOn = false;
                if ((now - lastEmergencyToggle) >= emergencyBlinkInterval)
                {
                    emergencyBlinkState = !emergencyBlinkState;
                    lastEmergencyToggle = now;
                }
                redOn = emergencyBlinkState;
                buzzerOn = true;
                warningBlinkState = false;
                break;
        }

        setLEDs(greenOn, redOn);
        setBuzzer(buzzerOn);

        char line1[17];
        char line2[17];
        SensorData latestSensorData;
        // Read latest snapshot protected by mutex (non-blocking)
        if (xSemaphoreTake(gSensorDataMutex, pdMS_TO_TICKS(10)) == pdTRUE)
        {
            latestSensorData = gLatestSensorData;
            xSemaphoreGive(gSensorDataMutex);
        }
        else
        {
            latestSensorData.temperature = 0.0f;
            latestSensorData.distance = -1.0f;
        }

        // Compose line1 with Temperature and Distance only (fits 16 chars)
        if (latestSensorData.distance < 0.0f)
        {
            snprintf(line1, sizeof(line1), "T:%4.1fC D:Err", latestSensorData.temperature);
        }
        else
        {
            snprintf(line1, sizeof(line1), "T:%4.1fC D:%4.1f", latestSensorData.temperature, latestSensorData.distance);
        }

        // Short state codes: N=Normal, W=Warning, D=Danger, E=Emergency
        char stateChar = 'N';
        switch (currentState)
        {
            case STATE_NORMAL:
                stateChar = 'N';
                break;
            case STATE_WARNING:
                stateChar = 'W';
                break;
            case STATE_DANGER:
                stateChar = 'D';
                break;
            case STATE_EMERGENCY:
                stateChar = 'E';
                break;
        }
        // Put State and Light on second row: e.g. "S:W L:364"
        snprintf(line2, sizeof(line2), "S:%c L:%3d", stateChar, latestSensorData.lightLevel);

        if (xSemaphoreTake(gLcdMutex, pdMS_TO_TICKS(10)) == pdTRUE)
        {
            printLCD(line1, line2);
            xSemaphoreGive(gLcdMutex);
        }

        if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
        {
            Serial.print("[Output] LEDs G=");
            Serial.print(greenOn ? "ON" : "OFF");
            Serial.print(" R=");
            Serial.print(redOn ? "ON" : "OFF");
            Serial.print(" | Buzzer=");
            Serial.print(buzzerOn ? "ON" : "OFF");
            Serial.print(" | LCD=");
            Serial.println(SystemStateToString(currentState));
            xSemaphoreGive(gSerialMutex);
        }

#if ENABLE_STRESS_TESTS
        injectCpuLoad(10); // Inject 10ms of blocking CPU load
#endif
        uint32_t exec_end = micros();
        uint32_t exec_time = exec_end - exec_start;
    telemetryRecordRuntime(outputMetrics, exec_time);

    }
}
