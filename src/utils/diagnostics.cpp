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