#include <Arduino.h>
#include "tasks/task_output.h"
#include "pins.h"
#include "sync/rtos_sync.h"
#include "outputs/lcd_display.h"
#include "system_types.h"

void TaskOutput(void *pvParameters)
{
    // Initialize pins for output
    pinMode(PIN_BUZZER, OUTPUT);
    pinMode(PIN_LED_GREEN, OUTPUT);
    pinMode(PIN_LED_RED, OUTPUT);

    SystemState currentState = STATE_NORMAL;
    SensorData displayData = {0};

    while (1)
    {
        // Non-blocking read of state queue
        xQueueReceive(gStateQueue, &currentState, pdMS_TO_TICKS(100));

        // Read the latest sensor data
        if (xSemaphoreTake(gSensorDataMutex, pdMS_TO_TICKS(10)) == pdTRUE)
        {
            displayData = gLatestSensorData;
            xSemaphoreGive(gSensorDataMutex);
        }

        // Control LEDs and Buzzer
        if (currentState == STATE_NORMAL)
        {
            digitalWrite(PIN_LED_GREEN, HIGH);
            digitalWrite(PIN_LED_RED, LOW);
            digitalWrite(PIN_BUZZER, LOW);
        }
        else if (currentState == STATE_WARNING)
        {
            digitalWrite(PIN_LED_GREEN, HIGH);
            digitalWrite(PIN_LED_RED, HIGH);
            digitalWrite(PIN_BUZZER, LOW);
        }
        else if (currentState == STATE_DANGER || currentState == STATE_EMERGENCY)
        {
            digitalWrite(PIN_LED_GREEN, LOW);
            digitalWrite(PIN_LED_RED, HIGH);
            digitalWrite(PIN_BUZZER, HIGH);
        }

        // Update LCD
        char row0[17];
        char row1[17];
        
        snprintf(row0, sizeof(row0), "T:%.1f D:%.1f", displayData.temperature, displayData.distance);
        snprintf(row1, sizeof(row1), "St:%-13s", SystemStateToString(currentState));

        if (xSemaphoreTake(gLcdMutex, pdMS_TO_TICKS(50)) == pdTRUE)
        {
            printLCD(row0, row1);
            xSemaphoreGive(gLcdMutex);
        }

        vTaskDelay(pdMS_TO_TICKS(500));
    }
}
