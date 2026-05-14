#include <Arduino.h>

#include "sync/rtos_sync.h"
#include "pins.h"

QueueHandle_t gSensorQueue = NULL;
QueueHandle_t gStateQueue = NULL;
SemaphoreHandle_t gEmergencySemaphore = NULL;
SemaphoreHandle_t gSerialMutex = NULL;
SemaphoreHandle_t gLcdMutex = NULL;
SemaphoreHandle_t gSensorDataMutex = NULL;

SensorData gLatestSensorData = {0};

void initRtosSyncPrimitives()
{
    gSensorQueue = xQueueCreate(1, sizeof(SensorData));
    gStateQueue = xQueueCreate(1, sizeof(SystemState));
    gEmergencySemaphore = xSemaphoreCreateBinary();
    gSerialMutex = xSemaphoreCreateMutex();
    gLcdMutex = xSemaphoreCreateMutex();
    gSensorDataMutex = xSemaphoreCreateMutex();
}

void IRAM_ATTR onEmergencyButtonInterrupt()
{
    static volatile unsigned long lastInterruptTime = 0;
    unsigned long interruptTime = xTaskGetTickCountFromISR() * portTICK_PERIOD_MS;
    
    // 250ms debounce window
    if (interruptTime - lastInterruptTime > 250)
    {
        BaseType_t higherPriorityTaskWoken = pdFALSE;
        xSemaphoreGiveFromISR(gEmergencySemaphore, &higherPriorityTaskWoken);
        if (higherPriorityTaskWoken == pdTRUE)
        {
            portYIELD_FROM_ISR();
        }
    }
    lastInterruptTime = interruptTime;
}

void initEmergencyButtonInterrupt()
{
    pinMode(PIN_BUTTON, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(PIN_BUTTON), onEmergencyButtonInterrupt, FALLING);
}

const char *SystemStateToString(SystemState state)
{
    switch (state)
    {
        case STATE_NORMAL:
            return "NORMAL";
        case STATE_WARNING:
            return "WARNING";
        case STATE_DANGER:
            return "DANGER";
        case STATE_EMERGENCY:
            return "EMERGENCY";
        default:
            return "UNKNOWN";
    }
}