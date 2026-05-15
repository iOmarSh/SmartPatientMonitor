#pragma once
#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

// Define to 1 to enable stress testing via CPU loop injections and forced delays
#define ENABLE_STRESS_TESTS 1

// Diagnostic macros for timing execution speeds
#define MEASURE_START(name) unsigned long _start_##name = micros();
#define MEASURE_END(name, limit_us) \
    do { \
        unsigned long _dur = micros() - _start_##name; \
        if (_dur > limit_us) { \
            Serial.printf("[DIAG] %s took %lu us (Limit: %d us)\n", #name, _dur, limit_us); \
        } \
    } while(0)

#if ENABLE_STRESS_TESTS
void injectCpuLoad(int ms_delay);
#else
#define injectCpuLoad(ms)
#endif