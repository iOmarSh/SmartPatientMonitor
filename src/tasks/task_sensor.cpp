#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "tasks/task_sensor.h"
#include "sensors/ldr_sensor.h"
#include "sensors/lm35_sensor.h"
#include "sensors/hcsr04_sensor.h"
#include "sensors/button_input.h"
#include "sync/rtos_sync.h"

void TaskSensor(void *pvParameters)
{
    SensorData sensorData;

    while (1)
    {
        sensorData.lightLevel = readLDR();
        sensorData.temperature = readLM35Temperature();
        sensorData.distance = readHCSR04Distance();
        sensorData.emergencyPressed = isEmergencyPressed();

        if (xQueueSend(gSensorQueue, &sensorData, 0) == pdPASS)
        {
            // Update global latest snapshot for display consumers
            if (xSemaphoreTake(gSensorDataMutex, pdMS_TO_TICKS(10)) == pdTRUE)
            {
                gLatestSensorData = sensorData;
                xSemaphoreGive(gSensorDataMutex);
            }

            if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
            {
                Serial.print("[");
                Serial.print(xTaskGetTickCount() * portTICK_PERIOD_MS);
                Serial.print("] [SensorQueue] SEND OK | T=");
                Serial.print(sensorData.temperature, 1);
                Serial.print(" C | LDR=");
                Serial.print(sensorData.lightLevel);
                Serial.print(" | DIST=");
                if (sensorData.distance < 0.0f)
                {
                    Serial.print("Err");
                }
                else
                {
                    Serial.print(sensorData.distance, 1);
                    Serial.print(" cm");
                }
                Serial.print(" | BTN=");
                Serial.println(sensorData.emergencyPressed ? "PRESSED" : "RELEASED");
                xSemaphoreGive(gSerialMutex);
            }
        }
        else
        {
            if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
            {
                Serial.print("[");
                Serial.print(xTaskGetTickCount() * portTICK_PERIOD_MS);
                Serial.println("] [SensorQueue] SEND FAIL: Queue Full");
                xSemaphoreGive(gSerialMutex);
            }
        }

        // Sample sensors at 200ms intervals to match processing expectations
        vTaskDelay(pdMS_TO_TICKS(200));
    }
}
