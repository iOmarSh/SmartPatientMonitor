#include "utils/diagnostics.h"
#include "sync/rtos_sync.h"
#include "esp_heap_caps.h"

namespace
{
    constexpr uint32_t kHeapHistorySize = 24;
    constexpr uint32_t kReportIntervalMs = 5000;
    constexpr uint32_t kDeadlineToleranceMs = 5;
    constexpr char kSparkChars[] = " .:-=+*#%@";

    uint32_t heapHistory[kHeapHistorySize] = {0};
    uint32_t heapHistoryCount = 0;
    uint32_t heapHistoryIndex = 0;
    uint32_t lastReportMs = 0;
    uint32_t lastReportUs = 0;

    void pushHeapSample(uint32_t freeHeap)
    {
        heapHistory[heapHistoryIndex] = freeHeap;
        heapHistoryIndex = (heapHistoryIndex + 1) % kHeapHistorySize;
        if (heapHistoryCount < kHeapHistorySize)
        {
            heapHistoryCount++;
        }
    }

    uint32_t currentFreeHeap()
    {
        return heap_caps_get_free_size(MALLOC_CAP_8BIT);
    }

    uint32_t totalHeapSize()
    {
        return heap_caps_get_total_size(MALLOC_CAP_8BIT);
    }

    void printHeapGraph(uint32_t freeHeap)
    {
        if (heapHistoryCount == 0)
        {
            return;
        }

        uint32_t minHeap = heapHistory[0];
        uint32_t maxHeap = heapHistory[0];
        uint32_t startIndex = (heapHistoryCount == kHeapHistorySize) ? heapHistoryIndex : 0;

        for (uint32_t i = 0; i < heapHistoryCount; ++i)
        {
            uint32_t value = heapHistory[(startIndex + i) % kHeapHistorySize];
            if (value < minHeap) minHeap = value;
            if (value > maxHeap) maxHeap = value;
        }

        Serial.printf("Heap Free: %u bytes | Used: %u bytes | Window Min/Max: %u/%u bytes\n",
                      freeHeap,
                      totalHeapSize() - freeHeap,
                      minHeap,
                      maxHeap);

        Serial.print("Heap Graph: |");
        for (uint32_t i = 0; i < heapHistoryCount; ++i)
        {
            uint32_t value = heapHistory[(startIndex + i) % kHeapHistorySize];
            uint32_t sparkIndex = 0;
            if (maxHeap > minHeap)
            {
                sparkIndex = (value - minHeap) * (sizeof(kSparkChars) - 2) / (maxHeap - minHeap);
            }
            Serial.print(kSparkChars[sparkIndex]);
        }
        Serial.println("|");
    }

    void printTaskMetrics(const char *label, const TaskMetrics &metrics, uint32_t windowUs)
    {
        const float utilization = (windowUs > 0)
                                      ? (100.0f * static_cast<float>(metrics.window_exec_us) / static_cast<float>(windowUs * portNUM_PROCESSORS))
                                      : 0.0f;
        const float averageExec = (metrics.cycles > 0)
                                      ? static_cast<float>(metrics.window_exec_us) / static_cast<float>(metrics.cycles)
                                      : 0.0f;
        const uint32_t minPeriod = (metrics.min_period_ms == UINT32_MAX) ? 0 : metrics.min_period_ms;
        const bool hasDeadline = metrics.period_target_ms > 0;

        Serial.printf("%-8s | CPU: %6.2f%% | Window: %8lu us | Avg: %8.1f us | WCET: %6lu us | Cycles: %4lu | Period: %lu-%lu ms | Deadline: %s",
                      label,
                      utilization,
                      static_cast<unsigned long>(metrics.window_exec_us),
                      averageExec,
                      static_cast<unsigned long>(metrics.wcet_us),
                      static_cast<unsigned long>(metrics.cycles),
                      static_cast<unsigned long>(minPeriod),
                      static_cast<unsigned long>(metrics.max_period_ms),
                      hasDeadline ? "tracked" : "N/A");
        if (hasDeadline)
        {
            Serial.printf(" | Misses: %lu", static_cast<unsigned long>(metrics.deadline_misses));
        }
        Serial.println();
    }
}

#if ENABLE_STRESS_TESTS
void injectCpuLoad(int ms_delay)
{
    unsigned long start = millis();
    while (millis() - start < static_cast<unsigned long>(ms_delay))
    {
        __asm__ __volatile__("nop");
    }
}
#endif

TaskMetrics sensorMetrics = {"Sensor", 200, 0, UINT32_MAX, 0, 0, 0, 0, 0, UINT32_MAX, 0};
TaskMetrics processingMetrics = {"Process", 0, 0, UINT32_MAX, 0, 0, 0, 0, 0, UINT32_MAX, 0};
TaskMetrics outputMetrics = {"Output", 0, 0, UINT32_MAX, 0, 0, 0, 0, 0, UINT32_MAX, 0};

