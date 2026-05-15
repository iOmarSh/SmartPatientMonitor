#!/usr/bin/env python3
"""
Master Validation Script for Smart Patient Monitor
Orchestrates the entire pipeline: Build -> Unit Test -> Flash -> Integration Test -> Analysis -> Report
"""

import subprocess
import sys
import os
import time
import json
from datetime import datetime
from pathlib import Path

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(message):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}")
    print(f" {message}")
    print(f"{'='*70}{Colors.ENDC}")

def run_command(cmd, description, cwd=None):
    print(f"{Colors.OKBLUE}🚀 {description}...{Colors.ENDC}")
    try:
        # Using shell=True for complex commands if needed, but list is safer
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd)
        if result.returncode == 0:
            print(f"{Colors.OKGREEN}✅ Success!{Colors.ENDC}")
            return True, result.stdout
        else:
            print(f"{Colors.FAIL}❌ Failed!{Colors.ENDC}")
            print(f"{Colors.FAIL}Error: {result.stderr}{Colors.ENDC}")
            return False, result.stderr
    except Exception as e:
        print(f"{Colors.FAIL}❌ Exception: {e}{Colors.ENDC}")
        return False, str(e)

def main():
    start_time = time.time()
    results = {
        "timestamp": datetime.now().isoformat(),
        "phases": {}
    }

    print_header("SMART PATIENT MONITOR - MASTER VALIDATION PIPELINE")

    # Phase 1: Unit Tests (Native)
    print_header("PHASE 1: NATIVE UNIT TESTS")
    success, output = run_command(["platformio", "test", "-e", "test-native"], "Running Unity tests on host")
    results["phases"]["unit_tests"] = {"success": success, "output": output}
    if not success:
        print(f"{Colors.WARNING}⚠️ Unit tests failed, but continuing to integration...{Colors.ENDC}")

    # Phase 2: Build Firmware
    print_header("PHASE 2: FIRMWARE BUILD")
    success, output = run_command(["platformio", "run"], "Compiling ESP32 firmware")
    results["phases"]["build"] = {"success": success, "output": output}
    if not success:
        print(f"{Colors.FAIL}🛑 Build failed. Aborting pipeline.{Colors.ENDC}")
        sys.exit(1)

    # Phase 3: Hardware Integration Tests
    # Note: Requires ESP32 connected to COM3 (default)
    print_header("PHASE 3: HARDWARE INTEGRATION")
    print(f"{Colors.OKBLUE}Attempting to flash and test on hardware...{Colors.ENDC}")
    success, output = run_command([
        "python", "scripts/hardware_integration_test.py", 
        "--flash", 
        "--report", "reports/hardware_report.json"
    ], "Flashing and executing hardware test suite")
    results["phases"]["hardware_tests"] = {"success": success, "output": output}

    # Phase 4: Timing and Performance Analysis
    print_header("PHASE 4: PERFORMANCE ANALYSIS")
    # We use a dummy log or the output from the previous step if captured
    # For now, we'll assume the hardware test saved a log or we can parse its output
    success, output = run_command([
        "python", "scripts/timing_log_parser.py", 
        "--json", "reports/timing_report.json"
    ], "Analyzing serial logs for timing violations")
    results["phases"]["analysis"] = {"success": success, "output": output}

    # Phase 5: Report Generation
    print_header("PHASE 5: FINAL REPORT GENERATION")
    success, output = run_command([
        "python", "scripts/html_report_generator.py", 
        "reports/hardware_report.json", 
        "reports/final_validation_report.html"
    ], "Generating consolidated HTML report")
    results["phases"]["report"] = {"success": success, "output": output}

    # Summary
    total_time = time.time() - start_time
    print_header("VALIDATION SUMMARY")
    
    overall_success = all(p["success"] for p in results["phases"].values())
    
    for phase, data in results["phases"].items():
        status = f"{Colors.OKGREEN}PASS{Colors.ENDC}" if data["success"] else f"{Colors.FAIL}FAIL{Colors.ENDC}"
        print(f"  - {phase.replace('_', ' ').title():<20} : {status}")

    print(f"\nTotal Execution Time: {total_time:.2f}s")
    
    if overall_success:
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}🏆 ALL SYSTEMS GO! FIRMWARE IS READY FOR RELEASE.{Colors.ENDC}\n")
    else:
        print(f"\n{Colors.WARNING}{Colors.BOLD}⚠️ SOME PHASES FAILED. CHECK THE LOGS BEFORE RELEASE.{Colors.ENDC}\n")

    # Save master result
    os.makedirs("reports", exist_ok=True)
    with open("reports/master_results.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    main()
