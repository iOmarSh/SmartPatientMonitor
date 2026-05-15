#include <Arduino.h>
#include "tasks/task_processing.h"
#include "pins.h"

void TaskProcessing(void *pvParameters)
{
    while (1)
    {
        // Placeholder for processing logic
        // Example: Check thresholds for temperature and light intensity

        // Simulate processing (e.g., threshold detection)
        Serial.println("[Processing Task] Processing sensor data...");

        vTaskDelay(pdMS_TO_TICKS(1500));
    }
}
