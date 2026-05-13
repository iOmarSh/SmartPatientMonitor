#pragma once

typedef struct {
    float temperature;
    int lightLevel;
    float accelMagnitude;
    bool emergencyPressed;
    unsigned long timestamp;
} SensorData;

enum SystemState {
    STATE_NORMAL,
    STATE_FEVER,
    STATE_FALL,
    STATE_INACTIVITY,
    STATE_EMERGENCY,
    STATE_SENSOR_FAILURE
};