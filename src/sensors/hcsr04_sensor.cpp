#include <Arduino.h>
#include "sensors/hcsr04_sensor.h"
#include "pins.h"

void initHCSR04()
{
    pinMode(PIN_HCSR04_TRIG, OUTPUT);
    pinMode(PIN_HCSR04_ECHO, INPUT);
    digitalWrite(PIN_HCSR04_TRIG, LOW);
}

float readHCSR04Distance()
{
    digitalWrite(PIN_HCSR04_TRIG, LOW);
    delayMicroseconds(2);
    digitalWrite(PIN_HCSR04_TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(PIN_HCSR04_TRIG, LOW);

    long duration = pulseIn(PIN_HCSR04_ECHO, HIGH, 30000); // 30ms timeout
    if (duration == 0) {
        return -1.0f; // Timeout / Error
    }

    // speed of sound = 343 m/s = 0.0343 cm/µs
    float distanceCm = duration * 0.0343f / 2.0f;
    return distanceCm;
}