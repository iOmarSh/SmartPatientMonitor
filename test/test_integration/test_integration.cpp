#include <unity.h>

#ifdef ARDUINO
#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/queue.h"
#include "freertos/semphr.h"
#endif

// Mock data structures matching system_types.h
typedef struct {
    float temperature;
    int lightLevel;
    float distance;
    bool emergencyPressed;
} MockSensorData;

typedef enum {
    STATE_NORMAL,
    STATE_WARNING,
    STATE_DANGER,
    STATE_EMERGENCY
} MockSystemState;

// ===== QUEUE SIMULATION TESTS =====

class MockQueue {
public:
    static const int MAX_ITEMS = 10;
    MockSensorData items[MAX_ITEMS];
    int head = 0;
    int tail = 0;
    int count = 0;

    bool send(MockSensorData data) {
        if (count >= MAX_ITEMS) {
            return false;  // Queue full
        }
        items[tail] = data;
        tail = (tail + 1) % MAX_ITEMS;
        count++;
        return true;
    }

    bool receive(MockSensorData &data) {
        if (count == 0) {
            return false;  // Queue empty
        }
        data = items[head];
        head = (head + 1) % MAX_ITEMS;
        count--;
        return true;
    }

    int getCount() {
        return count;
    }

    bool isEmpty() {
        return count == 0;
    }

    bool isFull() {
        return count >= MAX_ITEMS;
    }

    void clear() {
        head = 0;
        tail = 0;
        count = 0;
    }
};

// ===== SEMAPHORE SIMULATION TESTS =====

class MockSemaphore {
public:
    bool signaled = false;

    void give() {
        signaled = true;
    }

    bool take(int timeoutMs = 0) {
        if (signaled) {
            signaled = false;
            return true;
        }
        return false;
    }

    bool isSignaled() {
        return signaled;
    }
};

// ===== MUTEX SIMULATION TESTS =====

class MockMutex {
public:
    bool locked = false;
    int lockCount = 0;

    bool take(int timeoutMs = 0) {
        if (!locked) {
            locked = true;
            lockCount++;
            return true;
        }
        return false;
    }

    void give() {
        if (locked) {
            locked = false;
        }
    }

    bool isLocked() {
        return locked;
    }

    int getLockCount() {
        return lockCount;
    }
};

// ===== TASK SIMULATION TESTS =====

class MockTask {
public:
    const char *taskName;
    int priority = 0;
    int stackDepth = 0;
    bool isRunning = false;
    int executionCount = 0;
    unsigned long lastExecutionTime = 0;

    MockTask(const char *name, int pri, int stack) : taskName(name), priority(pri), stackDepth(stack) {
    }

    void start() {
        isRunning = true;
    }

    void stop() {
        isRunning = false;
    }

    void execute() {
        if (isRunning) {
            executionCount++;
            lastExecutionTime = millis();
        }
    }

    bool isRunningCheck() {
        return isRunning;
    }

    int getExecutionCount() {
        return executionCount;
    }
};

// Global mock objects
MockQueue mockSensorQueue;
MockQueue mockStateQueue;
MockSemaphore mockEmergencySemaphore;
MockMutex mockSensorDataMutex;
MockMutex mockSerialMutex;
MockTask sensorTask("SensorTask", 2, 2048);
MockTask processingTask("ProcessingTask", 3, 2048);
MockTask outputTask("OutputTask", 1, 4096);
MockTask emergencyTask("EmergencyTask", 4, 2048);

void setUp(void) {
    mockSensorQueue.clear();
    mockStateQueue.clear();
    mockEmergencySemaphore.signaled = false;
    mockSensorDataMutex.locked = false;
    mockSerialMutex.locked = false;
    sensorTask = MockTask("SensorTask", 2, 2048);
    processingTask = MockTask("ProcessingTask", 3, 2048);
    outputTask = MockTask("OutputTask", 1, 4096);
    emergencyTask = MockTask("EmergencyTask", 4, 2048);
}

void tearDown(void) {
}

// ===== QUEUE TESTS =====

void test_queue_creation(void) {
    TEST_ASSERT_TRUE(mockSensorQueue.isEmpty());
    TEST_ASSERT_EQUAL_INT(0, mockSensorQueue.getCount());
}

void test_queue_send_single_item(void) {
    MockSensorData data = {36.5f, 300, 45.0f, false};
    bool result = mockSensorQueue.send(data);
    TEST_ASSERT_TRUE(result);
    TEST_ASSERT_EQUAL_INT(1, mockSensorQueue.getCount());
}

void test_queue_send_multiple_items(void) {
    MockSensorData data1 = {36.5f, 300, 45.0f, false};
    MockSensorData data2 = {37.0f, 350, 50.0f, false};
    MockSensorData data3 = {37.5f, 280, 40.0f, false};

    mockSensorQueue.send(data1);
    mockSensorQueue.send(data2);
    mockSensorQueue.send(data3);

    TEST_ASSERT_EQUAL_INT(3, mockSensorQueue.getCount());
}

