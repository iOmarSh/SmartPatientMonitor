# CI/CD Configuration Guide

## Quick Start

The CI/CD pipeline is now configured for your Smart Patient Monitor project. Here's what happens automatically:

### On Every Push to `main` or `develop`:
1. ✅ ESP32 firmware compiles with PlatformIO
2. ✅ React dashboard builds
3. ✅ Code quality checks run
4. ✅ Security scans execute
5. ✅ Firmware size is analyzed

### On Pull Requests:
- All above steps + code analysis with detailed reports
- Results shown in PR comments

### On Version Tag (v1.0.0):
- Automated GitHub Release created
- Firmware binary attached
- Dashboard files included

## File Structure Created

```
.github/
└── workflows/
    ├── ci-cd.yml              # Main CI/CD pipeline
    ├── release.yml            # Release creation workflow
    ├── dashboard-deploy.yml   # Dashboard deployment
    ├── code-analysis.yml      # Code quality & security
    └── README.md              # Workflow documentation
```

## Quick Configuration

### 1. Update Repository Settings
No additional configuration needed! The workflows are ready to go.

### 2. (Optional) GitHub Pages Deployment
If you want to auto-deploy the dashboard:
1. Go to **Settings → Pages**
2. Select **Deploy from a branch**
3. Choose **gh-pages** branch

### 3. (Optional) Security Token
For advanced security scanning with Snyk:
1. Create account at snyk.io
2. Go to **Settings → Secrets**
3. Add `SNYK_TOKEN` secret

## Customization

### Change Build Triggers
Edit `.github/workflows/ci-cd.yml`:
```yaml
on:
  push:
    branches: [ main, develop, staging ]  # Add more branches
```

### Change Node/Python Versions
Edit version numbers in any `.yml` file:
```yaml
- uses: actions/setup-python@v4
  with:
    python-version: '3.10'  # Change version
```

### Add Deployment
Uncomment the dashboard deploy step in `ci-cd.yml` to auto-deploy on main branch

## Status Badges for README

Add these to your main `readme.md`:

```markdown
## Build Status

[![CI/CD Pipeline](https://github.com/USERNAME/SmartPatientMonitor/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/USERNAME/SmartPatientMonitor/actions/workflows/ci-cd.yml)
[![Code Analysis](https://github.com/USERNAME/SmartPatientMonitor/actions/workflows/code-analysis.yml/badge.svg)](https://github.com/USERNAME/SmartPatientMonitor/actions/workflows/code-analysis.yml)
```

*Replace `USERNAME` with your GitHub username*

## Monitoring Builds

1. Go to **Actions** tab in your GitHub repository
2. View real-time build logs
3. Download build artifacts
4. See detailed error messages if builds fail

## Typical Workflow

```bash
# Create feature branch
git checkout -b feature/new-sensor

# Make changes
echo "code changes"

# Push to GitHub
git push origin feature/new-sensor

# CI/CD runs automatically ✅
# Once approved, merge to main
# Dashboard automatically deploys 🚀

# For releases
git tag v1.0.0
git push origin v1.0.0
# GitHub Release created automatically 📦
```

## Need Help?

Check the `.github/workflows/README.md` file for detailed documentation on each workflow.

---
**Last Updated:** May 15, 2026
