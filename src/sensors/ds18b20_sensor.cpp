#include <Arduino.h>
#include "sensors/ds18b20_sensor.h"

#ifndef DS18_PIN
#define DS18_PIN 4
#endif

void initTemperatureSensor()
{
    // Placeholder initialization: DS18B20 typically needs OneWire; add later
    pinMode(DS18_PIN, INPUT_PULLUP);
}

float readTemperature()
{
    // Return a dummy value until a OneWire driver is added
    return 25.0f;
}
