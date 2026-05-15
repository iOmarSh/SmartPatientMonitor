#!/usr/bin/env python3
"""
Hardware Integration Test Framework for Smart Patient Monitor
Automates firmware flashing, serial communication, and test verification
"""

import serial
import time
import sys
import json
import subprocess
import argparse
import os
from datetime import datetime
from pathlib import Path

class HardwareTestFramework:
    """Framework for hardware testing via serial port"""
    
    def __init__(self, port='COM3', baudrate=115200, timeout=2):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.ser = None
        self.test_results = []
        self.firmware_path = None
    
    def connect(self):
        """Connect to ESP32 via serial port"""
        try:
            self.ser = serial.Serial(self.port, self.baudrate, timeout=self.timeout)
            time.sleep(2)  # Wait for connection to stabilize
            print(f"✅ Connected to {self.port} at {self.baudrate} baud")
            return True
        except serial.SerialException as e:
            print(f"❌ Failed to connect to {self.port}: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from serial port"""
        if self.ser:
            self.ser.close()
            print("✅ Disconnected")
    
    def flash_firmware(self, firmware_path):
        """Flash firmware to ESP32 using esptool.py"""
        if not os.path.exists(firmware_path):
            print(f"❌ Firmware file not found: {firmware_path}")
            return False
        
        self.firmware_path = firmware_path
        
        try:
            print(f"📥 Flashing firmware from {firmware_path}...")
            
            cmd = [
                'esptool.py',
                '--chip', 'esp32',
                '--port', self.port,
                '--baud', '460800',
                '--before', 'default_reset',
                '--after', 'hard_reset',
                'write_flash',
                '-z',
                '--flash_mode', 'dio',
                '--flash_freq', '40m',
                '--flash_size', 'detect',
                '0x1000', firmware_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                print("✅ Firmware flashed successfully")
                time.sleep(2)  # Wait for device to restart
                return True
            else:
                print(f"❌ Flash failed: {result.stderr}")
                return False
        except FileNotFoundError:
            print("❌ esptool.py not found. Install: pip install esptool")
            return False
        except subprocess.TimeoutExpired:
            print("❌ Flashing timeout")
            return False
    
    def read_serial_output(self, duration=5, buffer_size=1024):
        """Read serial output for specified duration"""
        if not self.ser:
            print("❌ Not connected to serial port")
            return []
        
        print(f"📖 Reading serial output for {duration}s...")
        lines = []
        start_time = time.time()
        
        while time.time() - start_time < duration:
            try:
                if self.ser.in_waiting:
                    line = self.ser.readline().decode('utf-8', errors='ignore').strip()
                    if line:
                        lines.append(line)
                        print(f"  {line}")
                time.sleep(0.01)
            except Exception as e:
                print(f"⚠️ Error reading serial: {e}")
        
        return lines
    
    def send_test_command(self, command):
        """Send test command to ESP32"""
        if not self.ser:
            print("❌ Not connected to serial port")
            return False
        
        try:
            self.ser.write(f"{command}\n".encode())
            print(f"📤 Sent: {command}")
            time.sleep(0.5)
            return True
        except Exception as e:
            print(f"❌ Failed to send command: {e}")
            return False
    
    def test_sensor_readings(self):
        """Test sensor functionality"""
        print("\n🔬 TEST 1: Sensor Readings")
        print("-" * 50)
        
        results = {
            'test_name': 'Sensor Readings',
            'timestamp': datetime.now().isoformat(),
            'commands': [
                ('GetTemp', 'Get temperature reading'),
                ('GetLight', 'Get light sensor reading'),
                ('GetDist', 'Get distance reading'),
                ('GetBtn', 'Get button status')
            ],
            'output': []
        }
        
        for cmd, description in results['commands']:
            print(f"  → {description} ({cmd})")
            self.send_test_command(cmd)
            output = self.read_serial_output(duration=2)
            results['output'].append({
                'command': cmd,
                'response': output
            })
        
        return results
    
    def test_output_controls(self):
        """Test LED, Buzzer, LCD controls"""
        print("\n💡 TEST 2: Output Controls")
        print("-" * 50)
        
        results = {
            'test_name': 'Output Controls',
            'timestamp': datetime.now().isoformat(),
            'tests': []
        }
        
        controls = [
            ('LED_GREEN_ON', 'Turn green LED on'),
            ('LED_GREEN_OFF', 'Turn green LED off'),
            ('LED_RED_ON', 'Turn red LED on'),
            ('LED_RED_OFF', 'Turn red LED off'),
            ('BUZZER_ON', 'Turn buzzer on'),
            ('BUZZER_OFF', 'Turn buzzer off'),
            ('LCD_CLEAR', 'Clear LCD display'),
        ]
        
        for cmd, description in controls:
            print(f"  → {description}")
            self.send_test_command(cmd)
            output = self.read_serial_output(duration=1)
            results['tests'].append({
                'control': cmd,
                'description': description,
                'response': output,
                'pass': len(output) > 0
            })
        
        return results
    
    def test_state_transitions(self):
        """Test system state transitions"""
        print("\n🔄 TEST 3: State Transitions")
        print("-" * 50)
        
        results = {
            'test_name': 'State Transitions',
            'timestamp': datetime.now().isoformat(),
            'transitions': []
        }
        
        states = [
            ('SET_STATE_NORMAL', 'Set NORMAL state'),
            ('SET_STATE_WARNING', 'Set WARNING state'),
            ('SET_STATE_DANGER', 'Set DANGER state'),
            ('SET_STATE_EMERGENCY', 'Set EMERGENCY state'),
        ]
        
        for cmd, description in states:
            print(f"  → {description}")
            self.send_test_command(cmd)
            output = self.read_serial_output(duration=1)
            results['transitions'].append({
                'state_cmd': cmd,
                'description': description,
                'output': output
            })
        
        return results
    
    def test_queue_operations(self):
        """Test queue send/receive operations"""
        print("\n📤 TEST 4: Queue Operations")
        print("-" * 50)
        
        results = {
            'test_name': 'Queue Operations',
            'timestamp': datetime.now().isoformat(),
            'operations': []
        }
        
        for i in range(5):
            print(f"  → Queue operation {i+1}/5")
            self.send_test_command('QUEUE_SEND')
            time.sleep(0.2)
            output = self.read_serial_output(duration=1)
            results['operations'].append({
                'operation': f'send_{i}',
                'output': output
            })
        
        return results
    
    def test_emergency_button(self):
        """Test emergency button handling"""
        print("\n🆘 TEST 5: Emergency Button")
        print("-" * 50)
        
        results = {
            'test_name': 'Emergency Button',
            'timestamp': datetime.now().isoformat(),
            'note': 'Physically press button on ESP32 within 10 seconds'
        }
        
        print("  ⏱️  Waiting for button press (10 seconds)...")
        output = self.read_serial_output(duration=10)
        
        has_emergency = any('Emergency' in line or 'EMERGENCY' in line for line in output)
        
        results['detected_emergency'] = has_emergency
        results['output'] = output
        
        return results
    
    def test_timing_accuracy(self):
        """Test timing and synchronization"""
        print("\n⏱️  TEST 6: Timing Accuracy")
        print("-" * 50)
        
        results = {
            'test_name': 'Timing Accuracy',
            'timestamp': datetime.now().isoformat(),
            'measurements': []
        }
        
        print("  → Measuring task execution intervals...")
        output = self.read_serial_output(duration=5)
        
        # Parse timing information from output
        for line in output:
            if '[' in line and ']' in line:
                # Extract timestamp
                try:
                    start = line.find('[') + 1
                    end = line.find(']')
                    timestamp = int(line[start:end])
                    results['measurements'].append(timestamp)
                except:
                    pass
        
        if len(results['measurements']) > 1:
            intervals = [results['measurements'][i+1] - results['measurements'][i] 
                        for i in range(len(results['measurements'])-1)]
            results['avg_interval'] = sum(intervals) / len(intervals) if intervals else 0
            results['intervals'] = intervals
        
        return results
    
    def test_stress_conditions(self):
        """Test system under stress"""
        print("\n⚙️  TEST 7: Stress Conditions")
        print("-" * 50)
        
        results = {
            'test_name': 'Stress Conditions',
            'timestamp': datetime.now().isoformat(),
            'duration': 10,
            'rapid_commands': 0
        }
        
        print("  → Sending rapid commands for 10 seconds...")
        start_time = time.time()
        command_count = 0
        
        while time.time() - start_time < 10:
            self.send_test_command(f'STRESS_TEST_{command_count}')
            output = self.read_serial_output(duration=0.2)
            results['rapid_commands'] = command_count
            command_count += 1
        
        return results

    def test_memory_usage(self):
        """Verify task stack usage via high water marks"""
        print("\n🧠 TEST 8: Memory & Stack Analysis")
        print("-" * 50)
        
        results = {
            'test_name': 'Memory Analysis',
            'timestamp': datetime.now().isoformat(),
            'watermarks': {}
        }
        
        print("  → Waiting for diagnostic log...")
        # The ESP32 logs every 30s, but we've already waited during stress tests.
        # We'll read for 5s to see if a log is in the buffer or coming soon.
        output = self.read_serial_output(duration=5)
        
        found_diag = False
        for line in output:
            if "bytes free" in line:
                found_diag = True
                try:
                    parts = line.split(':')
                    task_name = parts[0].strip()
                    watermark = int(parts[1].split()[0])
                    results['watermarks'][task_name] = watermark
                    print(f"    {task_name}: {watermark} bytes free")
                except:
                    pass
        
        if not found_diag:
            print("  ⚠️ No stack diagnostic log found in recent output")
        
        results['pass'] = len(results['watermarks']) > 0
        return results
    
    def run_all_tests(self):
        """Run all hardware integration tests"""
        print("\n" + "="*70)
        print("SMART PATIENT MONITOR - HARDWARE INTEGRATION TESTS")
        print("="*70)
        
        if not self.connect():
            return False
        
        try:
            # Run tests
            self.test_results.append(self.test_sensor_readings())
            self.test_results.append(self.test_output_controls())
            self.test_results.append(self.test_state_transitions())
            self.test_results.append(self.test_queue_operations())
            self.test_results.append(self.test_emergency_button())
            self.test_results.append(self.test_timing_accuracy())
            self.test_results.append(self.test_stress_conditions())
            self.test_results.append(self.test_memory_usage())
            
            return True
        finally:
            self.disconnect()
    
    def generate_report(self, output_file='hardware_test_report.json'):
        """Generate test report"""
        report = {
            'metadata': {
                'test_suite': 'Hardware Integration Tests',
                'timestamp': datetime.now().isoformat(),
                'firmware': self.firmware_path,
                'port': self.port,
                'baudrate': self.baudrate
            },
            'tests': self.test_results,
            'summary': {
                'total_tests': len(self.test_results),
                'passed': len([t for t in self.test_results if 'pass' in str(t).lower()]),
                'timestamp': datetime.now().isoformat()
            }
        }
        
        try:
            with open(output_file, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"\n✅ Report saved to {output_file}")
            return True
        except IOError as e:
            print(f"❌ Failed to save report: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(
        description='Hardware Integration Tests for Smart Patient Monitor'
    )
    parser.add_argument('--port', '-p', default='COM3',
                       help='Serial port (default: COM3)')
    parser.add_argument('--firmware', '-f', default='.pio/build/esp32dev/firmware.bin',
                       help='Firmware file path')
    parser.add_argument('--baud', '-b', type=int, default=115200,
                       help='Baud rate (default: 115200)')
    parser.add_argument('--flash', action='store_true',
                       help='Flash firmware before testing')
    parser.add_argument('--report', '-r', default='hardware_test_report.json',
                       help='Report output file')
    
    args = parser.parse_args()
    
    framework = HardwareTestFramework(
        port=args.port,
        baudrate=args.baud
    )
    
    framework.firmware_path = args.firmware
    
    # Flash if requested
    if args.flash:
        if not framework.connect():
            return 1
        
        success = framework.flash_firmware(args.firmware)
        framework.disconnect()
        
        if not success:
            return 1
        
        print("\n⏳ Waiting 5 seconds before testing...")
        time.sleep(5)
    
    # Run tests
    if not framework.run_all_tests():
        return 1
    
    # Generate report
    framework.generate_report(args.report)
    
    print("\n" + "="*70)
    print("Hardware integration tests completed!")
    print("="*70 + "\n")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
