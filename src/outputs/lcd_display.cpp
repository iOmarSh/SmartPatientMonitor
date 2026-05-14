#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "outputs/lcd_display.h"
#include "pins.h"
#include "sync/rtos_sync.h"

// Typically I2C LCDs use address 0x27 or 0x3F and are 16x2.
// Default to common addresses; will attempt auto-detect at startup.
LiquidCrystal_I2C lcd(0x27, 16, 2);

static int detectI2CAddress()
{
    // Try common addresses 0x27 and 0x3F
    const int candidates[] = {0x27, 0x3F};
    Wire.begin(I2C_SDA, I2C_SCL);
    for (int i = 0; i < (int)(sizeof(candidates) / sizeof(candidates[0])); ++i)
    {
        Wire.beginTransmission(candidates[i]);
        if (Wire.endTransmission() == 0)
        {
            return candidates[i];
        }
    }
    return -1;
}

void initLCD()
{
    int addr = detectI2CAddress();
    if (addr > 0)
    {
        if (addr != 0x27)
        {
            // reconfigure lcd instance to detected address
            lcd = LiquidCrystal_I2C(addr, 16, 2);
        }
        if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
        {
            Serial.print("[LCD] I2C device found at 0x");
            Serial.println(addr, HEX);
            xSemaphoreGive(gSerialMutex);
        }
    }
    else
    {
        if (xSemaphoreTake(gSerialMutex, pdMS_TO_TICKS(10)) == pdTRUE)
        {
            Serial.println("[LCD] Warning: No I2C LCD found at 0x27/0x3F");
            xSemaphoreGive(gSerialMutex);
        }
    }

    lcd.init();
    lcd.backlight();
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Smart Monitor");
    lcd.setCursor(0, 1);
    lcd.print("Initializing...");
}

void printLCD(const char* row0, const char* row1)
{
    char formatBuf0[17];
    char formatBuf1[17];

    if (row0) {
        snprintf(formatBuf0, sizeof(formatBuf0), "%-16s", row0);
        lcd.setCursor(0, 0);
        lcd.print(formatBuf0);
    }

    if (row1) {
        snprintf(formatBuf1, sizeof(formatBuf1), "%-16s", row1);
        lcd.setCursor(0, 1);
        lcd.print(formatBuf1);
    }
}