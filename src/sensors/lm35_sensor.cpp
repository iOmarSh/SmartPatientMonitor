#include <Arduino.h>
#include "sensors/lm35_sensor.h"
#include "pins.h"

void initLM35()
{
    // LM35 connected to analog pin
    pinMode(PIN_LM35, INPUT);
}

float readLM35Temperature()
{
    int rawValue = analogRead(PIN_LM35);
    // Convert ADC to voltage (ESP32 ADC has ~3.3V reference at max attenuation, but non-linear)
    // A standard conversion for 12-bit ADC: voltage = rawValue / 4095.0 * 3.3
    // LM35 outputs 10mV/°C
    float voltage = (rawValue / 4095.0f) * 3.3f;
    float tempC = voltage * 100.0f;
    return tempC;
}