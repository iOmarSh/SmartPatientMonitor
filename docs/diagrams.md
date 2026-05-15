# Smart Patient Monitor - System Diagrams

You can view these diagrams directly in VS Code by installing the **Mermaid Preview** extension, or copy-pasting them into [Mermaid Live Editor](https://mermaid.live).

## Figure 1: System Overview Block Diagram
```mermaid
graph TD
    %% Define Styles
    classDef hardware fill:#f9f,stroke:#333,stroke-width:2px;
    classDef software fill:#dfd,stroke:#333,stroke-width:2px;
    classDef external fill:#ffd,stroke:#333,stroke-width:2px;

    %% Components
    subgraph Environment ["Patient Environment"]
        Temp[LM35 Temperature Sensor]:::hardware
        LDR[LDR Light Sensor]:::hardware
        Dist[HC-SR04 Distance Sensor]:::hardware
        Btn[Emergency Button]:::hardware
    end

    subgraph MCU ["ESP32 Microcontroller"]
        RTOS[FreeRTOS Core]:::software
        Tasks["Task Scheduling\n(Sensor, Process, Output, Emergency)"]:::software
    end

    subgraph Outputs ["User Interface / Alarms"]
        LCD[16x2 I2C LCD]:::hardware
        LEDs[Status LEDs Green/Red]:::hardware
        Buzzer[Piezo Buzzer]:::hardware
    end
    
    %% Connections
    Temp -->|Analog ADC| MCU
    LDR -->|Analog ADC| MCU
    Dist -->|GPIO Pulse| MCU
    Btn -->|GPIO Interrupt| MCU

    MCU -->|I2C Data| LCD
    MCU -->|GPIO High/Low| LEDs
    MCU -->|PWM/GPIO| Buzzer

    RTOS <--> Tasks
```

## Figure 2: Hardware Interconnection Diagram
```mermaid
graph LR
    %% Styles
    classDef esp fill:#2E8B57,stroke:#fff,stroke-width:2px,color:#fff;
    classDef sensor fill:#4682B4,stroke:#fff,stroke-width:2px,color:#fff;
    classDef actuator fill:#CD5C5C,stroke:#fff,stroke-width:2px,color:#fff;

    ESP[(ESP32 Dev Board)]:::esp

    T_SENS[LM35 Temp]:::sensor -->|Pin 34| ESP
    L_SENS[LDR Sensor]:::sensor -->|Pin 35| ESP
    U_SENS[HC-SR04]:::sensor -->|Trig: 5, Echo: 18| ESP
    BUTTON[Emerg Button]:::sensor -->|Pin 19| ESP

    ESP -->|SDA: 21, SCL: 22| LCD[16x2 I2C LCD]:::actuator
    ESP -->|Pin 25| G_LED[Green LED]:::actuator
    ESP -->|Pin 26| R_LED[Red LED]:::actuator
    ESP -->|Pin 27| BZ[Buzzer]:::actuator
```

## Figure 3: RTOS Task and Communication Flow
```mermaid
graph TD
    %% Styles
    classDef task fill:#9370DB,stroke:#fff,stroke-width:2px,color:#fff;
    classDef queue fill:#FFA500,stroke:#fff,stroke-width:2px,color:#fff,shape:cylinder;
    classDef isr fill:#FF4500,stroke:#fff,stroke-width:2px,color:#fff;

    ISR((Button ISR)):::isr

    subgraph "FreeRTOS Tasks"
        TS[Task: Sensor\nPriority: 2]:::task
        TP[Task: Processing\nPriority: 3]:::task
        TO[Task: Output\nPriority: 1]:::task
        TE[Task: Emergency\nPriority: 4]:::task
    end

    Q_SENS[(SensorQueue\nCapacity: 10)]:::queue
    Q_STATE[(StateQueue\nCapacity: 1)]:::queue
    SEM>Emergency Semaphore]:::queue

    ISR -.->|Give| SEM
    SEM -.->|Take| TE

    TS -->|Send Data\n(Overwrites if full)| Q_SENS
    Q_SENS -->|Receive Data| TP

    TP -->|Compute & Send State\n(Overwrite)| Q_STATE
    Q_STATE -->|Receive State| TO

    TE -->|Preempts All| TP
```

## Figure 4: FreeRTOS Priority Stack and Preemption
```mermaid
gantt
    title Task Execution Timeline & Preemption
    dateFormat  s
    axisFormat  %S
    
    section Output (Prio 1)
    Updating LCD         :a1, 0, 3s
    
    section Sensor (Prio 2)
    Sampling Sensors     :a2, 1, 1s
    
    section Processing (Prio 3)
    Calculating State    :a3, 1.5, 0.5s
    
    section Emergency (Prio 4)
    Handling Interrupt   :crit, a4, 2s, 0.5s
```

## Figure 5: Synchronization Diagram (Queues, Mutexes, Semaphores)
```mermaid
sequenceDiagram
    participant ISR as Hardware ISR
    participant S as TaskSensor
    participant Q1 as SensorQueue
    participant P as TaskProcessing
    participant Q2 as StateQueue
    participant O as TaskOutput
    participant E as TaskEmergency
    participant M as I2C Mutex

    S->>Q1: xQueueSend(sensorData)
    P->>Q1: xQueueReceive()
    P->>P: determineSystemState()
    P->>Q2: xQueueOverwrite(newState)
    O->>Q2: xQueueReceive()
    O->>M: xSemaphoreTake(lcdMutex)
    O->>O: Update LCD
    O->>M: xSemaphoreGive(lcdMutex)
    
    Note over ISR, E: Emergency Event Triggered
    ISR->>E: xSemaphoreGiveFromISR(emergencySem)
    E->>E: Task Wakes Up (Highest Prio)
    E->>M: xSemaphoreTake(lcdMutex)
    E->>E: Flash EMERGENCY on LCD
    E->>M: xSemaphoreGive(lcdMutex)
```

## Figure 6: State Machine Diagram
```mermaid
stateDiagram-v2
    [*] --> NORMAL
    
    NORMAL --> WARNING : T > 30°C or\nDist < 10cm or\nLDR > 600
    WARNING --> EMERGENCY : Button Pressed
    NORMAL --> EMERGENCY : Button Pressed
    
    WARNING --> NORMAL : T < 28°C and\nDist > 15cm and\nLDR < 500
    
    EMERGENCY --> NORMAL : Manual System Reset
```
