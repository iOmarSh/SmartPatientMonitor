#include <Arduino.h>

#include "tasks/task_sensor.h"
#include "tasks/task_processing.h"
#include "tasks/task_output.h"

#include "sensors/ldr_sensor.h"
#include "sensors/ds18b20_sensor.h"
#include "sensors/mpu6050_sensor.h"
#include "sensors/button_input.h"

void setup()
{
    Serial.begin(115200);
    
    // Initialize sensors / inputs
    initLDR();
    initTemperatureSensor();
    initMPU6050();
    initEmergencyButton();
    xTaskCreate(
        TaskSensor,
        "Sensor Task",  
        2048,
        NULL,
        2,
        NULL
    );

    xTaskCreate(
        TaskProcessing,
        "Processing Task",
        2048,
        NULL,
        3,
        NULL
    );

    xTaskCreate(
        TaskOutput,
        "Output Task",
        2048,
        NULL,
        1,
        NULL
    );
}

void loop()
{

}
