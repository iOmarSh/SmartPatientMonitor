#include <Arduino.h>
#include <Wire.h>
#include "sensors/mpu6050_sensor.h"

void initMPU6050()
{
    // Minimal I2C init; full MPU6050 driver will be added later
    Wire.begin();
}

float readAccelerationMagnitude()
{
    // Placeholder: return 0 until proper driver is implemented
    return 0.0f;
}
