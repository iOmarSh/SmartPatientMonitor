# Smart Patient Monitor - Test Suite Documentation

## Test Coverage Overview

Comprehensive test suites have been added covering:
- ✅ **Sensor Functions** - 30+ unit tests
- ✅ **Output Controls** - 32+ unit tests  
- ✅ **Integration & Tasks** - 30+ unit tests

**Total Test Cases: 90+**

---

## Test Structure

```
test/
├── test_state_logic/          (Existing)
│   └── test_main.cpp          - System state determination tests
├── test_sensors/              (NEW)
│   └── test_sensors.cpp       - Sensor reading & validation tests
├── test_outputs/              (NEW)
│   └── test_outputs.cpp       - LED, Buzzer, LCD control tests
└── test_integration/          (NEW)
    └── test_integration.cpp   - Queue, Semaphore, Task tests
```

---

## Test Categories

### 1. Sensor Tests (`test_sensors.cpp`) - 30 Tests

#### LDR Light Sensor (6 tests)
- `test_ldr_initialization` - Verify sensor init
- `test_ldr_read_minimum_value` - Read ADC 0
- `test_ldr_read_maximum_value` - Read ADC 4095
- `test_ldr_read_mid_range_value` - Read ADC 2048
- `test_ldr_multiple_reads_consistent` - Verify consistency

#### LM35 Temperature Sensor (9 tests)
- `test_lm35_initialization` - Verify sensor init
- `test_lm35_read_normal_temperature` - Read 25.5°C
- `test_lm35_read_body_temperature` - Read 37.0°C
- `test_lm35_read_fever_temperature` - Read 39.5°C
- `test_lm35_range_validation_*` - Validate temperature ranges

#### HC-SR04 Distance Sensor (10 tests)
- `test_hcsr04_initialization` - Verify sensor init
- `test_hcsr04_read_minimum_distance` - Read 2cm
- `test_hcsr04_read_maximum_distance` - Read 400cm
- `test_hcsr04_distance_validation_*` - Validate distance ranges
- `test_hcsr04_timeout_handling` - Test timeout count

#### Emergency Button (5 tests)
- `test_button_initialization` - Verify button init
- `test_button_not_pressed_initially` - Default state
- `test_button_pressed_state` - State when pressed
- `test_button_debounce_timing` - Debounce validation

### 2. Output Tests (`test_outputs.cpp`) - 32 Tests

#### Green LED (8 tests)
- `test_green_led_initialization` - Verify LED init
- `test_green_led_turn_on` - LED on state
- `test_green_led_turn_off` - LED off state
- `test_green_led_toggle` - Toggle functionality
- `test_green_led_brightness_control` - PWM brightness
- `test_green_led_brightness_min/max` - Brightness limits

#### Red LED (5 tests)
- `test_red_led_initialization` - Verify LED init
- `test_red_led_turn_on/off` - On/off control
- `test_red_led_toggle` - Toggle functionality

#### Buzzer (5 tests)
- `test_buzzer_initialization` - Verify buzzer init
- `test_buzzer_turn_on/off` - On/off control
- `test_buzzer_beep_*` - Beep with various frequencies
- `test_buzzer_beep_pattern` - Pattern generation

#### LCD Display (7 tests)
- `test_lcd_initialization` - Verify LCD init
- `test_lcd_clear_display` - Clear operation
- `test_lcd_set_cursor_*` - Cursor positioning
- `test_lcd_print_*` - Text printing
- `test_lcd_backlight_*` - Backlight control

#### System Integration (7 tests)
- `test_output_system_initialization` - All outputs init
- `test_output_system_normal_state` - Normal state outputs
- `test_output_system_danger_state` - Danger state outputs
- `test_output_system_warning_state` - Warning state outputs
- `test_led_pwm_intensity_*` - PWM intensity levels

### 3. Integration Tests (`test_integration.cpp`) - 30 Tests

#### Queue Tests (10 tests)
- `test_queue_creation` - Queue initialization
- `test_queue_send_single_item` - Send single data
- `test_queue_send_multiple_items` - Send multiple items
- `test_queue_receive_single_item` - Receive and validate
- `test_queue_fifo_order` - FIFO ordering
- `test_queue_empty_receive_fails` - Empty queue handling
- `test_queue_full_send_fails` - Overflow protection
- `test_queue_overwrite` - Overwrite behavior

#### Semaphore Tests (5 tests)
- `test_semaphore_creation` - Init verification
- `test_semaphore_give` - Signal operation
- `test_semaphore_take` - Wait operation
- `test_semaphore_take_when_not_signaled` - Timeout behavior
- `test_semaphore_multiple_signals` - Signal sequence

