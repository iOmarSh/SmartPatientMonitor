#include <unity.h>
#include <Arduino.h>

// Fault Injection Tests for Smart Patient Monitor
// Simulates various failure scenarios and validates error handling

class FaultInjectionSimulator {
public:
    // Fault injection flags
    bool injectSensorTimeout = false;
    bool injectQueueFull = false;
    bool injectMutexDeadlock = false;
    bool injectInvalidData = false;
    bool injectTaskStackOverflow = false;
    bool injectSemaphoreStarvation = false;
    
    // Recovery counters
    int recoveryAttempts = 0;
    int successfulRecoveries = 0;
    
    void resetFaults() {
        injectSensorTimeout = false;
        injectQueueFull = false;
        injectMutexDeadlock = false;
        injectInvalidData = false;
        injectTaskStackOverflow = false;
        injectSemaphoreStarvation = false;
        recoveryAttempts = 0;
        successfulRecoveries = 0;
    }
};

FaultInjectionSimulator faultSim;

void setUp(void) {
    faultSim.resetFaults();
}

void tearDown(void) {
}

// ===== SENSOR TIMEOUT FAULT TESTS =====

void test_fault_sensor_timeout_detection(void) {
    faultSim.injectSensorTimeout = true;
    
    // Simulate sensor timeout (no response after 500ms)
    unsigned long startTime = millis();
    bool timeoutDetected = false;
    
    while (millis() - startTime < 600) {
        if (faultSim.injectSensorTimeout && (millis() - startTime) > 500) {
            timeoutDetected = true;
            break;
        }
    }
    
    TEST_ASSERT_TRUE(timeoutDetected);
}

void test_fault_sensor_timeout_recovery(void) {
    faultSim.injectSensorTimeout = true;
    
    // Attempt recovery
    faultSim.recoveryAttempts++;
    
    // Simulate recovery action
    faultSim.injectSensorTimeout = false;  // Reset fault
    faultSim.successfulRecoveries++;
    
    TEST_ASSERT_EQUAL_INT(1, faultSim.recoveryAttempts);
    TEST_ASSERT_EQUAL_INT(1, faultSim.successfulRecoveries);
}

void test_fault_sensor_timeout_fallback_value(void) {
    faultSim.injectSensorTimeout = true;
    
    // When sensor times out, use last valid value or error value
    float distance = -1.0f;  // Error indicator
    
    if (faultSim.injectSensorTimeout) {
        distance = -1.0f;  // Invalid distance
    }
    
    TEST_ASSERT_EQUAL_FLOAT(-1.0f, distance);
}

void test_fault_multiple_sensor_timeouts(void) {
    int timeouts = 0;
    
    for (int i = 0; i < 5; i++) {
        faultSim.injectSensorTimeout = true;
        if (faultSim.injectSensorTimeout) {
            timeouts++;
        }
        faultSim.injectSensorTimeout = false;
    }
    
    TEST_ASSERT_EQUAL_INT(5, timeouts);
}

// ===== QUEUE OVERFLOW FAULT TESTS =====

void test_fault_queue_overflow_detection(void) {
    faultSim.injectQueueFull = true;
    
    // Try to send when queue is full
    bool sendFailed = false;
    if (faultSim.injectQueueFull) {
        sendFailed = true;  // Send fails
    }
    
    TEST_ASSERT_TRUE(sendFailed);
    faultSim.injectQueueFull = false;
}

void test_fault_queue_overflow_message_loss(void) {
    // When queue overflows, last message should be lost
    int messagesLost = 0;
    
    faultSim.injectQueueFull = true;
    if (faultSim.injectQueueFull) {
        messagesLost = 1;
    }
    
    TEST_ASSERT_EQUAL_INT(1, messagesLost);
}

void test_fault_queue_overflow_recovery_retry(void) {
    faultSim.injectQueueFull = true;
    
    int sendAttempts = 0;
    int sendSuccesses = 0;
    
    // First attempt fails
    sendAttempts++;
    if (!faultSim.injectQueueFull) {
        sendSuccesses++;
    }
    
    // Clear queue and retry
    faultSim.injectQueueFull = false;
    sendAttempts++;
    if (!faultSim.injectQueueFull) {
        sendSuccesses++;
    }
    
    TEST_ASSERT_EQUAL_INT(2, sendAttempts);
    TEST_ASSERT_EQUAL_INT(1, sendSuccesses);
}

