#include <Arduino.h>

#include "tasks/task_sensor.h"
#include "tasks/task_processing.h"
#include "tasks/task_output.h"

void setup()
{
    Serial.begin(115200);

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
