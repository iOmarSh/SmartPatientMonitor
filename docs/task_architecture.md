# RTOS Task Architecture Table

| Task | Priority | Period | Deadline | Purpose |
|------|----------|--------|----------|---------|
| **TaskSensor** (Analog/Digital Input) | 2 (Normal) | 200 ms | 200 ms | Reads analog (LM35, LDR) and digital (HC-SR04) sensors periodically. Aggregates data and sends it to the Processing Task via a queue. |
| **TaskProcessing** (Decision Task) | 3 (High) | 200 ms (Event-driven) | 200 ms | Receives data from the sensor queue, evaluates logic to determine system state, and sends the state to the Output Task. Priority is higher than Sensor to prevent queue overflow. |
| **TaskOutput** (Actuator Task) | 1 (Low) | 100 ms | 200 ms | Controls LEDs, buzzer, and I2C LCD based on the current system state. Priority is low because I2C communication is slow and shouldn't block sensor reads or processing. |
| **TaskEmergency** (Interrupt-Driven) | 4 (Critical)| Sporadic | < 10 ms | Waits on a binary semaphore given by the Emergency Button ISR. Preempts all other tasks to instantly transition the system to the EMERGENCY state. |

## Justification of Priorities
- **TaskEmergency (Priority 4):** Must be the highest priority to guarantee an immediate response to the physical emergency button, preempting any ongoing sensor reads or I2C communication.
- **TaskProcessing (Priority 3):** Must be higher than `TaskSensor` so that as soon as sensor data is placed in the queue, the processing task wakes up and consumes it, preventing the queue from filling up.
- **TaskSensor (Priority 2):** Needs to run periodically and strictly. Higher than Output so that slow I2C writes do not delay sensor sampling.
- **TaskOutput (Priority 1):** Lowest priority. Updating the LCD and LEDs is the slowest operation and the most tolerant to slight jitter. 
