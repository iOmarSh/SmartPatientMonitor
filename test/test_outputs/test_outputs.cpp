#include <unity.h>
#include <Arduino.h>

// Mock output functions for testing
// These tests validate LED, buzzer, and LCD control logic

class MockLED {
public:
    bool isOn = false;
    bool isInitialized = false;
    int pin = -1;
    int brightness = 0;  // 0-255 for PWM

    void init(int ledPin) {
        pin = ledPin;
        isInitialized = true;
        isOn = false;
        brightness = 0;
    }

    void on() {
        isOn = true;
        brightness = 255;
    }

    void off() {
        isOn = false;
        brightness = 0;
    }

    void toggle() {
        isOn = !isOn;
        brightness = isOn ? 255 : 0;
    }

    void setBrightness(int value) {
        brightness = constrain(value, 0, 255);
        isOn = (brightness > 0);
    }

    bool isOnCheck() {
        return isOn;
    }

    int getBrightness() {
        return brightness;
    }

    bool isInitialized_check() {
        return isInitialized;
    }
};

class MockBuzzer {
public:
    bool isOn = false;
    bool isInitialized = false;
    int pin = -1;
    int frequency = 0;
    int duration = 0;

    void init(int buzzerPin) {
        pin = buzzerPin;
        isInitialized = true;
        isOn = false;
        frequency = 0;
    }

    void on() {
        isOn = true;
    }

    void off() {
        isOn = false;
    }

    void beep(int freq = 1000, int durationMs = 100) {
        frequency = freq;
        duration = durationMs;
        isOn = true;
    }

    void beepPattern(int beeps) {
        // Simulate beep pattern
        for (int i = 0; i < beeps; i++) {
            isOn = true;
            // delay(100);
            isOn = false;
            // delay(100);
        }
    }

    bool isOnCheck() {
        return isOn;
    }

    bool isInitialized_check() {
        return isInitialized;
    }

    int getFrequency() {
        return frequency;
    }
};

class MockLCDDisplay {
public:
    bool isInitialized = false;
    char displayBuffer[16][2];  // 16x2 character display
    bool isBacklightOn = false;
    int cursorRow = 0;
    int cursorCol = 0;

    void init() {
        isInitialized = true;
        isBacklightOn = true;
        clearDisplay();
    }

    void clearDisplay() {
        for (int i = 0; i < 16; i++) {
            for (int j = 0; j < 2; j++) {
                displayBuffer[i][j] = ' ';
            }
        }
    }

    void setCursor(int row, int col) {
        if (row >= 0 && row < 2 && col >= 0 && col < 16) {
            cursorRow = row;
            cursorCol = col;
        }
    }

    void printText(const char *text) {
        if (!isInitialized) return;
        int idx = 0;
        while (text[idx] != '\0' && cursorCol < 16) {
            displayBuffer[cursorCol][cursorRow] = text[idx];
            cursorCol++;
            idx++;
        }
    }

    void backlightOn() {
        isBacklightOn = true;
    }

    void backlightOff() {
        isBacklightOn = false;
    }

    bool isBacklightOnCheck() {
        return isBacklightOn;
    }

    bool isInitialized_check() {
        return isInitialized;
    }

    char getCharAt(int col, int row) {
        if (col >= 0 && col < 16 && row >= 0 && row < 2) {
            return displayBuffer[col][row];
        }
        return ' ';
    }
};

class OutputIndicators {
public:
    MockLED greenLED;
    MockLED redLED;
    MockBuzzer buzzer;
    MockLCDDisplay lcd;

    void init() {
        greenLED.init(23);
        redLED.init(5);
        buzzer.init(19);
        lcd.init();
    }

    bool allInitialized() {
        return greenLED.isInitialized_check() &&
               redLED.isInitialized_check() &&
               buzzer.isInitialized_check() &&
               lcd.isInitialized_check();
    }
};

// Global mock objects
MockLED mockGreenLED;
MockLED mockRedLED;
MockBuzzer mockBuzzer;
MockLCDDisplay mockLCD;
OutputIndicators indicators;

// Test Setup and Teardown
void setUp(void) {
    mockGreenLED = MockLED();
    mockRedLED = MockLED();
    mockBuzzer = MockBuzzer();
    mockLCD = MockLCDDisplay();
    indicators = OutputIndicators();
}

void tearDown(void) {
}

// ===== GREEN LED TESTS =====

void test_green_led_initialization(void) {
    mockGreenLED.init(23);
    TEST_ASSERT_TRUE(mockGreenLED.isInitialized_check());
    TEST_ASSERT_FALSE(mockGreenLED.isOnCheck());
}

