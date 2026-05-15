# Smart Patient Monitor - CI/CD & Testing Pipeline Guide

## Table of Contents
1. [Overview](#overview)
2. [CI/CD Pipeline Steps](#cicd-pipeline-steps)
3. [Testing Strategy](#testing-strategy)
4. [Why This Is Useful](#why-this-is-useful)
5. [Tools & Technologies Used](#tools--technologies-used)
6. [GitHub Actions Integration](#github-actions-integration)
7. [How to Use](#how-to-use)
8. [Workflow Examples](#workflow-examples)

---

## Overview

This project has a **fully automated CI/CD pipeline** that:
- ✅ Compiles ESP32 firmware automatically
- ✅ Runs 92+ unit tests on every code change
- ✅ Analyzes code quality and security
- ✅ Deploys dashboard to GitHub Pages
- ✅ Creates releases with artifacts
- ✅ Generates reports and summaries

**Everything is integrated with GitHub Actions** and runs without any manual intervention.

---

## CI/CD Pipeline Steps

### Step 1: Code Commit
```
Developer commits code → Push to GitHub
                            ↓
                    GitHub Actions triggered
```

### Step 2: Build & Compilation
```
Build Job (ESP32dev environment)
├── Checkout code
├── Install Python 3.9
├── Install PlatformIO
├── Compile firmware
└── Upload build artifacts
    
Expected Duration: 2-3 minutes
```

### Step 3: Unit Testing
```
Testing Jobs (Native environment - no hardware needed)
├── Run Sensor Tests (30 tests)
├── Run Output Tests (32 tests)
├── Run Integration Tests (30 tests)
└── Generate test report
    
Expected Duration: 1-2 minutes
Total Tests: 92+
```

### Step 4: Code Analysis
```
Analysis Job (Parallel with build)
├── C++ Code Formatting Check (clang-format)
├── Static Analysis (cppcheck)
├── Security Scanning (npm audit, Snyk)
├── Documentation validation
└── Code comment statistics
    
Expected Duration: 2-3 minutes
```

### Step 5: Dashboard Build
```
Dashboard Job (React)
├── Install Node.js 18
├── Install npm dependencies
├── Build React application
├── Run linting checks
└── Upload build artifacts
    
Expected Duration: 2-3 minutes
```

### Step 6: Report Generation
```
Summary Job
├── Collect all results
├── Generate summary report
├── Show job statuses
└── Display test statistics
    
Expected Duration: 30 seconds
```

### Full Pipeline Flow
```
┌─────────────────┐
│  Code Committed │
└────────┬────────┘
         │
         ▼
    ┌────────────────────────────────────┐
    │   GitHub Actions Workflow Starts   │
    └────────┬───────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────────┐  ┌──────────────────┐
│ Build Fw    │  │ Code Analysis    │
│ (2-3 min)   │  │ (2-3 min)        │
└──────┬──────┘  └────────┬─────────┘
       │                  │
       ▼                  ▼
┌─────────────┐  ┌──────────────────┐
│ Run Tests   │  │ Dashboard Build  │
│ (1-2 min)   │  │ (2-3 min)        │
└──────┬──────┘  └────────┬─────────┘
       │                  │
       └────────┬─────────┘
                │
                ▼
        ┌──────────────────┐
        │ Generate Summary │
        │ Report (30 sec)  │
        └──────┬───────────┘
               │
               ▼
        ┌──────────────────┐
        │  All Jobs Done   │
        │  Pass ✅ / Fail ❌ │
        └──────────────────┘
```

---

## Testing Strategy

### Test Framework
- **Framework:** PlatformIO Unity
- **Type:** Unit tests with mock objects
- **Environment:** Native (host) - no hardware required
- **Assertions:** 200+ test assertions

### Test Breakdown

#### 1. Sensor Tests (30 tests)
**What:** Validate sensor reading and data conversion logic

**Tests Include:**
```
LDR Light Sensor (6 tests)
├─ Initialization
├─ Read minimum (0)
├─ Read maximum (4095)
├─ Read mid-range (2048)
└─ Consistency across reads

LM35 Temperature (9 tests)
├─ Initialization
├─ Normal temperature read (25.5°C)
├─ Body temperature (37.0°C)
├─ Fever temperature (39.5°C)
├─ Range validation (low)
├─ Range validation (normal)
├─ Range validation (high)
├─ Out of range (too low)
└─ Out of range (too high)

HC-SR04 Distance (10 tests)
├─ Initialization
├─ Read minimum distance (2cm)
├─ Read valid close distance (10.5cm)
├─ Read valid far distance (200cm)
├─ Read maximum distance (400cm)
├─ Valid distance check
├─ Too close validation
├─ Too far validation
├─ Invalid negative distance
└─ Timeout handling

Button Sensor (5 tests)
├─ Initialization
├─ Not pressed state
├─ Pressed state
├─ Released state
└─ Debounce timing
```

#### 2. Output Tests (32 tests)
**What:** Validate LED, buzzer, and LCD control logic

```
Green LED (8 tests)
├─ Initialization
├─ Turn on
├─ Turn off
├─ Toggle
├─ Brightness control
├─ Minimum brightness
├─ Maximum brightness
└─ Brightness clamping

Red LED (5 tests)
├─ Initialization
├─ Turn on
├─ Turn off
└─ Toggle

Buzzer (5 tests)
├─ Initialization
├─ Turn on
├─ Turn off
├─ Default beep (1000Hz)
├─ Custom frequency beep
├─ Low frequency
├─ High frequency
└─ Beep patterns

LCD Display (7 tests)
├─ Initialization
├─ Clear display
├─ Set cursor valid
├─ Print single line
├─ Print second line
├─ Backlight on
├─ Backlight off
└─ Backlight toggle

System Integration (7 tests)
├─ All outputs initialized
├─ Normal state configuration
├─ Danger state configuration
├─ Warning state configuration
└─ LED PWM intensity levels
```

#### 3. Integration Tests (30 tests)
**What:** Validate RTOS components (queues, semaphores, tasks)

```
Queue Tests (10 tests)
├─ Create queue
├─ Send single item
├─ Send multiple items
├─ Receive single item
├─ FIFO ordering
├─ Empty queue receive fail
├─ Full queue send fail
└─ Queue overwrite

Semaphore Tests (5 tests)
├─ Create semaphore
├─ Give signal
├─ Take signal
├─ Take when not signaled
└─ Multiple signals

Mutex Tests (5 tests)
├─ Create mutex
├─ Take lock
├─ Give unlock
├─ Take when locked fail
└─ Lock count tracking

Task Tests (7 tests)
├─ Create task
├─ Start task
├─ Stop task
├─ Execution count
├─ Priority levels
└─ Stack allocation

System Tests (3 tests)
├─ All tasks initialized
├─ Sensor data flow pipeline
├─ Emergency signal flow
└─ Serial access with mutex
```

---

## Why This Is Useful

### 1. **Catch Bugs Early**
```
Before: Push to main → Deploy → Users find bugs → Hot fix
After:  Commit → Tests fail → Fix → Pass → Deploy with confidence
```
**Benefit:** No broken code reaches production

### 2. **Prevent Regressions**
```
New Feature Written
    ↓
All 92 tests still pass → Safe to deploy
    ↓
Old code still works ✅
```
**Benefit:** Adding features doesn't break existing functionality

### 3. **Automated Quality Checks**
```
Code pushed → Instantly checked for:
├─ Compilation errors
├─ Code formatting issues
├─ Security vulnerabilities
├─ Performance problems
└─ Memory issues
```
**Benefit:** No manual code review needed for basic checks

### 4. **Continuous Monitoring**
```
Every single commit is:
├─ Compiled
├─ Tested (92+ tests)
├─ Analyzed
└─ Reported

Total time: ~10 minutes per commit
```
**Benefit:** Always know the code quality status

### 5. **Release Confidence**
```
Tag pushed (v1.0.0)
    ↓
Automatic build & test
    ↓
GitHub Release created with:
├─ Firmware binary (firmware.bin)
├─ Dashboard build
├─ Release notes
└─ Test results
```
**Benefit:** Releases are automated and reliable

### 6. **Documentation**
```
Test code serves as:
├─ Usage examples
├─ API documentation
├─ Expected behavior specification
└─ Regression prevention
```
**Benefit:** Tests are living documentation

### 7. **Team Collaboration**
```
Pull Request created
    ↓
CI/CD automatically checks
    ↓
Reviewers see:
├─ Build status: ✅ Pass
├─ Tests: ✅ 92/92 pass
├─ Code quality: ✅ No issues
└─ Changes are safe to merge
```
**Benefit:** Code reviews are faster and more confident

---

## Tools & Technologies Used

### Build Tools
| Tool | Purpose | Version |
|------|---------|---------|
| **PlatformIO** | Firmware compilation & testing | Latest |
| **Python** | Build orchestration | 3.9 |
| **CMake** (implicit) | Build system | Latest |

### Testing Tools
| Tool | Purpose | Version |
|------|---------|---------|
| **Unity Framework** | Unit testing | Latest |
| **Platform.io Test** | Test runner | Built-in |
| **Native Platform** | Host-based testing | Linux/Windows |

### Code Quality Tools
| Tool | Purpose | Version |
|------|---------|---------|
| **clang-format** | Code formatting | Latest |
| **cppcheck** | Static analysis | Latest |
| **ESLint** | JavaScript linting | 8+ |
| **Prettier** | Code formatting | Latest |
| **npm audit** | Security scanning | Built-in |
| **Snyk** | Vulnerability detection | Optional |

### Dashboard Tools
| Tool | Purpose | Version |
|------|---------|---------|
| **Node.js** | JavaScript runtime | 18 |
| **npm** | Package manager | Latest |
| **React** | UI framework | 18+ |
| **Material-UI** | Component library | 5+ |

### CI/CD Platform
| Tool | Purpose |
|------|---------|
| **GitHub Actions** | Automation orchestration |
| **GitHub Artifacts** | Build artifact storage |
| **GitHub Pages** | Dashboard hosting |
| **GitHub Releases** | Release management |

---

## GitHub Actions Integration

### What's Included in GitHub Actions

#### 1. **Main CI/CD Workflow** (`ci-cd.yml`)
Runs on every push and pull request

```yaml
Triggers:
├─ Push to main/develop
└─ Pull request to main/develop

Jobs:
├─ build-firmware
│  ├─ Compile ESP32 code
│  ├─ Run unit tests
│  └─ Upload artifacts
├─ build-dashboard
│  ├─ Build React app
│  ├─ Run linting
│  └─ Upload artifacts
├─ code-quality
│  ├─ Security scanning
│  ├─ Linting
│  └─ Analysis
├─ firmware-analysis
│  ├─ Check firmware size
│  └─ Memory analysis
└─ summary
   └─ Generate report
```

#### 2. **Release Workflow** (`release.yml`)
Runs when a tag is pushed (e.g., v1.0.0)

```yaml
Triggers:
└─ git tag v*

Jobs:
├─ Build firmware & dashboard
├─ Create GitHub Release
├─ Attach artifacts
└─ Generate release notes
```

#### 3. **Code Analysis Workflow** (`code-analysis.yml`)
Runs on pull requests

```yaml
Triggers:
└─ Pull requests to main/develop

Jobs:
├─ cpp-analysis (C++ checks)
├─ unit-tests (Run all tests)
├─ dashboard-lint (JavaScript)
├─ security-check (Vulnerabilities)
└─ documentation (Docs validation)
```

#### 4. **Dashboard Deployment** (`dashboard-deploy.yml`)
Runs when dashboard changes

```yaml
Triggers:
├─ Push to main with Dashboard/ changes
└─ Manual workflow_dispatch

Jobs:
├─ Build React app
├─ Deploy to GitHub Pages
└─ Upload artifacts
```

### Workflow Status Indicators

Each workflow shows:
```
✅ All jobs passed - Safe to merge
⚠️ Some warnings - Review recommended
❌ Job failed - Must fix before merge
```

In pull requests:
```
GitHub will show:
├─ Build status badge
├─ Test results summary
├─ Code quality report
└─ Merge safe/unsafe indicator
```

### Artifact Storage

GitHub Actions automatically stores:

| Artifact | Retention | Location |
|----------|-----------|----------|
| Firmware binary | 30 days | Actions → Artifacts |
| Dashboard build | 30 days | Actions → Artifacts |
| Test results | 30 days | Actions → Artifacts |
| Logs | 30 days | Actions → Job logs |

---

## How to Use

### 1. Local Development

**Before pushing code:**
```bash
# Windows
build.bat

# Linux/Mac
bash build.sh
```

This runs:
- Firmware compilation
- 92+ unit tests
- Code analysis
- Dashboard build

### 2. Push to GitHub

```bash
git add .
git commit -m "Add feature"
git push origin feature-branch
```

**Automatic actions:**
- ✅ CI/CD pipeline starts
- ✅ Tests run (2-3 min)
- ✅ Results appear in Actions tab
- ✅ Pull request shows status badges

### 3. Create Pull Request

```
GitHub Pull Request Created
    ↓
CI/CD runs automatically
    ↓
Status shown in PR:
├─ Build: PASSED ✅
├─ Tests: 92/92 PASSED ✅
└─ Code Quality: PASSED ✅
    ↓
Ready to merge ✅
```

### 4. Create Release

```bash
# Tag a version
git tag v1.0.0

# Push tag
git push origin v1.0.0
```

**Automatic actions:**
- ✅ Build & test everything
- ✅ Create GitHub Release
- ✅ Attach firmware binary
- ✅ Attach dashboard build
- ✅ Generate release notes

### 5. Monitor Results

**In GitHub:**
1. Go to "Actions" tab
2. Select workflow run
3. View job logs and results
4. Download artifacts

**In Pull Requests:**
1. Scroll to checks section
2. See all CI/CD status
3. View detailed logs

---

## Workflow Examples

### Example 1: Normal Development

```
Day 1:
$ git checkout -b feature/new-sensor
$ # Write code and tests
$ bash build.sh  # Test locally
$ # Tests pass!
$ git push origin feature/new-sensor

GitHub:
- Actions tab shows build starting
- Email notification sent
- 5 minutes later: All tests pass ✅
- PR ready for review

Day 2:
- Code review approved
- Merge button available (all checks pass)
- Click merge
- Main branch updated
```

### Example 2: Bug Found in Tests

```
Developer pushes code
    ↓
GitHub Actions starts
    ↓
Test fails: "test_lm35_range_validation_too_high"
    ↓
Email notification sent with error details:
"Expected STATE_DANGER for temp=160°C
 Actual: STATE_WARNING"
    ↓
Developer runs locally:
$ platformio test -e test-native
    ↓
Sees same failure
    ↓
Fixes code
    ↓
$ bash build.sh
    ↓
Tests pass locally ✅
    ↓
$ git push
    ↓
GitHub Actions re-runs tests
    ↓
All pass ✅
```

### Example 3: Release Process

```
$ git tag v1.0.0
$ git push origin v1.0.0

GitHub Actions:
├─ Compiles firmware
├─ Runs all 92 tests
├─ Analyzes code quality
├─ Builds dashboard
└─ Creates GitHub Release

GitHub Release page shows:
┌────────────────────────────┐
│ v1.0.0 Release             │
├────────────────────────────┤
│ Smart Patient Monitor      │
│                            │
│ Artifacts:                 │
│ • firmware.bin (256KB)     │
│ • dashboard-build.zip      │
│ • test-results.txt         │
│                            │
│ Test Status: ✅ 92/92 PASS │
│ Code Quality: ✅ PASS      │
└────────────────────────────┘
```

### Example 4: Pull Request Review

```
Developer creates PR
    ↓
GitHub shows checks:
┌──────────────────────────────┐
│ Checks (6)                   │
├──────────────────────────────┤
│ ✅ build-firmware (2m 30s)  │
│ ✅ run-tests (1m 45s)       │
│ ✅ code-analysis (2m 10s)   │
│ ✅ code-quality (1m 30s)    │
│ ✅ dashboard-lint (2m)      │
│ ✅ summary (30s)            │
├──────────────────────────────┤
│ Result: All checks passed ✅ │
│ Ready to merge               │
└──────────────────────────────┘

Reviewer can:
1. See all checks passed
2. Review code with confidence
3. Click "Merge pull request"
4. Code goes to main ✅
```

---

## Continuous Integration Flow Diagram

```
┌─────────────────────────────────────────────────┐
│         Developer's Local Machine               │
├─────────────────────────────────────────────────┤
│ 1. Write code                                   │
│ 2. Run local tests: bash build.sh              │
│ 3. All tests pass ✅                            │
│ 4. git commit & push                            │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│         GitHub Repository (main)                │
├─────────────────────────────────────────────────┤
│ Code received                                   │
│ Webhook triggered                               │
└─────────────┬───────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────┐
│      GitHub Actions (Automated CI/CD)           │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────┐  ┌────────────┐                │
│  │ Build Fw   │  │ Code       │                │
│  │ (Parallel) │  │ Analysis   │                │
│  └────┬───────┘  └────┬───────┘                │
│       │               │                         │
│  ┌────▼───────┐  ┌────▼───────┐                │
│  │ Run Tests  │  │ Dashboard  │                │
│  │ 92 cases   │  │ Build      │                │
│  └────┬───────┘  └────┬───────┘                │
│       │               │                         │
│       └────┬──────────┘                         │
│            │                                   │
│  ┌─────────▼──────────┐                        │
│  │ Generate Report    │                        │
│  │ & Summary          │                        │
│  └─────────┬──────────┘                        │
│            │                                   │
└────────────┼──────────────────────────────────┘
             │
      ┌──────▴──────┐
      │             │
      ▼             ▼
  ┌───────┐    ┌────────┐
  │ ✅    │    │ ❌     │
  │ PASS  │    │ FAIL   │
  │       │    │        │
  │Can    │    │Blocks  │
  │Merge  │    │Merge   │
  └───────┘    └────────┘
```

---

## Key Benefits Summary

| Benefit | How Achieved | Impact |
|---------|-------------|--------|
| **Quality** | 92+ tests | Catches bugs before deployment |
| **Reliability** | Automated testing | No manual testing needed |
| **Speed** | Parallel jobs | 10 min full pipeline |
| **Safety** | Regression tests | Old features still work |
| **Security** | Automated scanning | Vulnerabilities caught early |
| **Confidence** | PR checks | Code review is safer |
| **Documentation** | Test code | Tests show how to use APIs |
| **Releases** | Automated | Consistent, reliable releases |

---

## Quick Reference

### Commands
```bash
# Build & test locally
bash build.sh              # Linux/Mac
build.bat                  # Windows

# Run specific tests
platformio test -e test-native -f test_sensors

# View test results
platformio test -e test-native --verbose
```

### GitHub Actions Monitoring
1. **Actions Tab:** See all workflow runs
2. **PR Checks:** See status in pull requests
3. **Artifacts:** Download build outputs
4. **Logs:** View detailed job logs
5. **Email:** Receive notifications

### File Locations
```
Workflows: .github/workflows/
Tests:     test/
Config:    platformio.ini
Docs:      TEST_SUITE.md, TEST_SUMMARY.md
```

---

**Last Updated:** May 15, 2026  
**Status:** ✅ Fully Operational
