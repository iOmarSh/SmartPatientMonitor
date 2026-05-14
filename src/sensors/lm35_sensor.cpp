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
    // Take multiple readings to average and smooth the noise
    const int NUM_SAMPLES = 10;
    long sum = 0;
    for (int i = 0; i < NUM_SAMPLES; i++)
    {
        sum += analogRead(PIN_LM35);
        delayMicroseconds(100);
    }
    float rawValue = (float)sum / NUM_SAMPLES;

    // Convert ADC to voltage (ESP32 ADC has ~3.3V reference at max attenuation)
    float voltage = (rawValue / 4095.0f) * 3.3f;
    // LM35 outputs 10mV/°C
    float tempC = voltage * 100.0f;
    return tempC;
}