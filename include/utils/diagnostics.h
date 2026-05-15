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

// Diagnostics structures for tracking real-time metrics
struct TaskMetrics {
    const char *name;
    uint32_t period_target_ms;
    uint32_t wcet_us;
    uint32_t min_exec_us;
    uint32_t window_exec_us;
    uint64_t lifetime_exec_us;
    uint32_t cycles;
    uint32_t last_cycle_start_ms;
    uint32_t max_period_ms;
    uint32_t min_period_ms;
    uint32_t deadline_misses;
};

// Global metrics and handles so we can print them periodically
extern TaskMetrics sensorMetrics;
extern TaskMetrics processingMetrics;
extern TaskMetrics outputMetrics;

extern TaskHandle_t hTaskSensor;
extern TaskHandle_t hTaskProcessing;
extern TaskHandle_t hTaskOutput;
extern TaskHandle_t hTaskEmergency;

void telemetryRecordCycleStart(TaskMetrics &metrics, uint32_t now_ms);
void telemetryRecordRuntime(TaskMetrics &metrics, uint32_t exec_us);
void printSystemDiagnostics();