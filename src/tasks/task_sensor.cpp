#include <Arduino.h>
#include "tasks/task_sensor.h"
#include <Wire.h>
#include "pins.h"
#include "sensors/hcsr04_sensor.h"
#include "sensors/lm35_sensor.h"
#include "sensors/ldr_sensor.h"
#include "sync/rtos_sync.h"
#include "system_types.h"

void TaskSensor(void *pvParameters)
{
    // Initialize I2C
    Wire.begin(I2C_SDA, I2C_SCL);

    while (1)
    {
        SensorData data;

        // Read LM35 temperature
        data.temperature = readLM35Temperature();

        // Read LDR light intensity
        data.lightLevel = readLDR();

        // Read HCSR04 distance
        data.distance = readHCSR04Distance();

        // Read emergency button
        data.emergencyPressed = (digitalRead(PIN_BUTTON) == LOW);

        // Update global sensor data under mutex
        if (xSemaphoreTake(gSensorDataMutex, portMAX_DELAY) == pdTRUE)
        {
            gLatestSensorData = data;
            xSemaphoreGive(gSensorDataMutex);
        }

        // Send to queue
        xQueueOverwrite(gSensorQueue, &data);

        // Print sensor data to Serial (for debugging)
        if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
        {
            Serial.printf("Temp: %.2f C, LDR: %d, Dist: %.2f cm, Emg: %d\n",
                          data.temperature, data.lightLevel, data.distance, data.emergencyPressed);
            xSemaphoreGive(gSerialMutex);
        }

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
