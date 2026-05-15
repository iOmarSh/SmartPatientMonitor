import http.server
import socketserver
import json
import random
import time

PORT = 8080

class MockESP32Handler(http.server.BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        if self.path == '/data':
            self._set_headers()
            
            # Simulate sensor data
            temp = 36.5 + random.uniform(0, 1)
            # Occasionally trigger alert
            if random.random() < 0.1:
                temp = 38.5
                
            data = {
                'temp': round(temp, 1),
                'light': random.randint(30, 80),
                'dist': random.randint(50, 200),
                'emergency': False,
                'state': 'NORMAL' if temp < 37.5 else 'DANGER',
                'rssi': -65 + random.randint(-5, 5),
                'freeHeap': 185000 + random.randint(-1000, 1000),
                'cpuUsage': random.randint(15, 30),
                'stackHighWaterMark': 2048 + random.randint(-128, 128),
                'taskJitter': random.randint(1, 5),
                'uptimeSeconds': int(time.time()) % 10000,
                'buzzerOverride': False
            }
            self.wfile.write(json.dumps(data).encode())
            
        elif self.path == '/ping':
            self._set_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'device': 'Mock-ESP32'}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/buzzer':
            self._set_headers()
            self.wfile.write(json.dumps({'buzzerOverride': True}).encode())
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    with socketserver.TCPServer(('', PORT), MockESP32Handler) as httpd:
        print(f'Mock ESP32 Server running at http://localhost:{PORT}')
        print('Use http://localhost:8080 in the dashboard settings to connect.')
        httpd.serve_forever()
