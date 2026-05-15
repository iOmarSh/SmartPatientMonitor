#include <Arduino.h>
#include "tasks/task_processing.h"
#include "pins.h"
#include "sync/rtos_sync.h"
#include "utils/state_logic.h"

void TaskProcessing(void *pvParameters)
{
    SensorData data;
    while (1)
    {
        if (xQueueReceive(gSensorQueue, &data, portMAX_DELAY) == pdTRUE)
        {
            SystemState newState = determineSystemState(data);
            
            xQueueOverwrite(gStateQueue, &newState);

            if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
            {
                Serial.printf("[Processing Task] State evaluated: %s\n", SystemStateToString(newState));
                xSemaphoreGive(gSerialMutex);
            }
        }
    }
}
