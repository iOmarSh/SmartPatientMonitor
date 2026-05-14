#include <Arduino.h>
#include "sensors/ldr_sensor.h"
#include "pins.h"

void initLDR()
{
    analogReadResolution(12);
    analogSetPinAttenuation(PIN_LDR, ADC_11db);
    pinMode(PIN_LDR, INPUT);
}

int readLDR()
{
    return analogRead(PIN_LDR);
}