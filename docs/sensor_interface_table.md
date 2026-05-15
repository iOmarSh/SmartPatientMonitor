# Sensor Interface Table

| Sensor | Purpose | Interface Type | Sampling Period | Expected Normal Range | Invalid Range | Failure Behavior |
|--------|---------|----------------|-----------------|-----------------------|---------------|------------------|
| **LM35** | Measures patient body temperature. | Analog (ADC) | 200 ms | 36.0°C - 37.9°C | < 30°C or > 45°C | If disconnected, pin floats high (~300°C), triggering DANGER state immediately. |
| **HC-SR04** | Measures distance to detect approaching objects. | Digital (GPIO Trigger/Echo) | 200 ms | 30.1 cm - 400.0 cm | < 0 cm (Timeout) | If disconnected, returns -1.0f (Error). System ignores it and maintains the previous valid state. |
| **LDR** | Measures ambient light level in the patient's room. | Analog (ADC) | 200 ms | 100 - 800 (ADC) | 0 or 4095 | Non-critical logging only. Does not alter system safety state. |
| **Button** | Emergency manual override. | Digital (Interrupt / ISR) | Event-driven | N/A (Normally High) | Bouncing signals | Handled via software debounce (250ms). A valid press forces the EMERGENCY state. |

*Note: The project utilizes an I2C LCD which functions over a communication bus, fulfilling the complex interface aspect, while UART is heavily used for the Logging/Diagnostic role.*