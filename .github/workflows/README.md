# Smart Patient Monitor - CI/CD Pipeline Documentation

## Overview

This project includes an automated CI/CD pipeline using GitHub Actions that:
- ✅ Builds ESP32 firmware
- ✅ Builds React dashboard
- ✅ Runs code quality checks
- ✅ Performs security scanning
- ✅ Analyzes firmware size
- ✅ Creates releases with artifacts
- ✅ Deploys dashboard to GitHub Pages

## Workflows

### 1. **Main CI/CD Pipeline** (`ci-cd.yml`)
**Triggers:** `push` to main/develop, `pull_request`

**Jobs:**
- **Build Firmware** - Compiles ESP32 firmware using PlatformIO
- **Build Dashboard** - Builds React application with npm
- **Code Quality** - Runs security and linting checks
- **Firmware Analysis** - Analyzes firmware size
- **Summary** - Generates build summary report

### 2. **Release Build** (`release.yml`)
**Triggers:** When a tag is pushed (v*)

**Jobs:**
- Builds both firmware and dashboard
- Creates GitHub Release with binary artifacts
- Automatically generates release notes

**Usage:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 3. **Dashboard Deployment** (`dashboard-deploy.yml`)
**Triggers:** Push to main branch in Dashboard folder, or manual trigger

**Jobs:**
- Builds React dashboard
- Deploys to GitHub Pages
- Uploads build artifacts

### 4. **Code Analysis** (`code-analysis.yml`)
**Triggers:** Pull requests and pushes to main/develop

**Jobs:**
- C++ code formatting check (clang-format)
- Static analysis with cppcheck
- JavaScript/React linting
- Security vulnerability scanning (Snyk)
- Documentation validation

## Setup Instructions

### 1. Enable GitHub Pages (Optional)
For dashboard deployment to GitHub Pages:
1. Go to Settings → Pages
2. Select "Deploy from a branch"
3. Choose "gh-pages" branch and "/root` directory

### 2. Configure Secrets (Optional)
For enhanced security scanning:
1. Go to Settings → Secrets and variables → Actions
2. Add `SNYK_TOKEN` if using Snyk security scanning

### 3. Default Behavior
All workflows run automatically on:
- Every push to `main` or `develop` branches
- Every pull request
- Manual trigger (workflow_dispatch)

## Build Artifacts

### Firmware Artifacts
- Location: `.pio/build/esp32dev/firmware.bin`
- Retention: 30 days
- Flash to ESP32 using:
  ```bash
  esptool.py --chip esp32 --port /dev/ttyUSB0 write_flash -z 0x1000 firmware.bin
  ```

### Dashboard Artifacts
- Location: `Dashboard/esp32-dashboard/build/`
- Retention: 30 days
- Can be deployed to any web server

## Status Badges

Add these badges to your README:

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/SmartPatientMonitor/actions/workflows/ci-cd.yml/badge.svg)
![Code Analysis](https://github.com/YOUR_USERNAME/SmartPatientMonitor/actions/workflows/code-analysis.yml/badge.svg)
```

## Environment Variables

The workflows use the following environment setup:
- **Python:** 3.9
- **Node.js:** 18
- **PlatformIO:** Latest
- **ESP32 Board:** esp32dev

## Troubleshooting

### Firmware Build Fails
- Check `platformio.ini` configuration
- Verify all dependencies are listed in `platformio.ini`
- Check for C++ syntax errors in `src/` and `include/`

### Dashboard Build Fails
- Verify `package.json` is in `Dashboard/esp32-dashboard/`
- Check for missing npm dependencies
- Verify React component syntax

### Action Not Running
1. Verify workflow file syntax (YAML format)
2. Check branch name matches trigger conditions
3. View Actions tab for error messages

### Artifact Not Found
- Builds may fail silently; check Actions logs
- Verify file paths match your project structure
- Check artifact retention settings

## Performance Tips

1. **Cache Dependencies:**
   - npm dependencies are cached automatically
   - PlatformIO libraries are fetched fresh each time

2. **Parallel Execution:**
   - Most jobs run in parallel for faster feedback
   - Dependencies ensure correct execution order

3. **Artifact Cleanup:**
   - Artifacts are automatically deleted after 30 days
   - Download artifacts before expiration

## Manual Trigger

To manually trigger a workflow:
```bash
gh workflow run dashboard-deploy.yml
```

Or use GitHub UI:
1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"

## Next Steps

1. Push code to repository: `git push origin main`
2. View Actions tab to monitor builds
3. Download artifacts from completed workflows
4. Create a release by pushing a version tag

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PlatformIO CI/CD Integration](https://docs.platformio.org/en/latest/integration/ci/index.html)
- [Node.js with GitHub Actions](https://github.com/actions/setup-node)
