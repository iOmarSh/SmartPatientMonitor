#include <Arduino.h>
#include "tasks/task_sensor.h"

void TaskSensor(void *pvParameters)
{
    while (1)
    {
        Serial.println("[Sensor Task] Running");

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
