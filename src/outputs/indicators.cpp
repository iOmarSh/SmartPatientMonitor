#include <Arduino.h>
#include "outputs/indicators.h"
#include "pins.h"

void initIndicators()
{
    pinMode(PIN_LED_GREEN, OUTPUT);
    pinMode(PIN_LED_RED, OUTPUT);
    pinMode(PIN_BUZZER, OUTPUT);
    
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_RED, LOW);
    digitalWrite(PIN_BUZZER, LOW);
}

void setLEDs(bool greenState, bool redState)
{
    digitalWrite(PIN_LED_GREEN, greenState ? HIGH : LOW);
    digitalWrite(PIN_LED_RED, redState ? HIGH : LOW);
}

void setBuzzer(bool state)
{
    digitalWrite(PIN_BUZZER, state ? HIGH : LOW);
}