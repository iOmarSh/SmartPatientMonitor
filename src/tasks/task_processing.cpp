#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "tasks/task_processing.h"

void TaskProcessing(void *pvParameters)
{
    while (1)
    {
        Serial.println("[Processing Task] Running");

        vTaskDelay(pdMS_TO_TICKS(1500));
    }
}
