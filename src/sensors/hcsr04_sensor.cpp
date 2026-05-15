#include <Arduino.h>
#include "sensors/hcsr04_sensor.h"
#include "pins.h"

void initHCSR04()
{
    pinMode(PIN_HCSR04_TRIG, OUTPUT);
    pinMode(PIN_HCSR04_ECHO, INPUT_PULLDOWN);
    digitalWrite(PIN_HCSR04_TRIG, LOW);
}

float readHCSR04Distance()
{
    // Read echo with 30ms timeout (max distance approx 5 meters)
    // Retry a couple of times on timeout to avoid transient Err readings.
    static float lastValidDistance = -1.0f;
    const int MAX_RETRIES = 2;
    long duration = 0;
    for (int attempt = 0; attempt <= MAX_RETRIES; ++attempt)
    {
        // Clear trigger
        digitalWrite(PIN_HCSR04_TRIG, LOW);
        delayMicroseconds(2);
        
        // 10us HIGH pulse with interrupts disabled to prevent preemption
        noInterrupts();
        digitalWrite(PIN_HCSR04_TRIG, HIGH);
        delayMicroseconds(10);
        digitalWrite(PIN_HCSR04_TRIG, LOW);
        interrupts();

        duration = pulseIn(PIN_HCSR04_ECHO, HIGH, 30000);
        if (duration != 0)
            break;
        // small pause before retry
        delay(5); // use delay() instead of delayMicroseconds() to yield to RTOS
    }

    if (duration == 0) {
        // If we have a previous valid reading, return it instead of Err
        if (lastValidDistance > 0.0f)
        {
            return lastValidDistance;
        }
        return -1.0f; // Timeout / Error and no fallback
    }

    // speed of sound = 343 m/s = 0.0343 cm/µs
    float distanceCm = duration * 0.0343f / 2.0f;
    
    // Clamp impossible values
    if (distanceCm > 400.0f) {
        distanceCm = 400.0f;
    }

    lastValidDistance = distanceCm;
    return distanceCm;
}