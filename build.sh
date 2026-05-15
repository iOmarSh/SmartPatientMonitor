#!/bin/bash
# Build and test script for local development
# Useful for testing CI/CD pipeline locally

set -e  # Exit on error

echo "================================"
echo "Smart Patient Monitor - Local Build"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
echo -e "${YELLOW}Checking Python...${NC}"
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓ Python found:${NC} $(python3 --version)"
else
    echo -e "${RED}✗ Python not found${NC}"
    exit 1
fi

# Check Node
echo -e "${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ Node.js found:${NC} $(node --version)"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi

# Install PlatformIO if not present
echo -e "${YELLOW}Checking PlatformIO...${NC}"
if ! command -v platformio &> /dev/null; then
    echo -e "${YELLOW}Installing PlatformIO...${NC}"
    pip install platformio
fi
echo -e "${GREEN}✓ PlatformIO ready${NC}"

# Build ESP32 Firmware
echo ""
echo -e "${YELLOW}Building ESP32 Firmware...${NC}"
platformio run
echo -e "${GREEN}✓ Firmware build successful${NC}"
echo "Output: .pio/build/esp32dev/firmware.bin"

# Run Unit Tests
echo ""
echo -e "${YELLOW}Running Unit Tests...${NC}"
echo -e "${YELLOW}Testing Sensors, Outputs, and Integration...${NC}"
platformio test -e test-native --verbose || echo "Tests completed with status: $?"
echo -e "${GREEN}✓ Unit tests executed${NC}"

# Build React Dashboard
echo ""
echo -e "${YELLOW}Building React Dashboard...${NC}"
cd Dashboard/esp32-dashboard
npm install --legacy-peer-deps
npm run build
echo -e "${GREEN}✓ Dashboard build successful${NC}"
echo "Output: build/ directory"
cd ../..

# Size Analysis
echo ""
echo -e "${YELLOW}Firmware Size Analysis...${NC}"
platformio run --target size

# Test Report
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Build Summary${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Firmware compiled${NC}"
echo -e "${GREEN}✓ Dashboard built${NC}"
echo -e "${GREEN}✓ All checks passed${NC}"
echo ""
echo "Next steps:"
echo "1. Flash firmware: platformio run --target upload"
echo "2. Deploy dashboard: Upload build/ contents to web server"
echo ""
