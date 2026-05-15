# Race Condition Demo

This is a standalone educational demo proving why Mutexes are necessary in our main architecture. 

It does not touch the main files.

## What is a Race Condition?
When two tasks access a shared variable (`sharedSensorStruct`) concurrently. The reader might read HALF of the old struct and HALF of the new struct simultaneously if the RTOS preempts exactly in the middle of writing.

## The Fix
Look at `main.cpp`. The variable is protected by a mutex. Without the mutex, the system corrupts the struct variables. 