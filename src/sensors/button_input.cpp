#include <Arduino.h>
#include "sensors/button_input.h"
#include "pins.h"

void initEmergencyButton()
{
    pinMode(PIN_BUTTON, INPUT_PULLUP);
}

bool isEmergencyPressed()
{
    // active LOW button
    return digitalRead(PIN_BUTTON) == LOW;
}