TaskHandle_t hTaskSensor = NULL;
TaskHandle_t hTaskProcessing = NULL;
TaskHandle_t hTaskOutput = NULL;
TaskHandle_t hTaskEmergency = NULL;

void telemetryRecordCycleStart(TaskMetrics &metrics, uint32_t now_ms)
{
    if (metrics.last_cycle_start_ms != 0)
    {
        uint32_t period_ms = now_ms - metrics.last_cycle_start_ms;
        if (period_ms > metrics.max_period_ms) metrics.max_period_ms = period_ms;
        if (period_ms < metrics.min_period_ms) metrics.min_period_ms = period_ms;
        if (metrics.period_target_ms > 0 && period_ms > (metrics.period_target_ms + kDeadlineToleranceMs))
        {
            metrics.deadline_misses++;
        }
    }

    metrics.last_cycle_start_ms = now_ms;
    metrics.cycles++;
}

void telemetryRecordRuntime(TaskMetrics &metrics, uint32_t exec_us)
{
    metrics.window_exec_us += exec_us;
    metrics.lifetime_exec_us += exec_us;
    if (exec_us > metrics.wcet_us) metrics.wcet_us = exec_us;
    if (exec_us < metrics.min_exec_us) metrics.min_exec_us = exec_us;
}

void printSystemDiagnostics()
{
    const uint32_t nowMs = millis();
    const uint32_t nowUs = micros();

    if (lastReportMs == 0)
    {
        lastReportMs = nowMs - kReportIntervalMs;
        lastReportUs = nowUs - (kReportIntervalMs * 1000UL);
    }

    const uint32_t windowMs = nowMs - lastReportMs;
    const uint32_t windowUs = nowUs - lastReportUs;
    if (windowUs == 0 || windowMs < kReportIntervalMs)
    {
        return;
    }

    const uint32_t freeHeap = currentFreeHeap();
    pushHeapSample(freeHeap);

    if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(50)) == pdTRUE)
    {
        const uint32_t totalTaskUs = sensorMetrics.window_exec_us + processingMetrics.window_exec_us + outputMetrics.window_exec_us;
        const float cpuUtil = (windowUs > 0)
                                  ? (100.0f * static_cast<float>(totalTaskUs) / static_cast<float>(windowUs * portNUM_PROCESSORS))
                                  : 0.0f;

        Serial.println("\n=== SYSTEM TELEMETRY ===");
        Serial.printf("Report Window: %lu ms\n", static_cast<unsigned long>(windowMs));
        Serial.printf("System CPU Utilization: %.2f%% of %u cores\n", cpuUtil, portNUM_PROCESSORS);
        printHeapGraph(freeHeap);

        if (hTaskSensor) Serial.printf("Stack HWM [Sensor]: %u words\n", uxTaskGetStackHighWaterMark(hTaskSensor));
        if (hTaskProcessing) Serial.printf("Stack HWM [Process]: %u words\n", uxTaskGetStackHighWaterMark(hTaskProcessing));
        if (hTaskOutput) Serial.printf("Stack HWM [Output]: %u words\n", uxTaskGetStackHighWaterMark(hTaskOutput));
        if (hTaskEmergency) Serial.printf("Stack HWM [Emergency]: %u words\n", uxTaskGetStackHighWaterMark(hTaskEmergency));

        Serial.println("--- Per-Task Runtime Statistics ---");
        printTaskMetrics("Sensor", sensorMetrics, windowUs);
        printTaskMetrics("Process", processingMetrics, windowUs);
        printTaskMetrics("Output", outputMetrics, windowUs);
        Serial.printf("Lifetime Runtime Us: Sensor=%llu Process=%llu Output=%llu\n",
                      static_cast<unsigned long long>(sensorMetrics.lifetime_exec_us),
                      static_cast<unsigned long long>(processingMetrics.lifetime_exec_us),
                      static_cast<unsigned long long>(outputMetrics.lifetime_exec_us));
        Serial.println("========================\n");

        xSemaphoreGive(gSerialMutex);
    }

    sensorMetrics.window_exec_us = 0;
    processingMetrics.window_exec_us = 0;
    outputMetrics.window_exec_us = 0;
    sensorMetrics.cycles = 0;
    processingMetrics.cycles = 0;
    outputMetrics.cycles = 0;
    sensorMetrics.min_period_ms = UINT32_MAX;
    processingMetrics.min_period_ms = UINT32_MAX;
    outputMetrics.min_period_ms = UINT32_MAX;
    sensorMetrics.max_period_ms = 0;
    processingMetrics.max_period_ms = 0;
    outputMetrics.max_period_ms = 0;
    sensorMetrics.deadline_misses = 0;
    processingMetrics.deadline_misses = 0;
    outputMetrics.deadline_misses = 0;
    lastReportMs = nowMs;
    lastReportUs = nowUs;
}