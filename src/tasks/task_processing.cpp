#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "tasks/task_processing.h"
#include "sync/rtos_sync.h"

void TaskProcessing(void *pvParameters)
{
    const float WARNING_DISTANCE_CM = 30.0f;
    const float DANGER_TEMPERATURE_C = 38.0f;
    SensorData sensorData;
    SystemState previousState = STATE_NORMAL;

    while (1)
    {
        if (xQueueReceive(gSensorQueue, &sensorData, pdMS_TO_TICKS(500)) == pdPASS)
        {
            SystemState newState;

            if (sensorData.emergencyPressed)
            {
                newState = STATE_EMERGENCY;
            }
            else if (sensorData.temperature >= DANGER_TEMPERATURE_C)
            {
                // Only enter DANGER when temperature meets threshold.
                newState = STATE_DANGER;
            }
            else if (sensorData.distance > 0.0f && sensorData.distance <= WARNING_DISTANCE_CM)
            {
                newState = STATE_WARNING;
            }
            else
            {
                newState = STATE_NORMAL;
            }

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