#### Mutex Tests (5 tests)
- `test_mutex_creation` - Init verification
- `test_mutex_take_locks` - Lock acquisition
- `test_mutex_give_unlocks` - Lock release
- `test_mutex_take_when_locked_fails` - Lock contention
- `test_mutex_lock_count` - Lock history

#### Task Tests (7 tests)
- `test_task_creation` - Task initialization
- `test_task_start/stop` - Start/stop control
- `test_task_execution_count` - Execution tracking
- `test_task_priority_levels` - Priority validation
- `test_task_stack_allocation` - Stack verification

#### System Integration (3 tests)
- `test_all_tasks_initialized` - All tasks ready
- `test_sensor_data_flow_pipeline` - Data flow validation
- `test_emergency_signal_flow` - Emergency path testing

---

## Running Tests Locally

### Prerequisites
```bash
# Install PlatformIO
pip install platformio

# Install dependencies
platformio project install
```

### Run All Tests
```bash
# Run all unit tests (native/host environment)
platformio test -e test-native

# Run specific test
platformio test -e test-native -f test_sensors

# Run with verbose output
platformio test -e test-native --verbose
```

### Using Build Scripts
```bash
# Linux/Mac
bash build.sh

# Windows
build.bat
```

---

## CI/CD Integration

Tests run automatically on:
- **Every push** to `main` or `develop` branches
- **Every pull request** to `main` or `develop`
- Can be manually triggered via GitHub Actions

### Test Artifacts
- Test results uploaded to GitHub Actions for 30 days
- Logs available in Actions tab under test results
- Failures block merging to main branch

---

## Test Framework

**Framework:** PlatformIO Unity (native/embedded C testing)

**Features:**
- ✅ Native host testing (no hardware required)
- ✅ ESP32-compatible testing
- ✅ Assertion macros for validation
- ✅ Setup/teardown per test
- ✅ Mock implementations for sensors/outputs

---

## Assertion Types Used

```c
// Equality
TEST_ASSERT_EQUAL_INT(expected, actual)
TEST_ASSERT_EQUAL_FLOAT(expected, actual)
TEST_ASSERT_EQUAL_CHAR(expected, actual)

// Boolean
TEST_ASSERT_TRUE(condition)
TEST_ASSERT_FALSE(condition)

// Comparison
TEST_ASSERT_GREATER_THAN(threshold, value)
TEST_ASSERT_EQUAL_INT_MESSAGE(expected, actual, "message")

// Float tolerance
TEST_ASSERT_FLOAT_WITHIN(tolerance, expected, actual)
```

---

## Adding New Tests

### 1. Create Test File
```cpp
#include <unity.h>

void setUp(void) {
    // Initialize before each test
}

void tearDown(void) {
    // Cleanup after each test
}

void test_example_case(void) {
    TEST_ASSERT_EQUAL_INT(5, 2 + 3);
}
```

### 2. Update `platformio.ini`
```ini
test_framework = unity
```

### 3. Run Tests
```bash
platformio test -e test-native
```

---

## Mock Objects

Each test file includes mock implementations:
- **Sensors:** MockLDR, MockLM35, MockHCSR04, MockButtonSensor
- **Outputs:** MockLED, MockBuzzer, MockLCDDisplay
- **RTOS:** MockQueue, MockSemaphore, MockMutex, MockTask

These allow testing logic without hardware.

---

## Test Status Codes

- ✅ **PASS** - Test assertion succeeded
- ❌ **FAIL** - Assertion failed, test error printed
- ⏭️ **SKIP** - Test skipped (rare)
- ⚠️ **IGNORE** - Test ignored (for disabled features)

---

## Performance Notes

- Unit tests run in **<1 second** each
- Full test suite completes in **<30 seconds**
- No hardware required (native testing)
- Can run locally during development
- Parallel execution in CI/CD

---

## Troubleshooting

### Tests Won't Compile
- Verify `platformio.ini` has `lib_deps = throwtheswitch/Unity`
- Check for syntax errors in test files
- Ensure headers match your system_types.h structure

### Tests Fail on CI but Pass Locally
- Check environment differences (Python version, platform)
- Verify test data matches firmware configuration
- Check mock implementations match actual code

### Need to Debug Tests
- Add `TEST_FAIL_MESSAGE("Debug info")`to see values
- Run with `--verbose` flag
- Check `.pio/test-results/` for detailed logs

---

## Next Steps

1. ✅ Run existing tests: `platformio test -e test-native`
2. ✅ Check CI/CD workflow status in GitHub Actions
3. ✅ Review test results and coverage
4. ➜ Extend tests as new features are added
5. ➜ Add dashboard tests when implemented

---

**Last Updated:** May 15, 2026
