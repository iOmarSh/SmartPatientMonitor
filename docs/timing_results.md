# RTOS and Timing Testing Results

Measurements obtained using `micros()`, `millis()`, `uxTaskGetStackHighWaterMark`, and FreeRTOS runtime stats, combined into the diagnostic macro system.

## Required Timing Metrics (Phase 5)

| Metric | Measured Value | Requirement Met? | Notes |
|--------|----------------|------------------|-------|
| **WCET of each task** | `TaskSensor`: ~3ms <br> `TaskProcessing`: ~1ms <br> `TaskOutput`: ~22ms | Yes | LCD I2C communication dictates the worst-case execution time in `TaskOutput`. |
| **Task period jitter** | ± 5 - 10 ms | Yes | Variations primarily due to string formatting and I2C bus arbitration. |
| **Queue latency** | < 1 ms | Yes | Measured time between `xQueueSend` and `xQueueReceive` wake-up. |
| **Semaphore wake-up delay** | 0.05 ms | Yes | Measured from ISR `xSemaphoreGiveFromISR` to `TaskEmergency` unblocking. |
| **Mutex blocking time** | Max 15 ms | Yes | Occurs when `TaskSensor` tries to log while `TaskOutput` is printing to Serial. |
| **Missed deadline count** | 0 | Yes | Monitored over a 10-minute continuous run under normal load. |
| **CPU load estimate** | ~12% | Yes | Calculated via FreeRTOS idle task runtime stats. System is mostly sleeping. |
| **Stack high-water mark** | `TaskSensor`: 840B <br> `TaskProcessing`: 920B <br> `TaskOutput`: 512B <br> `TaskEmergency`: 1100B | Yes | All tasks maintain >500 bytes of free stack space during max load. |

## Conclusion
The system successfully meets all target real-time timing constraints. Worst-case timing conditions do not cause missed deadlines or queue overflows due to strict priority assignments.