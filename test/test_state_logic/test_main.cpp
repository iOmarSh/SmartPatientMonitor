#include <unity.h>
#include "system_types.h"
#include "utils/state_logic.h"

#ifdef ARDUINO
#include <Arduino.h>
#endif

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

// --- Basic State Tests ---

void test_logic_danger_state(void) {
    SensorData data = {38.5f, 300, 45.0f, false}; 
    TEST_ASSERT_EQUAL(STATE_DANGER, determineSystemState(data));
}

void test_logic_warning_state(void) {
    SensorData data = {36.5f, 300, 25.0f, false}; 
    TEST_ASSERT_EQUAL(STATE_WARNING, determineSystemState(data));
}

void test_logic_normal_state(void) {
    SensorData data = {36.5f, 300, 45.0f, false}; 
    TEST_ASSERT_EQUAL(STATE_NORMAL, determineSystemState(data));
}

// --- Boundary Testing ---

void test_logic_boundary_temperature(void) {
    SensorData data = {37.9f, 300, 45.0f, false};
    TEST_ASSERT_EQUAL_MESSAGE(STATE_NORMAL, determineSystemState(data), "37.9C should be NORMAL");
    
    data.temperature = 38.0f;
    TEST_ASSERT_EQUAL_MESSAGE(STATE_DANGER, determineSystemState(data), "38.0C should be DANGER");
}

void test_logic_boundary_distance(void) {
    SensorData data = {36.5f, 300, 30.1f, false};
    TEST_ASSERT_EQUAL_MESSAGE(STATE_NORMAL, determineSystemState(data), "30.1cm should be NORMAL");
    
    data.distance = 30.0f;
    TEST_ASSERT_EQUAL_MESSAGE(STATE_WARNING, determineSystemState(data), "30.0cm should be WARNING");
}

// --- Invalid / Edge Case Input Testing ---

void test_logic_invalid_distance(void) {
    // Distance 0 or negative should be treated as Normal (or at least not Warning) 
    // because it usually indicates a sensor error or out-of-range.
    SensorData data = {36.5f, 300, -1.0f, false};
    TEST_ASSERT_EQUAL_MESSAGE(STATE_NORMAL, determineSystemState(data), "Negative distance should be NORMAL (Error/Ignore)");

    data.distance = 0.0f;
    TEST_ASSERT_EQUAL_MESSAGE(STATE_NORMAL, determineSystemState(data), "Zero distance should be NORMAL (Error/Ignore)");
}

void test_logic_extreme_values(void) {
    SensorData data = {500.0f, 1023, 1000.0f, false}; // Extreme heat
    TEST_ASSERT_EQUAL(STATE_DANGER, determineSystemState(data));

    data = {-50.0f, 0, 0.1f, false}; // Extreme cold
    TEST_ASSERT_EQUAL(STATE_WARNING, determineSystemState(data)); // Dist 0.1 is still warning
}

// --- Priority / Precedence Testing ---

void test_logic_emergency_precedence(void) {
    // Emergency button should override EVERYTHING, even DANGER temperature
    SensorData data = {45.0f, 1023, 2.0f, true}; 
    TEST_ASSERT_EQUAL_MESSAGE(STATE_EMERGENCY, determineSystemState(data), "Emergency button must override all other states");
}

void test_logic_danger_overrides_warning(void) {
    // Danger (Temperature) should have higher priority than Warning (Distance)
    SensorData data = {38.0f, 300, 10.0f, false}; 
    TEST_ASSERT_EQUAL_MESSAGE(STATE_DANGER, determineSystemState(data), "Danger temperature should override warning distance");
}

int run_all_tests() {
    UNITY_BEGIN();
    
    // Original Tests
    RUN_TEST(test_logic_danger_state);
    RUN_TEST(test_logic_warning_state);
    RUN_TEST(test_logic_normal_state);
    
    // Boundary Tests
    RUN_TEST(test_logic_boundary_temperature);
    RUN_TEST(test_logic_boundary_distance);
    
    // Edge/Invalid Case Tests
    RUN_TEST(test_logic_invalid_distance);
    RUN_TEST(test_logic_extreme_values);
    
    // Priority Tests
    RUN_TEST(test_logic_emergency_precedence);
    RUN_TEST(test_logic_danger_overrides_warning);
    
    return UNITY_END();
}

#ifdef ARDUINO
void setup() {
    delay(2000); 
    run_all_tests();
}

void loop() {}
#else
int main(int argc, char **argv) {
    return run_all_tests();
}
#endif
