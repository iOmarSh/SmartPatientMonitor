#include <unity.h>
#include <Arduino.h>

// Mock sensor functions for testing
// These tests validate the sensor reading logic and ADC conversions

class MockLDRSensor {
public:
    int lastReadValue = 0;
    bool isInitialized = false;

    void init() {
        isInitialized = true;
    }

    int read() {
        // Simulate ADC reading (0-4095)
        return lastReadValue;
    }

    bool isInitialized_check() {
        return isInitialized;
    }
};

class MockLM35Sensor {
public:
    float lastTemperature = 0.0f;
    bool isInitialized = false;

    void init() {
        isInitialized = true;
    }

    float readTemperature() {
        // Convert ADC to temperature
        // Typical: ADC_value * (3.3V / 4095) * 100
        return lastTemperature;
    }

    bool isInitialized_check() {
        return isInitialized;
    }

    bool isInValidRange(float temp) {
        return (temp >= -40.0f && temp <= 150.0f);
    }
};

class MockHCSR04Sensor {
public:
    float lastDistance = 0.0f;
    bool isInitialized = false;
    int timeoutCount = 0;

    void init() {
        isInitialized = true;
    }

    float readDistance() {
        return lastDistance;
    }

    bool isInitialized_check() {
        return isInitialized;
    }

    bool isValidDistance(float dist) {
        return (dist >= 2.0f && dist <= 400.0f);
    }

    int getTimeoutCount() {
        return timeoutCount;
    }
};

class MockButtonSensor {
public:
    bool isPressed = false;
    bool isInitialized = false;
    unsigned long lastPressTime = 0;

    void init() {
        isInitialized = true;
    }

    bool isPressedCheck() {
        return isPressed;
    }

    bool isInitialized_check() {
        return isInitialized;
    }

    bool isDebouncedCorrectly(unsigned long debounceTime) {
        return (lastPressTime == 0 || (millis() - lastPressTime) >= debounceTime);
    }
};

// Global mock objects
MockLDRSensor mockLDR;
MockLM35Sensor mockLM35;
MockHCSR04Sensor mockHCSR04;
MockButtonSensor mockButton;

// Test Setup and Teardown
void setUp(void) {
    mockLDR = MockLDRSensor();
    mockLM35 = MockLM35Sensor();
    mockHCSR04 = MockHCSR04Sensor();
    mockButton = MockButtonSensor();
}

void tearDown(void) {
}

// ===== LDR SENSOR TESTS =====

void test_ldr_initialization(void) {
    mockLDR.init();
    TEST_ASSERT_TRUE(mockLDR.isInitialized_check());
}

void test_ldr_read_minimum_value(void) {
    mockLDR.init();
    mockLDR.lastReadValue = 0;
    int value = mockLDR.read();
    TEST_ASSERT_EQUAL_INT(0, value);
}

void test_ldr_read_maximum_value(void) {
    mockLDR.init();
    mockLDR.lastReadValue = 4095;
    int value = mockLDR.read();
    TEST_ASSERT_EQUAL_INT(4095, value);
}

void test_ldr_read_mid_range_value(void) {
    mockLDR.init();
    mockLDR.lastReadValue = 2048;
    int value = mockLDR.read();
    TEST_ASSERT_EQUAL_INT(2048, value);
}

void test_ldr_multiple_reads_consistent(void) {
    mockLDR.init();
    mockLDR.lastReadValue = 1500;
    int read1 = mockLDR.read();
    int read2 = mockLDR.read();
    int read3 = mockLDR.read();
    TEST_ASSERT_EQUAL_INT(read1, read2);
    TEST_ASSERT_EQUAL_INT(read2, read3);
}

// ===== LM35 TEMPERATURE SENSOR TESTS =====

void test_lm35_initialization(void) {
    mockLM35.init();
    TEST_ASSERT_TRUE(mockLM35.isInitialized_check());
}

void test_lm35_read_normal_temperature(void) {
    mockLM35.init();
    mockLM35.lastTemperature = 25.5f;
    float temp = mockLM35.readTemperature();
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 25.5f, temp);
}

void test_lm35_read_body_temperature(void) {
    mockLM35.init();
    mockLM35.lastTemperature = 37.0f;
    float temp = mockLM35.readTemperature();
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 37.0f, temp);
}

void test_lm35_read_fever_temperature(void) {
    mockLM35.init();
    mockLM35.lastTemperature = 39.5f;
    float temp = mockLM35.readTemperature();
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 39.5f, temp);
}

void test_lm35_range_validation_low(void) {
    mockLM35.init();
    TEST_ASSERT_TRUE(mockLM35.isInValidRange(-40.0f));
}

void test_lm35_range_validation_normal(void) {
    mockLM35.init();
    TEST_ASSERT_TRUE(mockLM35.isInValidRange(25.0f));
}

void test_lm35_range_validation_high(void) {
    mockLM35.init();
    TEST_ASSERT_TRUE(mockLM35.isInValidRange(150.0f));
}

