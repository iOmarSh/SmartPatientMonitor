# Validation Test Cases

## 1. Automated Unit Tests (Unity Framework)

These tests are executed via `pio test` (Native/ESP32) and validate the core logic in `state_logic.h`.

| Test ID | Objective | Procedure | Expected Result | Result |
|---------|-----------|-----------|-----------------|--------|
| **UNIT-01** | Basic Danger State | Temp=38.5, Dist=45 | Returns `STATE_DANGER` | **PASS** |
| **UNIT-02** | Basic Warning State | Temp=36.5, Dist=25 | Returns `STATE_WARNING` | **PASS** |
| **UNIT-03** | Basic Normal State | Temp=36.5, Dist=45 | Returns `STATE_NORMAL` | **PASS** |
| **UNIT-04** | Temp Boundary Lower | Temp=37.9 | Returns `STATE_NORMAL` | **PASS** |
| **UNIT-05** | Temp Boundary Trigger | Temp=38.0 | Returns `STATE_DANGER` | **PASS** |
| **UNIT-06** | Dist Boundary Higher | Dist=30.1 | Returns `STATE_NORMAL` | **PASS** |
| **UNIT-07** | Dist Boundary Trigger | Dist=30.0 | Returns `STATE_WARNING` | **PASS** |
| **UNIT-08** | Invalid Dist Handling | Dist=-1.0 or 0.0 | Returns `STATE_NORMAL` | **PASS** |
| **UNIT-09** | Extreme Values | Temp=500.0 | Returns `STATE_DANGER` | **PASS** |
| **UNIT-10** | Emergency Precedence | Button=True + Danger Temp | Returns `STATE_EMERGENCY` | **PASS** |
| **UNIT-11** | Danger Precedence | Temp=38.0 + Dist=10.0 | Returns `STATE_DANGER` | **PASS** |

## 2. Integration & Hardware Tests

| Test ID | Objective | Procedure | Expected Result | Result |
|---------|-----------|-----------|-----------------|--------|
| **INT-01** | Fault Injection: Queue Timeout | Disable `TaskSensor`. Monitor `TaskProcessing`. | Processing uses last known state, prints timeout warning. | [PASS] |
| **INT-02** | Memory: Stack Watermark | Enable `uxTaskGetStackHighWaterMark` | All tasks report >500 bytes free space. | [PASS] |
| **INT-03** | Fault Injection: Sensor Disconnect | Unplug HC-SR04 Trigger/Echo. | Timeout triggers gracefully, LCD shows `D:Err`. | [PASS] |
| **INT-04** | Display Stability | Run system for 5 minutes continuously | LCD does not clear/flicker. Characters update flawlessly. | [PASS] |
| **INT-05** | Output Mapping | Inject DANGER state directly | Green LED OFF. Red LED SOLID. Buzzer SOLID. | [PASS] |
| **INT-06** | Timing Validation | Trigger `millis()` stamps on queue send/receive | Delta between reads proves ~200ms periodicity. | [PASS] |
| **INT-07** | Stress: Interrupt Bounce | Rapidly spam Button line with noisy jumper | ISR triggers ONCE per 250ms window. | [PASS] |
| **INT-08** | Emergency Preemption | Press Button during `TaskOutput` update | Hardware halts instantly, `TaskEmergency` runs. | [PASS] |
