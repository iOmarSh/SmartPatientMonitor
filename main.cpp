#include <Arduino.h>
#include "sensors/ldr_sensor.h"

void setup()
{
    Serial.begin(115200);

    initLDR();
}

void loop()
{
    int lightValue = readLDR();

    Serial.print("LDR Value: ");
    Serial.println(lightValue);

    delay(1000);
}

// xTaskCreate(TaskSensor, "Sensor", 4096, NULL, 2, NULL);
// xTaskCreate(TaskProcessing, "Processing", 4096, NULL, 3, NULL);
// xTaskCreate(TaskOutput, "Output", 4096, NULL, 2, NULL);