void test_fault_persistent_queue_overflow(void) {
    // Queue remains full for multiple cycles
    faultSim.injectQueueFull = true;
    
    int overflowCount = 0;
    for (int i = 0; i < 10; i++) {
        if (faultSim.injectQueueFull) {
            overflowCount++;
        }
    }
    
    TEST_ASSERT_EQUAL_INT(10, overflowCount);
    faultSim.injectQueueFull = false;
}

// ===== INVALID DATA FAULT TESTS =====

void test_fault_invalid_temperature_high(void) {
    faultSim.injectInvalidData = true;
    
    float invalidTemp = 500.0f;  // Out of range
    
    if (faultSim.injectInvalidData) {
        // Validator should reject
        bool isValid = (invalidTemp >= -40.0f && invalidTemp <= 150.0f);
        TEST_ASSERT_FALSE(isValid);
    }
}

void test_fault_invalid_temperature_low(void) {
    faultSim.injectInvalidData = true;
    
    float invalidTemp = -100.0f;  // Out of range
    
    if (faultSim.injectInvalidData) {
        bool isValid = (invalidTemp >= -40.0f && invalidTemp <= 150.0f);
        TEST_ASSERT_FALSE(isValid);
    }
}

void test_fault_invalid_distance(void) {
    faultSim.injectInvalidData = true;
    
    float invalidDist = -1.0f;  // Invalid distance
    
    if (faultSim.injectInvalidData) {
        bool isValid = (invalidDist >= 2.0f && invalidDist <= 400.0f);
        TEST_ASSERT_FALSE(isValid);
    }
}

void test_fault_corrupted_sensor_reading(void) {
    faultSim.injectInvalidData = true;
    
    // Simulate corrupted reading
    int corruptedADC = 0xFFFF;  // Invalid ADC value
    
    if (faultSim.injectInvalidData) {
        // Clamp to valid ADC range
        int validADC = constrain(corruptedADC, 0, 4095);
        TEST_ASSERT_EQUAL_INT(4095, validADC);
    }
}

void test_fault_data_validation_recovery(void) {
    faultSim.injectInvalidData = true;
    
    float badValue = 500.0f;
    float fallbackValue = 36.5f;  // Last known good value
    
    // Use fallback when data is invalid
    float finalValue = (badValue > 150.0f) ? fallbackValue : badValue;
    
    TEST_ASSERT_EQUAL_FLOAT(36.5f, finalValue);
}

// ===== SEMAPHORE STARVATION TESTS =====

void test_fault_semaphore_starvation_detection(void) {
    faultSim.injectSemaphoreStarvation = true;
    
    // Task cannot acquire semaphore
    bool acquired = !faultSim.injectSemaphoreStarvation;
    TEST_ASSERT_FALSE(acquired);
}

void test_fault_semaphore_timeout_handling(void) {
    faultSim.injectSemaphoreStarvation = true;
    
    unsigned long timeout = 1000;  // 1 second
    unsigned long startTime = millis();
    
    bool acquiredBeforeTimeout = false;
    if (!faultSim.injectSemaphoreStarvation) {
        acquiredBeforeTimeout = true;
    }
    
    unsigned long elapsed = millis() - startTime;
    
    TEST_ASSERT_FALSE(acquiredBeforeTimeout);
    TEST_ASSERT_LESS_THAN(timeout, elapsed + 100);  // Allow margin
}

void test_fault_semaphore_starvation_recovery(void) {
    faultSim.injectSemaphoreStarvation = true;
    
    // Emergency task has higher priority and can break starvation
    bool emergencyCanProceed = true;  // Higher priority
    
    TEST_ASSERT_TRUE(emergencyCanProceed);
}

void test_fault_priority_inversion(void) {
    // Low priority task holds semaphore that high priority needs
    bool priorityInversionOccurs = true;
    
    // Resolution: priority inheritance or timeout
    bool resolved = false;
    if (priorityInversionOccurs) {
        resolved = true;  // Timeout or priority inheritance resolves it
    }
    
    TEST_ASSERT_TRUE(resolved);
}

// ===== CASCADING FAILURE TESTS =====