void test_green_led_turn_on(void) {
    mockGreenLED.init(23);
    mockGreenLED.on();
    TEST_ASSERT_TRUE(mockGreenLED.isOnCheck());
    TEST_ASSERT_EQUAL_INT(255, mockGreenLED.getBrightness());
}

void test_green_led_turn_off(void) {
    mockGreenLED.init(23);
    mockGreenLED.on();
    mockGreenLED.off();
    TEST_ASSERT_FALSE(mockGreenLED.isOnCheck());
    TEST_ASSERT_EQUAL_INT(0, mockGreenLED.getBrightness());
}

void test_green_led_toggle(void) {
    mockGreenLED.init(23);
    TEST_ASSERT_FALSE(mockGreenLED.isOnCheck());
    mockGreenLED.toggle();
    TEST_ASSERT_TRUE(mockGreenLED.isOnCheck());
    mockGreenLED.toggle();
    TEST_ASSERT_FALSE(mockGreenLED.isOnCheck());
}

void test_green_led_brightness_control(void) {
    mockGreenLED.init(23);
    mockGreenLED.setBrightness(128);
    TEST_ASSERT_EQUAL_INT(128, mockGreenLED.getBrightness());
    TEST_ASSERT_TRUE(mockGreenLED.isOnCheck());
}

void test_green_led_brightness_min(void) {
    mockGreenLED.init(23);
    mockGreenLED.setBrightness(0);
    TEST_ASSERT_EQUAL_INT(0, mockGreenLED.getBrightness());
}

void test_green_led_brightness_max(void) {
    mockGreenLED.init(23);
    mockGreenLED.setBrightness(255);
    TEST_ASSERT_EQUAL_INT(255, mockGreenLED.getBrightness());
}

void test_green_led_brightness_clamp(void) {
    mockGreenLED.init(23);
    mockGreenLED.setBrightness(500);
    TEST_ASSERT_EQUAL_INT(255, mockGreenLED.getBrightness());
}

// ===== RED LED TESTS =====

void test_red_led_initialization(void) {
    mockRedLED.init(5);
    TEST_ASSERT_TRUE(mockRedLED.isInitialized_check());
    TEST_ASSERT_FALSE(mockRedLED.isOnCheck());
}

void test_red_led_turn_on(void) {
    mockRedLED.init(5);
    mockRedLED.on();
    TEST_ASSERT_TRUE(mockRedLED.isOnCheck());
}

void test_red_led_turn_off(void) {
    mockRedLED.init(5);
    mockRedLED.on();
    mockRedLED.off();
    TEST_ASSERT_FALSE(mockRedLED.isOnCheck());
}

void test_red_led_toggle(void) {
    mockRedLED.init(5);
    mockRedLED.toggle();
    TEST_ASSERT_TRUE(mockRedLED.isOnCheck());
    mockRedLED.toggle();
    TEST_ASSERT_FALSE(mockRedLED.isOnCheck());
}

// ===== BUZZER TESTS =====

void test_buzzer_initialization(void) {
    mockBuzzer.init(19);
    TEST_ASSERT_TRUE(mockBuzzer.isInitialized_check());
    TEST_ASSERT_FALSE(mockBuzzer.isOnCheck());
}

void test_buzzer_turn_on(void) {
    mockBuzzer.init(19);
    mockBuzzer.on();
    TEST_ASSERT_TRUE(mockBuzzer.isOnCheck());
}

void test_buzzer_turn_off(void) {
    mockBuzzer.init(19);
    mockBuzzer.on();
    mockBuzzer.off();
    TEST_ASSERT_FALSE(mockBuzzer.isOnCheck());
}

void test_buzzer_beep_default(void) {
    mockBuzzer.init(19);
    mockBuzzer.beep();
    TEST_ASSERT_TRUE(mockBuzzer.isOnCheck());
    TEST_ASSERT_EQUAL_INT(1000, mockBuzzer.getFrequency());
}

void test_buzzer_beep_custom_frequency(void) {
    mockBuzzer.init(19);
    mockBuzzer.beep(2000, 200);
    TEST_ASSERT_EQUAL_INT(2000, mockBuzzer.getFrequency());
}

void test_buzzer_beep_low_frequency(void) {
    mockBuzzer.init(19);
    mockBuzzer.beep(500, 150);
    TEST_ASSERT_EQUAL_INT(500, mockBuzzer.getFrequency());
}

void test_buzzer_beep_high_frequency(void) {
    mockBuzzer.init(19);
    mockBuzzer.beep(5000, 150);
    TEST_ASSERT_EQUAL_INT(5000, mockBuzzer.getFrequency());
}

