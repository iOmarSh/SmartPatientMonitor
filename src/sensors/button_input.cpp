#include <Arduino.h>
#include "sensors/button_input.h"

#ifndef EMERGENCY_BUTTON_PIN
#define EMERGENCY_BUTTON_PIN 18
#endif

void initEmergencyButton()
{
    pinMode(EMERGENCY_BUTTON_PIN, INPUT_PULLUP);
}

bool isEmergencyPressed()
{
    // active LOW button
    return digitalRead(EMERGENCY_BUTTON_PIN) == LOW;
}
