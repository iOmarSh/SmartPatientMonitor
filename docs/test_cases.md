# Validation Test Cases

| Test ID | Objective | Procedure | Expected Result | Result |
|---------|-----------|-----------|-----------------|--------|
| **TEST-01** | Verify Danger State trigger | Provide 38.5°C to `determineSystemState` | Returns `STATE_DANGER` | [WAITING] |
| **TEST-02** | Verify Danger ignores distance | Provide 38.1°C and 50cm to logic | Returns `STATE_DANGER` | [WAITING] |
| **TEST-03** | Verify Warning State trigger | Provide 37°C and 25cm to logic | Returns `STATE_WARNING` | [WAITING] |
| **TEST-04** | Verify Warning boundaries | Provide 37°C and 30.0cm to logic | Returns `STATE_WARNING` | [WAITING] |
| **TEST-05** | Verify Normal state fallback | Provide 36.5°C and 45.0cm to logic | Returns `STATE_NORMAL` | [WAITING] |
| **TEST-06** | Fault Injection: Queue Timeout | Disable `TaskSensor`. Monitor `TaskProcessing`. | Processing uses last known state, prints timeout warning, does not crash. | [WAITING] |
| **TEST-07** | Memory: Stack Watermark | Enable `uxTaskGetStackHighWaterMark` | All tasks report >500 bytes free space constantly. | [WAITING] |
| **TEST-08** | Fault Injection: Sensor Disconnect | Unplug HC-SR04 Trigger/Echo. | Timeout triggers gracefully, LCD shows `D:Err` or recovers previous value without freezing RTOS. | [WAITING] |
| **TEST-09** | Display Stability | Run system for 5 minutes continuously | LCD does not clear/flicker. Characters update flawlessly in place. | [WAITING] |
| **TEST-10** | Output Mapping | Inject DANGER state directly | Green LED OFF. Red LED SOLID. Buzzer SOLID. | [WAITING] |
| **TEST-11** | Timing Validation | Trigger `millis()` stamps on queue send/receive | Delta between reads proves ~200ms periodicity (FR-01). | [WAITING] |
| **TEST-12** | Stress: Interrupt Bounce | Rapidly spam Button line with noisy jumper | ISR triggers ONCE per 250ms window. Subsequent noisy bounces ignored. | [WAITING] |
| **TEST-13** | Stress: CPU Load | Create dummy loop in processing task taking 100ms | Queues absorb jitter gracefully, system maintains state flow. | [WAITING] |
| **TEST-14** | Emergency Preemption | Press Button during `TaskOutput` drawing sequence | Hardware halts formatting instantly, `TaskEmergency` runs, Siren sounds. | [WAITING] |
| **TEST-15** | Data Consistency | Verify Display values match processing state | Mutex locking ensures LCD never displays part of an old struct combined with a new struct. | [WAITING] |