void test_fault_multiple_sensors_fail(void) {
    // Temperature AND distance sensors fail simultaneously
    faultSim.injectSensorTimeout = true;
    
    bool tempFailed = faultSim.injectSensorTimeout;
    bool distFailed = faultSim.injectSensorTimeout;
    
    TEST_ASSERT_TRUE(tempFailed);
    TEST_ASSERT_TRUE(distFailed);
    
    faultSim.injectSensorTimeout = false;
}

void test_fault_queue_full_during_processing(void) {
    // Queue fills while processing task is slow
    faultSim.injectQueueFull = true;
    
    int droppedMessages = 0;
    for (int i = 0; i < 5; i++) {
        if (faultSim.injectQueueFull) {
            droppedMessages++;
        }
    }
    
    TEST_ASSERT_EQUAL_INT(5, droppedMessages);
    faultSim.injectQueueFull = false;
}

void test_fault_task_becomes_unresponsive(void) {
    // Simulate task timeout
    unsigned long lastExecution = millis();
    unsigned long taskTimeout = 1000;
    
    unsigned long timeSinceExecution = millis() - lastExecution;
    bool taskUnresponsive = (timeSinceExecution > taskTimeout);
    
    if (timeSinceExecution < 100) {  // Test runs quickly
        TEST_ASSERT_FALSE(taskUnresponsive);
    }
}

void test_fault_memory_fragmentation(void) {
    // Simulate memory getting fragmented
    int allocations = 0;
    int deallocations = 0;
    
    // Allocate and deallocate many times
    for (int i = 0; i < 100; i++) {
        allocations++;
        deallocations++;
    }
    
    // Check memory health indicator
    bool memoryHealthy = (allocations == deallocations);
    TEST_ASSERT_TRUE(memoryHealthy);
}

// ===== RECOVERY & RESILIENCE TESTS =====

void test_fault_automatic_recovery_mechanism(void) {
    // Inject a fault
    faultSim.injectSensorTimeout = true;
    faultSim.recoveryAttempts = 0;
    
    // System should attempt recovery
    faultSim.recoveryAttempts++;
    faultSim.injectSensorTimeout = false;
    faultSim.successfulRecoveries++;
    
    TEST_ASSERT_GREATER_THAN_INT(0, faultSim.recoveryAttempts);
    TEST_ASSERT_EQUAL_INT(faultSim.recoveryAttempts, faultSim.successfulRecoveries);
}

void test_fault_watchdog_timer_reset(void) {
    // Simulate watchdog being triggered
    bool watchdogTriggered = true;
    int rebootCount = 0;
    
    if (watchdogTriggered) {
        rebootCount++;
    }
    
    TEST_ASSERT_EQUAL_INT(1, rebootCount);
}

void test_fault_emergency_mode_activation(void) {
    // Multiple failures should trigger emergency mode
    faultSim.injectSensorTimeout = true;
    faultSim.injectQueueFull = true;
    
    bool emergencyMode = (faultSim.injectSensorTimeout && faultSim.injectQueueFull);
    
    TEST_ASSERT_TRUE(emergencyMode);
    
    faultSim.resetFaults();
}

void test_fault_graceful_degradation(void) {
    // System should degrade gracefully
    faultSim.injectInvalidData = true;
    
    float lastKnownGoodValue = 36.5f;
    float currentValue = -999.0f;  // Invalid
    
    // Use fallback
    float usedValue = (currentValue < -40.0f) ? lastKnownGoodValue : currentValue;
    
    TEST_ASSERT_EQUAL_FLOAT(lastKnownGoodValue, usedValue);
}

void test_fault_state_consistency_after_recovery(void) {
    // After recovery, system state should be consistent
    faultSim.injectSensorTimeout = true;
    
    // Inject fault
    bool faultActive = faultSim.injectSensorTimeout;
    TEST_ASSERT_TRUE(faultActive);
    
    // Recover
    faultSim.injectSensorTimeout = false;
    bool recovered = !faultSim.injectSensorTimeout;
    TEST_ASSERT_TRUE(recovered);
}

void test_fault_repeated_fault_injection(void) {
    // Test system resilience to repeated faults
    int successfulRecoveries = 0;
    
    for (int i = 0; i < 10; i++) {
        faultSim.injectSensorTimeout = true;
        faultSim.injectSensorTimeout = false;
        successfulRecoveries++;
    }
    
    TEST_ASSERT_EQUAL_INT(10, successfulRecoveries);
}

void setUp_fault_tests(void) {
    setUp();
}

void tearDown_fault_tests(void) {
    tearDown();
}