void test_queue_receive_single_item(void) {
    MockSensorData data = {36.5f, 300, 45.0f, false};
    mockSensorQueue.send(data);

    MockSensorData received;
    bool result = mockSensorQueue.receive(received);

    TEST_ASSERT_TRUE(result);
    TEST_ASSERT_EQUAL_FLOAT(36.5f, received.temperature);
    TEST_ASSERT_EQUAL_INT(300, received.lightLevel);
}

void test_queue_fifo_order(void) {
    MockSensorData data1 = {36.5f, 300, 45.0f, false};
    MockSensorData data2 = {37.5f, 350, 50.0f, false};

    mockSensorQueue.send(data1);
    mockSensorQueue.send(data2);

    MockSensorData received1, received2;
    mockSensorQueue.receive(received1);
    mockSensorQueue.receive(received2);

    TEST_ASSERT_EQUAL_FLOAT(36.5f, received1.temperature);
    TEST_ASSERT_EQUAL_FLOAT(37.5f, received2.temperature);
}

void test_queue_empty_receive_fails(void) {
    MockSensorData data;
    bool result = mockSensorQueue.receive(data);
    TEST_ASSERT_FALSE(result);
}

void test_queue_full_send_fails(void) {
    // Fill queue to capacity
    for (int i = 0; i < MockQueue::MAX_ITEMS; i++) {
        MockSensorData data = {36.5f + i, 300, 45.0f, false};
        bool result = mockSensorQueue.send(data);
        TEST_ASSERT_TRUE(result);
    }

    // Try to send one more
    MockSensorData overfull = {39.0f, 300, 45.0f, false};
    bool result = mockSensorQueue.send(overfull);
    TEST_ASSERT_FALSE(result);
}

void test_queue_overwrite(void) {
    MockSensorData data1 = {36.5f, 300, 45.0f, false};
    MockSensorData data2 = {37.5f, 350, 50.0f, false};

    mockStateQueue.send(data1);
    mockStateQueue.send(data2);
    mockStateQueue.receive(data1);
    mockStateQueue.receive(data2);

    TEST_ASSERT_EQUAL_FLOAT(37.5f, data2.temperature);
}

// ===== SEMAPHORE TESTS =====

void test_semaphore_creation(void) {
    TEST_ASSERT_FALSE(mockEmergencySemaphore.isSignaled());
}

void test_semaphore_give(void) {
    mockEmergencySemaphore.give();
    TEST_ASSERT_TRUE(mockEmergencySemaphore.isSignaled());
}

void test_semaphore_take(void) {
    mockEmergencySemaphore.give();
    bool result = mockEmergencySemaphore.take();
    TEST_ASSERT_TRUE(result);
    TEST_ASSERT_FALSE(mockEmergencySemaphore.isSignaled());
}

void test_semaphore_take_when_not_signaled(void) {
    bool result = mockEmergencySemaphore.take();
    TEST_ASSERT_FALSE(result);
}

void test_semaphore_multiple_signals(void) {
    mockEmergencySemaphore.give();
    mockEmergencySemaphore.take();
    mockEmergencySemaphore.give();

    bool result = mockEmergencySemaphore.take();
    TEST_ASSERT_TRUE(result);
}

// ===== MUTEX TESTS =====

void test_mutex_creation(void) {
    TEST_ASSERT_FALSE(mockSensorDataMutex.isLocked());
}

void test_mutex_take_locks(void) {
    bool result = mockSensorDataMutex.take();
    TEST_ASSERT_TRUE(result);
    TEST_ASSERT_TRUE(mockSensorDataMutex.isLocked());
}

void test_mutex_give_unlocks(void) {
    mockSensorDataMutex.take();
    mockSensorDataMutex.give();
    TEST_ASSERT_FALSE(mockSensorDataMutex.isLocked());
}

void test_mutex_take_when_locked_fails(void) {
    mockSensorDataMutex.take();
    bool result = mockSensorDataMutex.take();
    TEST_ASSERT_FALSE(result);
}

void test_mutex_lock_count(void) {
    mockSensorDataMutex.take();
    mockSensorDataMutex.give();
    mockSensorDataMutex.take();
    mockSensorDataMutex.give();

    TEST_ASSERT_EQUAL_INT(2, mockSensorDataMutex.getLockCount());
}

// ===== TASK TESTS =====

void test_task_creation(void) {
    TEST_ASSERT_FALSE(sensorTask.isRunningCheck());
    TEST_ASSERT_EQUAL_INT(0, sensorTask.getExecutionCount());
}

void test_task_start(void) {
    sensorTask.start();
    TEST_ASSERT_TRUE(sensorTask.isRunningCheck());
}

void test_task_stop(void) {
    sensorTask.start();
    sensorTask.stop();
    TEST_ASSERT_FALSE(sensorTask.isRunningCheck());
}

