#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

#include "pins.h"
#include "sensors/mpu6050_sensor.h"

namespace
{
    Adafruit_MPU6050 mpu;
    bool sensorReady = false;
}

void initMPU6050()
{
    Wire.begin(I2C_SDA, I2C_SCL);
    sensorReady = mpu.begin();

    if (sensorReady)
    {
        mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
        mpu.setGyroRange(MPU6050_RANGE_500_DEG);
        mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    }
}

float readAccelerationMagnitude()
{
    if (!sensorReady)
    {
        return NAN;
    }

    sensors_event_t accel;
    sensors_event_t gyro;
    sensors_event_t temp;
    mpu.getEvent(&accel, &gyro, &temp);

    const float ax = accel.acceleration.x;
    const float ay = accel.acceleration.y;
    const float az = accel.acceleration.z;

    return sqrt((ax * ax) + (ay * ay) + (az * az));
}
