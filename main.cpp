xTaskCreate(TaskSensor, "Sensor", 4096, NULL, 2, NULL);
xTaskCreate(TaskProcessing, "Processing", 4096, NULL, 3, NULL);
xTaskCreate(TaskOutput, "Output", 4096, NULL, 2, NULL);