#!/usr/bin/env python3
"""
Timing Log Parser for Smart Patient Monitor
Analyzes serial logs to extract timing information and performance metrics
"""

import re
import sys
import json
import argparse
from datetime import datetime
from collections import defaultdict

class TimingLogParser:
    """Parse and analyze timing logs from ESP32 serial output"""
    
    def __init__(self, log_file=None):
        self.log_file = log_file
        self.events = []
        self.timing_data = defaultdict(list)
        self.errors = []
        self.warnings = []
    
    def parse_log_line(self, line):
        """
        Parse a single log line
        Expected format: [timestamp] [TaskName] message
        Example: [1000] [SensorQueue] SEND OK | T=36.5 C | LDR=300 | DIST=45.0 cm
        """
        # Match timestamp and task name
        pattern = r'\[(\d+)\]\s*\[([^\]]+)\]\s*(.*)'
        match = re.match(pattern, line)
        
        if not match:
            return None
        
        timestamp = int(match.group(1))
        task_name = match.group(2)
        message = match.group(3)
        
        return {
            'timestamp': timestamp,
            'task': task_name,
            'message': message,
            'raw': line
        }
    
    def extract_sensor_data(self, message):
        """Extract sensor readings from message"""
        data = {}
        
        # Temperature
        temp_match = re.search(r'T=([\d.]+)\s*C', message)
        if temp_match:
            data['temperature'] = float(temp_match.group(1))
        
        # Light level
        ldr_match = re.search(r'LDR=([\d]+)', message)
        if ldr_match:
            data['light'] = int(ldr_match.group(1))
        
        # Distance
        dist_match = re.search(r'DIST=([\d.]+|Err)\s*cm', message)
        if dist_match:
            dist_val = dist_match.group(1)
            data['distance'] = float(dist_val) if dist_val != 'Err' else -1.0
        
        # Button
        btn_match = re.search(r'BTN=(PRESSED|RELEASED)', message)
        if btn_match:
            data['button'] = btn_match.group(1)
        
        return data
    
    def analyze_queue_timing(self, events):
        """Analyze queue send/receive timing"""
        send_events = {}
        latencies = []
        
        for event in events:
            if 'SensorQueue' in event['task']:
                if 'SEND OK' in event['message']:
                    send_events[event['timestamp']] = event
                elif 'RECV OK' in event['message']:
                    # Find corresponding send
                    for send_ts, send_event in send_events.items():
                        if send_ts < event['timestamp']:
                            latency = event['timestamp'] - send_ts
                            latencies.append({
                                'send_time': send_ts,
                                'recv_time': event['timestamp'],
                                'latency_ms': latency
                            })
        
        return {
            'total_transfers': len(latencies),
            'avg_latency_ms': sum(l['latency_ms'] for l in latencies) / len(latencies) if latencies else 0,
            'min_latency_ms': min(l['latency_ms'] for l in latencies) if latencies else 0,
            'max_latency_ms': max(l['latency_ms'] for l in latencies) if latencies else 0,
            'latencies': latencies
        }
    
    def analyze_task_frequency(self, events):
        """Analyze how often each task executes"""
        task_executions = defaultdict(list)
        
        for event in events:
            task_name = event['task']
            task_executions[task_name].append(event['timestamp'])
        
        analysis = {}
        for task, timestamps in task_executions.items():
            if len(timestamps) > 1:
                intervals = [timestamps[i+1] - timestamps[i] for i in range(len(timestamps)-1)]
                analysis[task] = {
                    'executions': len(timestamps),
                    'avg_interval_ms': sum(intervals) / len(intervals) if intervals else 0,
                    'min_interval_ms': min(intervals) if intervals else 0,
                    'max_interval_ms': max(intervals) if intervals else 0,
                    'timestamps': timestamps
                }
        
        return analysis
    
    def analyze_temperature_trend(self, events):
        """Analyze temperature readings over time"""
        temp_readings = []
        
        for event in events:
            data = self.extract_sensor_data(event['message'])
            if 'temperature' in data:
                temp_readings.append({
                    'timestamp': event['timestamp'],
                    'temperature': data['temperature'],
                    'task': event['task']
                })
        
        if not temp_readings:
            return None
        
        temps = [r['temperature'] for r in temp_readings]
        return {
            'readings': len(temp_readings),
            'avg_temperature': sum(temps) / len(temps),
            'min_temperature': min(temps),
            'max_temperature': max(temps),
            'data': temp_readings
        }
    
    def detect_anomalies(self, events):
        """Detect anomalies in logs"""
        anomalies = []
        
        for event in events:
            # Check for failures
            if 'SEND FAIL' in event['message']:
                anomalies.append({
                    'type': 'queue_full',
                    'timestamp': event['timestamp'],
                    'task': event['task'],
                    'message': event['message']
                })
            
            # Check for timeouts
            if 'Timeout' in event['message'] or 'timeout' in event['message']:
                anomalies.append({
                    'type': 'timeout',
                    'timestamp': event['timestamp'],
                    'task': event['task'],
                    'message': event['message']
                })
            
            # Check for errors
            if 'ERR' in event['message'] or 'Error' in event['message']:
                anomalies.append({
                    'type': 'error',
                    'timestamp': event['timestamp'],
                    'task': event['task'],
                    'message': event['message']
                })
            
            # Check for invalid sensor readings
            if 'DIST=Err' in event['message']:
                anomalies.append({
                    'type': 'sensor_error',
                    'timestamp': event['timestamp'],
                    'task': event['task'],
                    'message': 'Distance sensor error'
                })
        
        return anomalies
    
    def parse_file(self):
        """Parse entire log file"""
        if not self.log_file:
            return False
        
        try:
            with open(self.log_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    
                    event = self.parse_log_line(line)
                    if event:
                        self.events.append(event)
            
            return True
        except FileNotFoundError:
            print(f"Error: Log file '{self.log_file}' not found")
            return False
    
    def parse_stdin(self):
        """Parse from standard input"""
        try:
            for line in sys.stdin:
                line = line.strip()
                if not line:
                    continue
                
                event = self.parse_log_line(line)
                if event:
                    self.events.append(event)
            
            return True
        except KeyboardInterrupt:
            return True
    
    def generate_report(self):
        """Generate comprehensive timing report"""
        if not self.events:
            return "No events parsed"
        
        report = {
            'metadata': {
                'total_events': len(self.events),
                'time_range_ms': self.events[-1]['timestamp'] - self.events[0]['timestamp'],
                'generated_at': datetime.now().isoformat()
            },
            'queue_analysis': self.analyze_queue_timing(self.events),
            'task_frequency': self.analyze_task_frequency(self.events),
            'temperature_trend': self.analyze_temperature_trend(self.events),
            'anomalies': self.detect_anomalies(self.events),
            'unique_tasks': sorted(set(e['task'] for e in self.events))
        }
        
        return report
    
    def print_report(self, report):
        """Print human-readable report"""
        print("\n" + "="*70)
        print("SMART PATIENT MONITOR - TIMING ANALYSIS REPORT")
        print("="*70)
        
        print(f"\n📊 METADATA")
        print(f"  Total Events:      {report['metadata']['total_events']}")
        print(f"  Time Range:        {report['metadata']['time_range_ms']} ms")
        print(f"  Generated:         {report['metadata']['generated_at']}")
        
        print(f"\n📤 QUEUE ANALYSIS")
        qa = report['queue_analysis']
        print(f"  Total Transfers:   {qa['total_transfers']}")
        print(f"  Avg Latency:       {qa['avg_latency_ms']:.2f} ms")
        print(f"  Min Latency:       {qa['min_latency_ms']:.2f} ms")
        print(f"  Max Latency:       {qa['max_latency_ms']:.2f} ms")
        
        print(f"\n⚙️  TASK FREQUENCY")
        for task, data in report['task_frequency'].items():
            print(f"  {task}:")
            print(f"    Executions:     {data['executions']}")
            print(f"    Avg Interval:   {data['avg_interval_ms']:.2f} ms")
            print(f"    Min Interval:   {data['min_interval_ms']:.2f} ms")
            print(f"    Max Interval:   {data['max_interval_ms']:.2f} ms")
        
        print(f"\n🌡️  TEMPERATURE TREND")
        if report['temperature_trend']:
            tt = report['temperature_trend']
            print(f"  Readings:          {tt['readings']}")
            print(f"  Average:           {tt['avg_temperature']:.2f}°C")
            print(f"  Min:               {tt['min_temperature']:.2f}°C")
            print(f"  Max:               {tt['max_temperature']:.2f}°C")
        else:
            print("  No temperature data found")
        
        print(f"\n⚠️  ANOMALIES DETECTED: {len(report['anomalies'])}")
        if report['anomalies']:
            for anom in report['anomalies'][:10]:  # Show first 10
                print(f"  [{anom['timestamp']}] {anom['type'].upper()}: {anom['message']}")
            if len(report['anomalies']) > 10:
                print(f"  ... and {len(report['anomalies']) - 10} more")
        else:
            print("  ✅ No anomalies detected")
        
        print(f"\n📋 TASKS MONITORED: {len(report['unique_tasks'])}")
        for task in report['unique_tasks']:
            print(f"  • {task}")
        
        print("\n" + "="*70 + "\n")
    
    def export_json(self, output_file):
        """Export report as JSON"""
        report = self.generate_report()
        try:
            with open(output_file, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"✅ Report exported to {output_file}")
            return True
        except IOError as e:
            print(f"❌ Error writing to {output_file}: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(
        description='Parse and analyze timing logs from Smart Patient Monitor'
    )
    parser.add_argument('log_file', nargs='?', help='Log file to parse (or stdin)')
    parser.add_argument('--json', '-j', help='Export report as JSON')
    parser.add_argument('--format', '-f', choices=['text', 'json'], default='text',
                       help='Output format (default: text)')
    
    args = parser.parse_args()
    
    analyzer = TimingLogParser(args.log_file)
    
    # Parse input
    if args.log_file:
        success = analyzer.parse_file()
    else:
        print("📖 Reading from stdin (Ctrl+C to stop)...")
        success = analyzer.parse_stdin()
    
    if not success:
        return 1
    
    if not analyzer.events:
        print("❌ No events found in input")
        return 1
    
    # Generate and display report
    report = analyzer.generate_report()
    
    if args.format == 'json' or args.json:
        output_file = args.json or 'timing_report.json'
        analyzer.export_json(output_file)
    else:
        analyzer.print_report(report)
    
    # Also export JSON if requested
    if args.json:
        analyzer.export_json(args.json)
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
