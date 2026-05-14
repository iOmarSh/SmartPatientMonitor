#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "outputs/lcd_display.h"
#include "pins.h"

// Typically I2C LCDs use address 0x27 or 0x3F and are 16x2.
LiquidCrystal_I2C lcd(0x27, 16, 2);

void initLCD()
{
    Wire.begin(I2C_SDA, I2C_SCL);
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
    lcd.clear();
    if (row0) {
        lcd.setCursor(0, 0);
        lcd.print(row0);
    }
    if (row1) {
        lcd.setCursor(0, 1);
        lcd.print(row1);
    }
}