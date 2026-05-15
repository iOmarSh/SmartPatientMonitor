# System Requirements Specification

## Functional Requirements (FR)

| ID | Description | Priority | Verification Method |
|----|-------------|----------|---------------------|
| FR-01 | **Sensor Timing:** The system shall sample all sensors (temperature, distance, light) continuously every 200 ms. | High | Timing Diagnostics / Unit Test |
| FR-02 | **Emergency Interrupt:** The emergency button shall trigger an ISR that preempts normal task execution and forces the system into EMERGENCY state immediately. | Critical | Fault Injection / Manual Test |
| FR-03 | **Debounce Logic:** The emergency button ISR shall enforce a 250ms software debounce window to prevent spurious repeated interrupts. | High | Timing Diagnostics / Oscilloscope |
| FR-04 | **Danger State Trigger:** The system shall enter DANGER state when body temperature exceeds or equals 38.0°C. | Critical | Unit Test |
| FR-05 | **Warning State Trigger:** The system shall enter WARNING state when an object is detected at a distance of 30.0 cm or closer. | High | Unit Test |
| FR-06 | **Normal State Recovery:** The system shall revert to NORMAL state when temperature is < 38.0°C and distance is > 30.0 cm. | High | Unit Test |
| FR-07 | **Distance Sanity:** The distance sensor shall clamp readings at 400.0 cm and retry on timeout to prevent spurious -1.0/Err values. | Medium | Fault Injection / Unit Test |
| FR-08 | **Output Alignment (LCD):** The system shall display Temperature, Distance, Light Level, and current State Code correctly on the I2C LCD. | Medium | Manual Test |
| FR-09 | **Output Alignment (LED/Buzzer):** LEDs and Buzzer shall map exclusively to active system states (e.g., solid Red + Buzzer for DANGER, strobing Red for EMERGENCY). | High | Manual Test / Unit Test |
| FR-10 | **Data Concurrency:** Sensor data sharing between `TaskSensor` and `TaskOutput` shall be protected by a designated mutex to ensure data integrity during reads. | Critical | Code Review / Race Demo |

## Non-Functional Requirements (NFR)

| ID | Description | Priority | Verification Method |
|----|-------------|----------|---------------------|
| NFR-01 | **Queue Stability:** Inter-task communication via queues shall not exceed a 500ms block timeout, logging securely if a delay occurs. | High | Stress Test |
| NFR-02 | **Execution Modularity:** The system shall isolate Input (Sensor), Processing, and Output logic into separate dedicated FreeRTOS tasks. | Critical | Code Review |
| NFR-03 | **Task Periodicity & Preemption:** Critical state outputs (Emergency) shall possess higher FreeRTOS priority than background state processing. | High | Priority Demo |
| NFR-04 | **Fault Tolerance:** If a sensor queue freezes, the processing task shall maintain the previous known safe state and report a timeout without crashing. | High | Fault Injection |
| NFR-05 | **Memory Footprint:** Each FreeRTOS task shall maintain a minimum of 500 bytes of free stack space (High Water Mark) during maximum operational load. | Medium | Stack Diagnostics |
