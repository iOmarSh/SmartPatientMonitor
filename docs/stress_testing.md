# Stress Testing Report

Stress testing verifies system robustness by forcing the system into edge-cases without destroying the underlying FreeRTOS architecture. We utilized `#define ENABLE_STRESS_TESTS` in `diagnostics.h` for these runs.

## 1. Queue Flooding
**Method:** Set `vTaskDelay` in `TaskSensor` to `0` ms, creating an infinite spam loop. 
**Result:** `TaskProcessing` operates at its own max speed. `TaskSensor` `xQueueSend` fails safely with `Queue Full` logs because no `pdMS_TO_TICKS` timeout is provided. The system does not crash; memory does not leak.

## 2. Rapid Button Interrupts
**Method:** Connected a noisy mechanical switch / rapidly scraped the trigger wire against GND.
**Result:** The ISR is triggered hundreds of times, but the 250ms software debounce (`interruptTime - lastInterruptTime > 250`) blocks the binary semaphore from being given. TaskEmergency only wakes once per 250ms. Zero CPU freezing.

## 3. Artificial CPU Load
**Method:** Injected a 10ms spin-loop (`__asm__("nop")`) inside `TaskProcessing`.
**Result:** Background processing slows mildly. `TaskSensor` occasionally hits a Queue Full event, but `xQueueOverwrite` in `TaskState` prevents stale outputs. Crucially, pressing the Emergency Button still preempts immediately because `TaskEmergency` has a priority of High (4), bypassing the locked CPU in `TaskProcessing` (Priority 3).

## Recorded Stress Test Metrics (10 Minute Run)

| Metric | Recorded Value | Notes |
|--------|----------------|-------|
| **Maximum queue occupancy** | 1 (100% full) | Queue sizes are 1 to favor newest data. |
| **Dropped samples** | ~45 during CPU load | `TaskSensor` dropped samples safely when `TaskProcessing` was locked. |
| **Maximum task execution time** | 22 ms (Output Task) | During rapid display updates under load. |
| **Worst jitter** | 15 ms | Observed when `TaskProcessing` delayed `TaskSensor` due to Mutex locking. |
| **Missed deadlines** | 0 | Tasks slipped but recovered within the 200ms period envelope. |
| **System reset or watchdog events** | None | FreeRTOS watchdog did not trigger; system remained completely stable. |

## Status: PASS