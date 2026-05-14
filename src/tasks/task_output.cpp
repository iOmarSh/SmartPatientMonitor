#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "tasks/task_output.h"

void TaskOutput(void *pvParameters)
{
    while (1)
    {
        Serial.println("[Output Task] Running");

        vTaskDelay(pdMS_TO_TICKS(2000));
    }
}
