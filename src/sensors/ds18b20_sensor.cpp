#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#include "pins.h"
#include "sensors/ds18b20_sensor.h"

namespace
{
    OneWire oneWire(PIN_DS18B20);
    DallasTemperature ds18b20(&oneWire);
    bool sensorReady = false;
}

void initTemperatureSensor()
{
    pinMode(PIN_DS18B20, INPUT_PULLUP);
    ds18b20.begin();
    sensorReady = true;
}

float readTemperature()
{
    if (!sensorReady)
    {
        return NAN;
    }

    ds18b20.requestTemperatures();
    const float temperatureC = ds18b20.getTempCByIndex(0);

    if (temperatureC == DEVICE_DISCONNECTED_C)
    {
        return NAN;
    }

    return temperatureC;
}
