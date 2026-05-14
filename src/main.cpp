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

void setup()
{
    Serial.begin(115200);
    
    // Initialize sensors / inputs
    initLDR();
    initLM35();
    initHCSR04();
    initEmergencyButton();

    // Initialize outputs
    initIndicators();
    initLCD();

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
