# Architecture Diagrams

This document provides visual representations of the Smart Patient Monitoring System's architecture, including RTOS task flows, synchronization primitives, and state transitions.

## 1. RTOS Task & Communication Flow
The system uses a pipelined architecture where data flows from sensors to processing, and finally to outputs, with a high-priority emergency path.

```mermaid
graph TD
    subgraph "Input Layer"
        ISR[Emergency Button ISR]
        TS[TaskSensor]
    end

    subgraph "Synchronization & Communication"
        SQ[gSensorQueue]
        EQ[gStateQueue]
        SEM[gEmergencySemaphore]
        MUX1[gSerialMutex]
        MUX2[gLcdMutex]
        MUX3[gSensorDataMutex]
    end

    subgraph "Processing Layer"
        TP[TaskProcessing]
        TE[TaskEmergency]
    end

    subgraph "Output Layer"
        TO[TaskOutput]
    end

    TS -->|SensorData| SQ
    SQ -->|SensorData| TP
    TP -->|SystemState| EQ
    EQ -->|SystemState| TO
    
    ISR -->|Give| SEM
    SEM -->|Take| TE
    TE -->|Overwrite| EQ

    TS -.->|Protect| MUX3
    TO -.->|Protect| MUX3
    TO -.->|Protect| MUX2
    TP -.->|Log| MUX1
    TS -.->|Log| MUX1
    TO -.->|Log| MUX1
```

## 2. System State Machine
The system transitions between four states based on sensor thresholds and user interrupts.

```mermaid
stateDiagram-v2
    [*] --> NORMAL
    
    NORMAL --> WARNING : Distance <= 30cm
    NORMAL --> DANGER : Temp >= 38C
    NORMAL --> EMERGENCY : Button Pressed
    
    WARNING --> NORMAL : Distance > 30cm AND Temp < 38C
    WARNING --> DANGER : Temp >= 38C
    WARNING --> EMERGENCY : Button Pressed
    
    DANGER --> NORMAL : Temp < 38C AND Distance > 30cm
    DANGER --> WARNING : Temp < 38C AND Distance <= 30cm
    DANGER --> EMERGENCY : Button Pressed
    
    EMERGENCY --> NORMAL : Next Processing Cycle (if no triggers)
    EMERGENCY --> WARNING : Next Processing Cycle (if dist <= 30)
    EMERGENCY --> DANGER : Next Processing Cycle (if temp >= 38)
```

## 3. Hardware Architecture
A simplified block diagram showing the connections to the ESP32.

```mermaid
graph LR
    subgraph "Sensors (Inputs)"
        LM35[LM35 Temp] --> GPIO34
        LDR[LDR Light] --> GPIO35
        HCSR[HC-SR04 Dist] --> GPIO16/17
        BTN[Emergency Button] --> GPIO18
    end

    subgraph "ESP32 SoC"
        CPU[Dual-Core Xtensa]
        RTOS[FreeRTOS]
    end

    subgraph "Indicators (Outputs)"
        GPIO23 --> GLED[Green LED]
        GPIO5 --> RLED[Red LED]
        GPIO19 --> BUZ[Buzzer]
        GPIO21/22 --> LCD[I2C LCD 16x2]
    end
```
