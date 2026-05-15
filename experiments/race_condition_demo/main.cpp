#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

struct DemoData {
    int id;
    int value;
};

DemoData sharedData = {0, 0};
SemaphoreHandle_t demoMutex;

void WriterTask(void *pvParam) {
    int counter = 0;
    while(1) {
        // RACE CONDITION PREVENTED HERE
        if(xSemaphoreTake(demoMutex, portMAX_DELAY) == pdTRUE) {
            sharedData.id = counter;
            // Simulated delay proving context switch danger
            vTaskDelay(pdMS_TO_TICKS(10)); 
            sharedData.value = counter * 10;
            xSemaphoreGive(demoMutex);
        }
        counter++;
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}

void ReaderTask(void *pvParam) {
    while(1) {
        if(xSemaphoreTake(demoMutex, portMAX_DELAY) == pdTRUE) {
            int read_id = sharedData.id;
            int read_val = sharedData.value;
            xSemaphoreGive(demoMutex);
            
            // If unprotected, ID could equal 5 but value could equal 40.
            if(read_val != read_id * 10) {
                Serial.println("CORRUPTION DETECTED!");
            }
        }
        vTaskDelay(pdMS_TO_TICKS(20));
    }
}

void setup() {
    Serial.begin(115200);
    demoMutex = xSemaphoreCreateMutex();
    xTaskCreate(WriterTask, "Writer", 2048, NULL, 1, NULL);
    xTaskCreate(ReaderTask, "Reader", 2048, NULL, 1, NULL);
}

void loop() {}