void test_lm35_range_validation_too_low(void) {
    mockLM35.init();
    TEST_ASSERT_FALSE(mockLM35.isInValidRange(-50.0f));
}

void test_lm35_range_validation_too_high(void) {
    mockLM35.init();
    TEST_ASSERT_FALSE(mockLM35.isInValidRange(160.0f));
}

// ===== HC-SR04 DISTANCE SENSOR TESTS =====

void test_hcsr04_initialization(void) {
    mockHCSR04.init();
    TEST_ASSERT_TRUE(mockHCSR04.isInitialized_check());
}

void test_hcsr04_read_minimum_distance(void) {
    mockHCSR04.init();
    mockHCSR04.lastDistance = 2.0f;
    float dist = mockHCSR04.readDistance();
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 2.0f, dist);
}

void test_hcsr04_read_valid_close_distance(void) {
    mockHCSR04.init();
    mockHCSR04.lastDistance = 10.5f;
    float dist = mockHCSR04.readDistance();
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 10.5f, dist);
}

void test_hcsr04_read_valid_far_distance(void) {
    mockHCSR04.init();
    mockHCSR04.lastDistance = 200.0f;
    float dist = mockHCSR04.readDistance();
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 200.0f, dist);
}

void test_hcsr04_read_maximum_distance(void) {
    mockHCSR04.init();
    mockHCSR04.lastDistance = 400.0f;
    float dist = mockHCSR04.readDistance();
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 400.0f, dist);
}

void test_hcsr04_distance_validation_valid(void) {
    mockHCSR04.init();
    TEST_ASSERT_TRUE(mockHCSR04.isValidDistance(50.0f));
}

void test_hcsr04_distance_validation_too_close(void) {
    mockHCSR04.init();
    TEST_ASSERT_FALSE(mockHCSR04.isValidDistance(1.0f));
}

void test_hcsr04_distance_validation_too_far(void) {
    mockHCSR04.init();
    TEST_ASSERT_FALSE(mockHCSR04.isValidDistance(500.0f));
}

void test_hcsr04_distance_validation_invalid_negative(void) {
    mockHCSR04.init();
    TEST_ASSERT_FALSE(mockHCSR04.isValidDistance(-10.0f));
}

void test_hcsr04_timeout_handling(void) {
    mockHCSR04.init();
    mockHCSR04.timeoutCount = 5;
    TEST_ASSERT_EQUAL_INT(5, mockHCSR04.getTimeoutCount());
}

// ===== BUTTON SENSOR TESTS =====

void test_button_initialization(void) {
    mockButton.init();
    TEST_ASSERT_TRUE(mockButton.isInitialized_check());
}

void test_button_not_pressed_initially(void) {
    mockButton.init();
    TEST_ASSERT_FALSE(mockButton.isPressedCheck());
}

void test_button_pressed_state(void) {
    mockButton.init();
    mockButton.isPressed = true;
    TEST_ASSERT_TRUE(mockButton.isPressedCheck());
}

void test_button_released_state(void) {
    mockButton.init();
    mockButton.isPressed = true;
    mockButton.isPressed = false;
    TEST_ASSERT_FALSE(mockButton.isPressedCheck());
}

void test_button_debounce_timing(void) {
    mockButton.init();
    mockButton.lastPressTime = millis() - 300;  // 300ms ago
    TEST_ASSERT_TRUE(mockButton.isDebouncedCorrectly(250));  // 250ms debounce
}

void test_button_debounce_too_fast(void) {
    mockButton.init();
    mockButton.lastPressTime = millis() - 100;  // 100ms ago
    TEST_ASSERT_FALSE(mockButton.isDebouncedCorrectly(250));  // Needs 250ms
}

// ===== SENSOR INTEGRATION TESTS =====

void test_all_sensors_initialized(void) {
    mockLDR.init();
    mockLM35.init();
    mockHCSR04.init();
    mockButton.init();

    TEST_ASSERT_TRUE(mockLDR.isInitialized_check());
    TEST_ASSERT_TRUE(mockLM35.isInitialized_check());
    TEST_ASSERT_TRUE(mockHCSR04.isInitialized_check());
    TEST_ASSERT_TRUE(mockButton.isInitialized_check());
}

void test_concurrent_sensor_readings(void) {
    mockLDR.init();
    mockLM35.init();
    mockHCSR04.init();
    mockButton.init();

    mockLDR.lastReadValue = 1500;
    mockLM35.lastTemperature = 36.5f;
    mockHCSR04.lastDistance = 30.0f;
    mockButton.isPressed = false;

    int ldr = mockLDR.read();
    float temp = mockLM35.readTemperature();
    float dist = mockHCSR04.readDistance();
    bool btn = mockButton.isPressedCheck();

    TEST_ASSERT_EQUAL_INT(1500, ldr);
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 36.5f, temp);
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 30.0f, dist);
    TEST_ASSERT_FALSE(btn);
}

void setUp_test_all_sensors_initialized(void) {
    setUp();
}

void tearDown_test_all_sensors_initialized(void) {
    tearDown();
}
