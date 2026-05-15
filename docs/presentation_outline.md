# Final Presentation Outline: Smart Patient Monitoring System

## Slide 1: Title Slide
* Project Name: Smart Patient Monitoring System
* Subtitle: A Professional RTOS-based Embedded Security Solution
* Team Members / Date

## Slide 2: Project Overview
* Objective: Real-time patient monitoring (Temp, Proximity, Light).
* Core Technology: ESP32 with FreeRTOS.
* Key Priorities: Safety, Determinism, and Fault Tolerance.

## Slide 3: Hardware Architecture
* Sensors: LM35 (Temp), HC-SR04 (Ultrasonic), LDR (Light).
* Outputs: 16x2 I2C LCD, Red/Green LEDs, Buzzer.
* Input: Emergency Interrupt Button.
* Reference: `docs/architecture_diagrams.md#3-hardware-architecture`

## Slide 4: RTOS Software Architecture
* Multitasking: 4 Dedicated Tasks (`Sensor`, `Processing`, `Output`, `Emergency`).
* Synchronization: 
    * Queues for data pipelining.
    * Mutexes for resource protection (LCD, Serial, Global Data).
    * Semaphores for ISR-to-Task signaling.
* Reference: `docs/architecture_diagrams.md#1-rtos-task--communication-flow`

## Slide 5: System States & Logic
* States: NORMAL, WARNING, DANGER, EMERGENCY.
* Priority Logic: Emergency > Danger > Warning > Normal.
* Reference: `docs/architecture_diagrams.md#2-system-state-machine`

## Slide 6: Automated Testing & Validation
* Framework: PlatformIO + Unity.
* Coverage: 
    * Boundary testing (e.g., 37.9 vs 38.0°C).
    * Edge case handling (Negative distances).
    * Priority verification.
* Native Testing: Logic validated on host machine for rapid iteration.

## Slide 7: Fault Injection & Stress Testing
* Scenario 1: HC-SR04 Disconnection (Retries & Error Handling).
* Scenario 2: Queue Blocking (Dropped data vs. System crash).
* Scenario 3: CPU Load Simulation (Ensuring RTOS scheduling stability).

## Slide 8: Timing Analysis
* Periodic Task Verification: ~200ms sampling rate.
* ISR Latency: Emergency preemption response.
* Traceability: Mapping requirements to test results.

## Slide 9: Conclusion & Summary
* Successfully transformed an "Arduino project" into a professional Embedded System.
* Robust, validated, and ready for deployment.

## Slide 10: Q&A / Demo
* Real-time demonstration of state transitions.
* Emergency button interrupt demo.