void test_task_execution_count(void) {
    sensorTask.start();
    sensorTask.execute();
    sensorTask.execute();
    sensorTask.execute();

    TEST_ASSERT_EQUAL_INT(3, sensorTask.getExecutionCount());
}

void test_task_execution_when_stopped(void) {
    sensorTask.stop();
    sensorTask.execute();
    sensorTask.execute();

    TEST_ASSERT_EQUAL_INT(0, sensorTask.getExecutionCount());
}

void test_task_priority_levels(void) {
    TEST_ASSERT_EQUAL_INT(2, sensorTask.priority);
    TEST_ASSERT_EQUAL_INT(3, processingTask.priority);
    TEST_ASSERT_EQUAL_INT(1, outputTask.priority);
    TEST_ASSERT_EQUAL_INT(4, emergencyTask.priority);
}

void test_task_stack_allocation(void) {
    TEST_ASSERT_EQUAL_INT(2048, sensorTask.stackDepth);
    TEST_ASSERT_EQUAL_INT(2048, processingTask.stackDepth);
    TEST_ASSERT_EQUAL_INT(4096, outputTask.stackDepth);
    TEST_ASSERT_EQUAL_INT(2048, emergencyTask.stackDepth);
}

// ===== INTEGRATION TESTS =====

void test_all_tasks_initialized(void) {
    TEST_ASSERT_FALSE(sensorTask.isRunningCheck());
    TEST_ASSERT_FALSE(processingTask.isRunningCheck());
    TEST_ASSERT_FALSE(outputTask.isRunningCheck());
    TEST_ASSERT_FALSE(emergencyTask.isRunningCheck());
}

void test_all_tasks_started(void) {
    sensorTask.start();
    processingTask.start();
    outputTask.start();
    emergencyTask.start();

    TEST_ASSERT_TRUE(sensorTask.isRunningCheck());
    TEST_ASSERT_TRUE(processingTask.isRunningCheck());
    TEST_ASSERT_TRUE(outputTask.isRunningCheck());
    TEST_ASSERT_TRUE(emergencyTask.isRunningCheck());
}

void test_sensor_data_flow_pipeline(void) {
    // Simulate sensor task sending data
    MockSensorData sensorData = {36.5f, 300, 45.0f, false};
    mockSensorQueue.send(sensorData);

    // Simulate processing task receiving data
    MockSensorData receivedData;
    mockSensorQueue.receive(receivedData);

    TEST_ASSERT_EQUAL_FLOAT(36.5f, receivedData.temperature);
    TEST_ASSERT_EQUAL_INT(300, receivedData.lightLevel);
    TEST_ASSERT_EQUAL_FLOAT(45.0f, receivedData.distance);
    TEST_ASSERT_FALSE(receivedData.emergencyPressed);
}

void test_emergency_signal_flow(void) {
    mockEmergencySemaphore.give();
    TEST_ASSERT_TRUE(mockEmergencySemaphore.take());
}

void test_mutex_protected_serial_access(void) {
    mockSerialMutex.take();
    TEST_ASSERT_TRUE(mockSerialMutex.isLocked());
    mockSerialMutex.give();
    TEST_ASSERT_FALSE(mockSerialMutex.isLocked());
}

void test_concurrent_queue_operations(void) {
    MockSensorData data1 = {36.5f, 300, 45.0f, false};
    MockSensorData data2 = {37.5f, 350, 50.0f, false};
    MockSensorData data3 = {38.5f, 280, 40.0f, false};

    mockSensorQueue.send(data1);
    mockSensorQueue.send(data2);
    mockSensorQueue.send(data3);

    TEST_ASSERT_EQUAL_INT(3, mockSensorQueue.getCount());

    MockSensorData received;
    mockSensorQueue.receive(received);

    TEST_ASSERT_EQUAL_INT(2, mockSensorQueue.getCount());
    TEST_ASSERT_EQUAL_FLOAT(36.5f, received.temperature);
}

void test_task_execution_sequence(void) {
    sensorTask.start();
    processingTask.start();
    outputTask.start();
    emergencyTask.start();

    sensorTask.execute();
    processingTask.execute();
    outputTask.execute();

    TEST_ASSERT_EQUAL_INT(1, sensorTask.getExecutionCount());
    TEST_ASSERT_EQUAL_INT(1, processingTask.getExecutionCount());
    TEST_ASSERT_EQUAL_INT(1, outputTask.getExecutionCount());
    TEST_ASSERT_EQUAL_INT(0, emergencyTask.getExecutionCount());
}

void test_emergency_task_high_priority(void) {
    // Emergency task should have highest priority (4)
    TEST_ASSERT_GREATER_THAN(sensorTask.priority, emergencyTask.priority);
    TEST_ASSERT_GREATER_THAN(processingTask.priority, emergencyTask.priority);
    TEST_ASSERT_GREATER_THAN(outputTask.priority, emergencyTask.priority);
}

void setUp_test_all_tasks_initialized(void) {
    setUp();
}

void tearDown_test_all_tasks_initialized(void) {
    tearDown();
}
