# Fault Injection Testing

## 1. HC-SR04 Timeout / Disconnection
**Fault:** Unplug the HC-SR04 echo pin physically during runtime.
**System Behavior:** `pulseIn` timeouts after 30ms. It retries twice via the new patch applied in Phase 6. Since it fails completely, it returns `-1.0f`.
**System Recovery:** LCD safely prints `D:Err` via the conditional formatting. The RTOS doesn't freeze because the timeout limit guarantees the task keeps yielding.

## 2. Queue Full Simulation
**Fault:** Force `TaskProcessing`'s `vTaskDelay` to simulate a heavily blocked consumer line.
**System Behavior:** `TaskSensor` tries to send, Queue is Full.
**System Recovery:** Handled intrinsically via `if (xQueueSend(...) != pdPASS)`. `TaskSensor` skips sending, logs the failure, drops old data gracefully and waits for the next cycle.

## 3. Disconnected LM35
**Fault:** Pull LM35 data pin high internally or disconnect.
**System Behavior:** Reads 1023 (or wildly high/floating value). `temperature` hits ~300°C. 
**System Recovery:** Safely enters `DANGER` state immediately. No integer overflow happens because `float` safely catches it. 

## Status: PASS
The architecture safely consumes faults and continues operating safely.