#include <Arduino.h>
#include <unity.h>
#include "system_types.h"
#include "utils/state_logic.h"

// Mocked SystemStateToString for Unit Tests (since it's implemented in RTOS logic usually)
const char *SystemStateToString(SystemState state) {
    switch (state) {
        case STATE_NORMAL: return "NORMAL";
        case STATE_WARNING: return "WARNING";
        case STATE_DANGER: return "DANGER";
        case STATE_EMERGENCY: return "EMERGENCY";
        default: return "UNKNOWN";
    }
}

void setUp(void) {
    // set stuff up here
}

void tearDown(void) {
    // clean stuff up here
}

void test_logic_danger_state(void) {
    SensorData data = {38.5f, 300, 45.0f, false}; // Temp > 38, Safe Dist
    TEST_ASSERT_EQUAL(STATE_DANGER, determineSystemState(data));
}

void test_logic_warning_state(void) {
    SensorData data = {36.5f, 300, 25.0f, false}; // Temp Safe, Dist < 30
    TEST_ASSERT_EQUAL(STATE_WARNING, determineSystemState(data));
}

void test_logic_normal_state(void) {
    SensorData data = {36.5f, 300, 45.0f, false}; // All safe
    TEST_ASSERT_EQUAL(STATE_NORMAL, determineSystemState(data));
}

void test_logic_emergency_overrides_danger(void) {
    SensorData data = {39.0f, 300, 15.0f, true}; // Everything bad + button
    TEST_ASSERT_EQUAL(STATE_EMERGENCY, determineSystemState(data));
}

void setup() {
    delay(2000); // Allow hardware to settle
    UNITY_BEGIN();
    RUN_TEST(test_logic_danger_state);
    RUN_TEST(test_logic_warning_state);
    RUN_TEST(test_logic_normal_state);
    RUN_TEST(test_logic_emergency_overrides_danger);
    UNITY_END();
}

void loop() {
}
