# Smart Patient Monitor

[![Build status](https://github.com/iOmarSh/SmartPatientMonitor/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/iOmarSh/SmartPatientMonitor/actions/workflows/build.yml)
[![Tests](https://github.com/iOmarSh/SmartPatientMonitor/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/iOmarSh/SmartPatientMonitor/actions/workflows/tests.yml)
[![Static analysis](https://github.com/iOmarSh/SmartPatientMonitor/actions/workflows/static-analysis.yml/badge.svg?branch=main)](https://github.com/iOmarSh/SmartPatientMonitor/actions/workflows/static-analysis.yml)
[![Formatting](https://github.com/iOmarSh/SmartPatientMonitor/actions/workflows/format.yml/badge.svg?branch=main)](https://github.com/iOmarSh/SmartPatientMonitor/actions/workflows/format.yml)

Professional ESP32 Smart Patient Monitoring System built with PlatformIO, FreeRTOS, and Unity tests.

## Local Commands

- `pio run` builds the ESP32 firmware.
- `pio test -e native` runs the host-side Unity tests.
- `pio test -e esp32dev` runs embedded tests on the ESP32 target.
- `pio check` runs PlatformIO static checks.

## CI/CD Pipeline

- Build workflow: compiles firmware on every push and pull request.
- Test workflow: runs the native Unity suite and uploads the test log as an artifact.
- Static analysis workflow: runs `pio check`, `cppcheck`, and `clang-tidy` when the toolchain is available.
- Formatting workflow: verifies the repository matches `.clang-format`.
- Release workflow: builds the firmware and publishes `.bin` and `.elf` artifacts when a GitHub Release is published.

## Releasing

1. Create and publish a GitHub Release with a semantic version tag such as `v1.0.0`.
2. The release workflow builds the firmware on Ubuntu.
3. The compiled firmware is uploaded as a workflow artifact and attached to the GitHub Release.

## Test Results

- Open the Actions tab in GitHub.
- Select the `Tests` workflow.
- Download the `native-test-logs` artifact to inspect the Unity output.

## Suggested Repository Hygiene

- Protect `main` with required checks for Build, Tests, Static Analysis, and Formatting.
- Keep Dependabot enabled for GitHub Actions updates.
- Use the PR template to enforce validation before merging.
- Add semantic version tags for releases so firmware artifacts are traceable.
