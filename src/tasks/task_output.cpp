#include <Arduino.h>
#include "tasks/task_output.h"
#include "pins.h"

void TaskOutput(void *pvParameters)
{
    // Initialize pins for output
    pinMode(PIN_BUZZER, OUTPUT);
    pinMode(PIN_GREEN_LED, OUTPUT);
    pinMode(PIN_RED_LED, OUTPUT);

    while (1)
    {
        // Placeholder for output logic
        // Example: Control LEDs and buzzer based on conditions

        digitalWrite(PIN_GREEN_LED, HIGH); // Turn on green LED
        digitalWrite(PIN_RED_LED, LOW);   // Turn off red LED
        digitalWrite(PIN_BUZZER, LOW);    // Turn off buzzer

        Serial.println("[Output Task] Controlling outputs...");

        vTaskDelay(pdMS_TO_TICKS(2000));
    }
}
