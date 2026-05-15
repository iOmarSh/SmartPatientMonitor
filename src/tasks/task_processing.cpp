#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "tasks/task_processing.h"
#include "sync/rtos_sync.h"
#include "utils/state_logic.h"
#include "utils/diagnostics.h"

void TaskProcessing(void *pvParameters)
{
    SensorData sensorData;
    SystemState previousState = STATE_NORMAL;

    while (1)
    {
        telemetryRecordCycleStart(processingMetrics, millis());
        if (xQueueReceive(gSensorQueue, &sensorData, pdMS_TO_TICKS(500)) == pdPASS)
        {
            uint32_t exec_start = micros();

#if ENABLE_STRESS_TESTS
            injectCpuLoad(10); // Optional stress test load
#endif
            SystemState newState = determineSystemState(sensorData);

            if (newState != previousState && xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
            {
                Serial.print("[");
                Serial.print(xTaskGetTickCount() * portTICK_PERIOD_MS);
                Serial.print("] [Processing] State transition: ");
                Serial.print(SystemStateToString(previousState));
                Serial.print(" -> ");
                Serial.println(SystemStateToString(newState));
                xSemaphoreGive(gSerialMutex);
            }

            previousState = newState;
            
            if (xQueueOverwrite(gStateQueue, &newState) == pdPASS)
            {
                if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
                {
                    Serial.print("[");
                    Serial.print(xTaskGetTickCount() * portTICK_PERIOD_MS);
                    Serial.print("] [StateQueue] SEND OK | ");
                    Serial.println(SystemStateToString(newState));
                    xSemaphoreGive(gSerialMutex);
                }
            }

            uint32_t exec_end = micros();
            uint32_t exec_time = exec_end - exec_start;
            telemetryRecordRuntime(processingMetrics, exec_time);
        }
        else
        {
            if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
            {
                Serial.print("[");
                Serial.print(xTaskGetTickCount() * portTICK_PERIOD_MS);
                Serial.println("] [Processing] Queue Receive Timeout / Fail");
                xSemaphoreGive(gSerialMutex);
            }
        }
    }
}
