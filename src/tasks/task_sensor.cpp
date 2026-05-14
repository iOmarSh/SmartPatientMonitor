#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "tasks/task_sensor.h"
#include "sensors/ldr_sensor.h"
#include "sensors/button_input.h"

void TaskSensor(void *pvParameters)
{
    while (1)
    {
        int ldrValue = readLDR();
        bool buttonPressed = isEmergencyPressed();
        Serial.print("[LDR] ADC value: ");
        Serial.println(ldrValue);
        Serial.print("[Button GPIO18] State: ");
        Serial.println(buttonPressed ? "PRESSED" : "RELEASED");

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
