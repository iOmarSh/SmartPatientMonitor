#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "tasks/task_sensor.h"
#include "sensors/ldr_sensor.h"
#include "sensors/lm35_sensor.h"
#include "sensors/hcsr04_sensor.h"
#include "sensors/button_input.h"

void TaskSensor(void *pvParameters)
{
    while (1)
    {
        int ldrValue = readLDR();
        float tempC = readLM35Temperature();
        float distCm = readHCSR04Distance();
        bool buttonPressed = isEmergencyPressed();

        Serial.print("[Sensors] LDR=");
        Serial.print(ldrValue);
        
        Serial.print(" | LM35=");
        Serial.print(tempC, 1);
        Serial.print(" C");

        Serial.print(" | HCSR04=");
        if (distCm < 0) {
            Serial.print("Err");
        } else {
            Serial.print(distCm, 1);
            Serial.print(" cm");
        }

        Serial.print(" | Button=");
        Serial.println(buttonPressed ? "PRESSED" : "RELEASED");

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