void test_buzzer_beep_pattern(void) {
    mockBuzzer.init(19);
    mockBuzzer.beepPattern(3);
    TEST_ASSERT_FALSE(mockBuzzer.isOnCheck());  // Pattern ends with off
}

// ===== LCD DISPLAY TESTS =====

void test_lcd_initialization(void) {
    mockLCD.init();
    TEST_ASSERT_TRUE(mockLCD.isInitialized_check());
    TEST_ASSERT_TRUE(mockLCD.isBacklightOnCheck());
}

void test_lcd_clear_display(void) {
    mockLCD.init();
    mockLCD.setCursor(0, 0);
    mockLCD.printText("HELLO");
    mockLCD.clearDisplay();
    TEST_ASSERT_EQUAL_CHAR(' ', mockLCD.getCharAt(0, 0));
}

void test_lcd_set_cursor_valid(void) {
    mockLCD.init();
    mockLCD.setCursor(0, 5);
    TEST_ASSERT_EQUAL_INT(0, mockLCD.cursorRow);
    TEST_ASSERT_EQUAL_INT(5, mockLCD.cursorCol);
}

void test_lcd_print_single_line(void) {
    mockLCD.init();
    mockLCD.setCursor(0, 0);
    mockLCD.printText("NORMAL");
    TEST_ASSERT_EQUAL_CHAR('N', mockLCD.getCharAt(0, 0));
    TEST_ASSERT_EQUAL_CHAR('O', mockLCD.getCharAt(1, 0));
}

void test_lcd_print_second_line(void) {
    mockLCD.init();
    mockLCD.setCursor(1, 0);
    mockLCD.printText("WARNING");
    TEST_ASSERT_EQUAL_CHAR('W', mockLCD.getCharAt(0, 1));
}

void test_lcd_backlight_on(void) {
    mockLCD.init();
    mockLCD.backlightOn();
    TEST_ASSERT_TRUE(mockLCD.isBacklightOnCheck());
}

void test_lcd_backlight_off(void) {
    mockLCD.init();
    mockLCD.backlightOff();
    TEST_ASSERT_FALSE(mockLCD.isBacklightOnCheck());
}

void test_lcd_backlight_toggle(void) {
    mockLCD.init();
    TEST_ASSERT_TRUE(mockLCD.isBacklightOnCheck());
    mockLCD.backlightOff();
    TEST_ASSERT_FALSE(mockLCD.isBacklightOnCheck());
    mockLCD.backlightOn();
    TEST_ASSERT_TRUE(mockLCD.isBacklightOnCheck());
}

// ===== OUTPUT SYSTEM INTEGRATION TESTS =====

void test_output_system_initialization(void) {
    indicators.init();
    TEST_ASSERT_TRUE(indicators.allInitialized());
}

void test_output_system_normal_state(void) {
    indicators.init();
    indicators.greenLED.on();
    indicators.redLED.off();
    indicators.buzzer.off();

    TEST_ASSERT_TRUE(indicators.greenLED.isOnCheck());
    TEST_ASSERT_FALSE(indicators.redLED.isOnCheck());
    TEST_ASSERT_FALSE(indicators.buzzer.isOnCheck());
}

void test_output_system_danger_state(void) {
    indicators.init();
    indicators.greenLED.off();
    indicators.redLED.on();
    indicators.buzzer.on();

    TEST_ASSERT_FALSE(indicators.greenLED.isOnCheck());
    TEST_ASSERT_TRUE(indicators.redLED.isOnCheck());
    TEST_ASSERT_TRUE(indicators.buzzer.isOnCheck());
}

void test_output_system_warning_state(void) {
    indicators.init();
    indicators.greenLED.on();
    indicators.redLED.on();
    indicators.buzzer.off();

    TEST_ASSERT_TRUE(indicators.greenLED.isOnCheck());
    TEST_ASSERT_TRUE(indicators.redLED.isOnCheck());
    TEST_ASSERT_FALSE(indicators.buzzer.isOnCheck());
}

void test_led_pwm_intensity_normal(void) {
    indicators.init();
    indicators.greenLED.setBrightness(200);
    TEST_ASSERT_EQUAL_INT(200, indicators.greenLED.getBrightness());
}

void test_led_pwm_intensity_danger(void) {
    indicators.init();
    indicators.redLED.setBrightness(255);
    TEST_ASSERT_EQUAL_INT(255, indicators.redLED.getBrightness());
}

void setUp_test_output_system_initialization(void) {
    setUp();
}

void tearDown_test_output_system_initialization(void) {
    tearDown();
}
