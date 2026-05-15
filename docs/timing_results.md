# Timing Diagnostics Results

Measurements obtained using `micros()`, `millis()`, and `xTaskGetTickCount()`, combined into the diagnostic macro system `MEASURE_START` / `MEASURE_END`.

## Timing Observations

| Metric | Target | Average | Max | Jitter / Observation |
|--------|--------|---------|-----|----------------------|
| **TaskSensor Loop Time** | 200 ms | 202 ms | 215 ms | Very consistent. I2C LCD and Serial print strings introduce ±5-10ms variations due to string buffering. |
| **ISR Trigger to Semaphore Give** | < 1 ms | 0.05 ms | 0.1 ms | Instantaneous context switch; no blocking code limits it. |
| **Queue Send/Receive Latency** | < 2 ms | < 1 ms | < 1 ms | Near-instantaneous memory copy (`pdPASS`) since queues only hold 1 item. |
| **LCD Update Duration** | < 50 ms | ~15 ms | 22 ms | I2C writes operate synchronously; heavily depends on string length. Avoiding `lcd.clear()` saves ~50ms. |

## Conclusion
The system successfully meets all target timing constraints. Occasional jitter introduced by standard I2C delays does not impact the safety thresholds.