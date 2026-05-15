# Final Presentation Outline: Smart Home Monitoring System

## Slide 1: Title Slide
* Project Name: Smart Home Monitoring System
* Subtitle: An RTOS-Based ESP32 Monitoring and Alert System
* Team Members, Course, Date

## Slide 2: Project Overview
* Objective: Real-time patient monitoring for temperature, proximity, and light.
* Core Platform: ESP32 running FreeRTOS with event-driven multitasking.
* Design Goals: Safety, deterministic behavior, and fault tolerance.

## Slide 3: Hardware Architecture
* Sensors: LM35 temperature sensor, HC-SR04 ultrasonic sensor, and LDR.
* Outputs: 16x2 I2C LCD, red/green LEDs, and buzzer alerts.
* User Input: Emergency interrupt button for immediate override.
* Reference: `docs/architecture_diagrams.md#3-hardware-architecture`

## Slide 4: RTOS Software Architecture
* Multitasking: Four dedicated tasks for `Sensor`, `Processing`, `Output`, and `Emergency` handling.
* Synchronization:
    * Queues for data flow between tasks.
    * Mutexes for LCD, Serial, and shared data protection.
    * Semaphores for ISR-to-task signaling.
* Reference: `docs/architecture_diagrams.md#1-rtos-task--communication-flow`

## Slide 5: System States & Logic
* States: NORMAL, WARNING, DANGER, and EMERGENCY.
* Priority Rule: Emergency overrides danger, warning, and normal.
* State inputs: temperature threshold, distance threshold, and emergency button.
* Reference: `docs/architecture_diagrams.md#2-system-state-machine`

## Slide 6: Automated Testing & Validation
* Framework: PlatformIO + Unity.
* Coverage: 
    * Boundary testing, such as 37.9 vs 38.0°C.
    * Edge-case handling, including invalid or missing sensor values.
    * Priority verification to confirm emergency always wins.
* Native Validation: Core logic is tested on the host for fast iteration.

## Slide 7: Fault Injection & Stress Testing
* Scenario 1: HC-SR04 disconnection to verify retries and fallback behavior.
* Scenario 2: Queue blocking to observe system resilience under backpressure.
* Scenario 3: CPU load injection to confirm RTOS scheduling stability.

## Slide 8: Timing Analysis
* Periodic behavior: sensor task runs at roughly a 200 ms sampling rate.
* ISR latency: emergency input should preempt normal task flow quickly.
* Traceability: requirements are mapped to tests and observed behavior.

## Slide 9: Conclusion & Summary
* The project evolved into a structured embedded RTOS application.
* The system is validated, resilient, and ready for demonstration.
* Key takeaway: concurrency, safety, and testing were designed in from the start.

## Slide 10: Q&A / Demo
* Live demo of state transitions and output updates.
* Emergency button interrupt demonstration.
* Optional: show fault handling or stress-test evidence if time allows.
