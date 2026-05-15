# Smart Patient Monitor - Automation & Testing System Guide

This document explains the implementation of the automated validation pipeline and the advanced testing features requested for the Smart Patient Monitor project.

---

## 1. Core Automation Flow
The project uses a Python-based framework to bridge the gap between the host PC and the ESP32 hardware.

### 1.1 Flash Firmware
*   **How:** Implemented in `scripts/hardware_integration_test.py` using the `flash_firmware()` method. It wraps `esptool.py` to target the ESP32's bootloader.
*   **Why:** Manual flashing is error-prone. Automation ensures that the exact build being tested is what is currently running on the hardware, providing a "clean slate" for every test run.

### 1.2 Open Serial Port
*   **How:** Uses the `pyserial` library in the `HardwareTestFramework` class. It establishes a 115200 baud connection to the ESP32.
*   **Why:** Serial is the primary diagnostic interface for embedded systems. Automating the connection allows for programmatic interaction without manual terminal monitoring.

### 1.3 Send Test Commands
*   **How:** The firmware includes a "Command Listener" in the Serial task. The Python script sends strings like `GetTemp`, `LED_RED_ON`, or `SET_STATE_EMERGENCY`.
*   **Why:** Real-world sensor triggers (like actual heat or distance) are hard to automate in a lab. Virtual "Command Injection" allows us to simulate hardware events and state changes instantly.

### 1.4 Collect Logs
*   **How:** `read_serial_output()` captures every line sent by the ESP32. These logs are formatted with timestamps: `[timestamp] [TaskName] Message`.
*   **Why:** Logs provide the "truth" of what happened inside the RTOS. By capturing them, we can perform post-mortem analysis on timing and task behavior.

### 1.5 Check Pass/Fail Conditions
*   **How:** Each Python test method (e.g., `test_sensor_readings`) performs string matching or value validation on the captured logs.
*   **Why:** Automating assertions removes human bias. The script knows exactly what a "Normal" temperature or a "Success" queue send looks like.

### 1.6 Generate Test Report
*   **How:** 
    *   **JSON:** `hardware_integration_test.py` saves a machine-readable summary.
    *   **HTML:** `scripts/html_report_generator.py` transforms JSON data into a professional dashboard with CSS styling.
*   **Why:** Stakeholders need visible proof of quality. A visual report makes it easy to identify which specific requirement failed at a glance.

---

## 2. Bonus Features Implementation

### 2.1 Automatic Queue Overflow Test
*   **How:** `test_stress_conditions()` in the integration script floods the system with rapid commands. The `timing_log_parser.py` then looks for `QUEUE_FULL` or `SEND_FAIL` entries.
*   **Why:** Queue overflows are a common cause of RTOS crashes. Testing this ensures the system handles "Data Storms" gracefully by dropping old data instead of freezing.

### 2.2 Automatic Timing Log Parser
*   **How:** `scripts/timing_log_parser.py` uses Regular Expressions (Regex) to extract millisecond timestamps from logs. It calculates:
    *   **Task Jitter:** Difference between intended and actual execution intervals.
    *   **Queue Latency:** Time between `SEND OK` and `RECV OK`.
*   **Why:** In an RTOS, *correctness* depends on *timing*. A functional system that is too slow is a failing system. This parser proves real-time constraints are met.

### 2.3 Automatic Requirement Coverage Table
*   **How:** Maintained in `REQUIREMENTS_COVERAGE.md`. It uses a Traceability Matrix that maps every ID (e.g., FR-01) to specific Unity test names or Python scripts.
*   **Why:** This provides "Evidence-Based Engineering." It proves that no requirement was forgotten and every line of code serves a purpose.

### 2.4 Automatic Fault Injection Command Script
*   **How:** 
    *   **Firmware side:** `diagnostics.cpp` contains `injectCpuLoad()` which physically hogs the CPU core to simulate a "hung" task.
    *   **Script side:** `hardware_integration_test.py` triggers these faults to see if the high-priority Emergency task can still preempt the blocked low-priority tasks.
*   **Why:** It tests the "Safety" of the system. We must prove that even if one task fails or misbehaves, the critical safety features (Emergency Button) remain functional.

### 2.5 CI Build + Unit Tests
*   **How:** 
    *   **Unit Tests:** 100+ tests in `test/` using Unity.
    *   **CI/CD:** `.github/workflows/ci-cd.yml` triggers on every `git push`. It builds the code, runs tests in a virtual Linux environment, and blocks the merge if anything fails.
*   **Why:** This prevents "Regression." It ensures that a fix for one bug doesn't accidentally break a feature that was working yesterday.

---

## 3. Master Orchestration (`run_full_validation.py`)
I added a final "Master" script that glues everything together. Running this one script executes the entire lifecycle:
1.  **Test (Native)** -> 2. **Build (Firmware)** -> 3. **Flash** -> 4. **Integration Test** -> 5. **Parse Logs** -> 6. **Generate Final HTML**.

**Engineering Goal:** "One-Click Compliance."
