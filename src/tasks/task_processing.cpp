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
        MEASURE_START(procQueueReceive)
        if (xQueueReceive(gSensorQueue, &sensorData, pdMS_TO_TICKS(500)) == pdPASS)
        {
            MEASURE_END(procQueueReceive, 250000); // Expect < 250ms blocking if 200ms sampling

            injectCpuLoad(10); // Optional stress test load
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
