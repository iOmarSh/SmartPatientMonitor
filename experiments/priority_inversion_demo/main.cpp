#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

SemaphoreHandle_t resourceMutex;

void LowTask(void *pvParam) {
    while(1) {
        if(xSemaphoreTake(resourceMutex, portMAX_DELAY) == pdTRUE) {
            Serial.println("LOW: Hold mutex");
            // Simulate work
            for(volatile int i=0; i<5000000; i++); 
            Serial.println("LOW: Release mutex");
            xSemaphoreGive(resourceMutex);
        }
        vTaskDelay(pdMS_TO_TICKS(50));
    }
}

void MediumTask(void *pvParam) {
    vTaskDelay(pdMS_TO_TICKS(100)); // Start later
    while(1) {
        Serial.println("MEDIUM: Im preempting Low, blocking High indirectly!");
        for(volatile int i=0; i<10000000; i++); 
        vTaskDelay(pdMS_TO_TICKS(200));
    }
}

void HighTask(void *pvParam) {
    vTaskDelay(pdMS_TO_TICKS(50));
    while(1) {
        Serial.println("HIGH: Waiting for Mutex...");
        if(xSemaphoreTake(resourceMutex, portMAX_DELAY) == pdTRUE) {
            Serial.println("HIGH: Got Mutex!");
            xSemaphoreGive(resourceMutex);
        }
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}

void setup() {
    Serial.begin(115200);
    resourceMutex = xSemaphoreCreateMutex(); 
    // Mutex automatically utilizes Priority Inheritance in FreeRTOS.
    xTaskCreate(LowTask, "Low", 2048, NULL, 1, NULL);
    xTaskCreate(MediumTask, "Medium", 2048, NULL, 2, NULL);
    xTaskCreate(HighTask, "High", 2048, NULL, 3, NULL);
}

void loop() {}