#pragma once

#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/semphr.h"
#include "system_types.h"

extern QueueHandle_t gSensorQueue;
extern QueueHandle_t gStateQueue;
extern SemaphoreHandle_t gEmergencySemaphore;
extern SemaphoreHandle_t gSerialMutex;
extern SemaphoreHandle_t gLcdMutex;
extern SemaphoreHandle_t gSensorDataMutex;

// Latest sensor snapshot for outputs to read without consuming the queue
extern SensorData gLatestSensorData;

void initRtosSyncPrimitives();
void initEmergencyButtonInterrupt();
void IRAM_ATTR onEmergencyButtonInterrupt();