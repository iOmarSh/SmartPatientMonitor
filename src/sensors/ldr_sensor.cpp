#include <Arduino.h>
#include "sensors/ldr_sensor.h"

#define LDR_PIN 35

void initLDR()
{
    analogReadResolution(12);
    analogSetPinAttenuation(LDR_PIN, ADC_11db);
    pinMode(LDR_PIN, INPUT);
}

int readLDR()
{
    return analogRead(LDR_PIN);
}