#pragma once

typedef struct
{
    float temperature;
    int lightLevel;
    float distance;
    bool emergencyPressed;
} SensorData;

enum SystemState
{
    STATE_NORMAL,
    STATE_WARNING,
    STATE_DANGER,
    STATE_EMERGENCY
};

extern const char *SystemStateToString(SystemState state);