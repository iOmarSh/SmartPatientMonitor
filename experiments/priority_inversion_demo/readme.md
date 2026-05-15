# Priority Inversion Demo

This is a standalone educational experiment demonstrating Priority Inversion in FreeRTOS.

## What is Priority Inversion?
1. **Low** priority task locks a Mutex holding a shared resource.
2. **High** priority task wakes up and needs the Mutex. It blocks.
3. **Medium** priority task wakes up. It doesn't need the mutex, but since it has higher priority than Low, it preempts Low.
4. RESULT: The High task is stuck indefinitely waiting for the Medium task to finish, because Low can't release the lock.

## Mitigation
Our patient monitor uses FreeRTOS `xSemaphoreCreateMutex()`. FreeRTOS automatically implements **Priority Inheritance**. It temporarily boosts Low's priority to High so it can finish its work and release the lock, preventing Medium from interfering.