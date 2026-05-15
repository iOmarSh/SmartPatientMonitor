#include <Arduino.h>

#include "tasks/task_sensor.h"
#include "tasks/task_processing.h"
#include "tasks/task_output.h"

#include "sensors/ldr_sensor.h"
#include "sensors/lm35_sensor.h"
#include "sensors/hcsr04_sensor.h"
#include "sensors/button_input.h"

#include "outputs/indicators.h"
#include "outputs/lcd_display.h"
#include "sync/rtos_sync.h"
#include "utils/diagnostics.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

void TaskEmergency(void *pvParameters);

void setup()
{
    Serial.begin(115200);

    initLDR();
    initLM35();
    initHCSR04();
    initEmergencyButton();
    initRtosSyncPrimitives();
    initEmergencyButtonInterrupt();
    initIndicators();
    initLCD();

    xTaskCreate(TaskSensor, "Sensor Task", 2048, NULL, 2, &hTaskSensor);
    xTaskCreate(TaskProcessing, "Processing Task", 2048, NULL, 3, &hTaskProcessing);
    xTaskCreate(TaskOutput, "Output Task", 4096, NULL, 1, &hTaskOutput);
    xTaskCreate(TaskEmergency, "Emergency Task", 2048, NULL, 4, &hTaskEmergency);
}

void loop()
{
    static uint32_t last_diag_time = 0;
    if (millis() - last_diag_time > 5000)
    {
        printSystemDiagnostics();
        last_diag_time = millis();
    }
    delay(10);
}

void TaskEmergency(void *pvParameters)
{
    while (1)
    {
        if (xSemaphoreTake(gEmergencySemaphore, portMAX_DELAY) == pdTRUE)
        {
            if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
            {
                Serial.println("[Emergency ISR] Semaphore triggered");
                xSemaphoreGive(gSerialMutex);
            }

            SystemState emergencyState = STATE_EMERGENCY;
            xQueueOverwrite(gStateQueue, &emergencyState);

            if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
            {
                Serial.println("[Emergency Task] Forced state = EMERGENCY");
                xSemaphoreGive(gSerialMutex);
            }
        }
    }
}
