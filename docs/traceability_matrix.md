# Traceability Matrix

This matrix maps system requirements to specific software modules and their corresponding validation test cases.

| Requirement ID | Module / Component | Associated Test Case |
|----------------|--------------------|----------------------|
| **FR-01** (Sensor Timing) | `task_sensor.cpp` | TEST-11 (Timing Validate) |
| **FR-02** (Emergency Interrupt) | `rtos_sync.cpp`, `task_main.cpp` | TEST-14 (Emergency Preemption) |
| **FR-03** (Debounce Logic) | `rtos_sync.cpp` | TEST-12 (Interrupt Debounce) |
| **FR-04** (Danger State) | `logic_utils.cpp` | TEST-01, TEST-02 (Logic) |
| **FR-05** (Warning State) | `logic_utils.cpp` | TEST-03, TEST-04 (Logic) |
| **FR-06** (Normal State) | `logic_utils.cpp` | TEST-05 (Logic) |
| **FR-07** (Distance Sanity) | `hcsr04_sensor.cpp` | TEST-08 (Sensor Clamp) |
| **FR-08** (LCD Output) | `task_output.cpp`, `lcd_display.cpp` | TEST-09 (Display Layout) |
| **FR-09** (LED/Buzzer Output) | `task_output.cpp`, `indicators.cpp` | TEST-10 (Output Mux) |
| **FR-10** (Data Concurrency) | `rtos_sync.cpp` | TEST-15 (Mutex Data Lock) |
| **NFR-01** (Queue Stability) | `task_processing.cpp` | TEST-13 (Stress Flooding) |
| **NFR-02** (Modularity) | Overall Architecture | Code Review |
| **NFR-03** (Priority Preemption) | `main.cpp` | Ed-Demo: Priority |
| **NFR-04** (Fault Tolerance) | `task_processing.cpp` | TEST-06 (Queue Timeout) |
| **NFR-05** (Memory Footprint) | `main.cpp` | TEST-07 (Stack Watermark) |
