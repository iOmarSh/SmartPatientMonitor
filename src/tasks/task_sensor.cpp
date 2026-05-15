#include <Arduino.h>
#include "tasks/task_sensor.h"
#include <Wire.h>
#include "pins.h"

void TaskSensor(void *pvParameters)
{
    // Initialize I2C for MPU6050
    Wire.begin(I2C_SDA, I2C_SCL);

    while (1)
    {
        // Read LM35 temperature (analog value)
        int lm35Value = analogRead(PIN_LM35);
        float temperature = (lm35Value * 3.3 / 4095.0) * 100.0; // Convert to Celsius

        // Read LDR light intensity (analog value)
        int ldrValue = analogRead(PIN_LDR);

        // Read MPU6050 data (placeholder for actual implementation)
        Wire.beginTransmission(0x68); // MPU6050 I2C address
        Wire.write(0x3B); // Starting register for accelerometer data
        Wire.endTransmission(false);
        Wire.requestFrom(0x68, 6, true); // Request accelerometer data
        int16_t accelX = (Wire.read() << 8) | Wire.read();
        int16_t accelY = (Wire.read() << 8) | Wire.read();
        int16_t accelZ = (Wire.read() << 8) | Wire.read();

        // Print sensor data to Serial (for debugging)
        Serial.printf("Temperature: %.2f C, LDR: %d, AccelX: %d, AccelY: %d, AccelZ: %d\n",
                      temperature, ldrValue, accelX, accelY, accelZ);

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
