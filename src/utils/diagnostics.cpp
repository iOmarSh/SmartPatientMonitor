#include "utils/diagnostics.h"

#if ENABLE_STRESS_TESTS
void injectCpuLoad(int ms_delay)
{
    unsigned long start = millis();
    // Blocking spin-loop to simulate heavy computation blocking the current thread.
    // DOES NOT call vTaskDelay, physically hogs the core.
    while (millis() - start < (unsigned long)ms_delay)
    {
        __asm__ __volatile__("nop");
    }
}
#endif

void logStackWatermarks()
{
    // Task names to monitor (matching main.cpp)
    const char* taskNames[] = {"Sensor Task", "Processing Task", "Output Task", "Emergency Task"};
    
    Serial.println("\n--- [DIAG] Stack High Water Marks ---");
    for (int i = 0; i < 4; i++) {
        TaskHandle_t h = xTaskGetHandle(taskNames[i]);
        if (h != NULL) {
            UBaseType_t watermark = uxTaskGetStackHighWaterMark(h);
            Serial.printf("  %s: %u bytes free\n", taskNames[i], (unsigned int)watermark);
        }
    }
    Serial.println("-------------------------------------\n");
}