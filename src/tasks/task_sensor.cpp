#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "tasks/task_sensor.h"
#include "sensors/ldr_sensor.h"
#include "sensors/ds18b20_sensor.h"
#include "sensors/mpu6050_sensor.h"
#include "sensors/button_input.h"

void TaskSensor(void *pvParameters)
{
    while (1)
    {
        int ldrValue = readLDR();
        float temperatureC = readTemperature();
        float accelerationMagnitude = readAccelerationMagnitude();
        bool buttonPressed = isEmergencyPressed();

        Serial.print("[Sensors] LDR=");
        Serial.print(ldrValue);
        Serial.print(" | DS18B20=");
        if (isnan(temperatureC))
        {
            Serial.print("N/A");
        }
        else
        {
            Serial.print(temperatureC, 2);
            Serial.print(" C");
        }

        Serial.print(" | MPU6050 |acc|=");
        if (isnan(accelerationMagnitude))
        {
            Serial.print("N/A");
        }
        else
        {
            Serial.print(accelerationMagnitude, 2);
            Serial.print(" m/s^2");
        }

        Serial.print(" | Button=");
        Serial.println(buttonPressed ? "PRESSED" : "RELEASED");

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
