#!/usr/bin/env python3
"""
TravelGuard Monitoring Agent
Install on user machines to monitor login events
"""

import os
import sys
import json
import time
import socket
import platform
import requests
import subprocess
from datetime import datetime
import threading

# Configuration
SERVER_URL = "http://172.24.1.83"  # Your server IP
AGENT_ID = socket.gethostname()
USERNAME = os.getlogin()

class TravelGuardAgent:
    def __init__(self):
        self.server = SERVER_URL
        self.agent_id = AGENT_ID
        self.username = USERNAME
        self.running = True
        
    def get_ip_address(self):
        """Get machine's IP address"""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return "127.0.0.1"
    
    def get_location_from_ip(self, ip):
        """Get geolocation from IP (free API)"""
        try:
            response = requests.get(f"http://ip-api.com/json/{ip}", timeout=5)
            data = response.json()
            return {
                'city': data.get('city', 'Unknown'),
                'country': data.get('countryCode', 'Unknown'),
                'lat': data.get('lat', 0),
                'lon': data.get('lon', 0)
            }
        except:
            return {'city': 'Unknown', 'country': 'Unknown', 'lat': 0, 'lon': 0}
    
    def get_windows_logins(self):
        """Get Windows login events (Event ID 4624)"""
        if platform.system() == "Windows":
            try:
                # Get last 10 login events
                cmd = 'powershell -Command "Get-WinEvent -FilterHashtable @{LogName=\'Security\'; ID=4624} -MaxEvents 1 | Select-Object -First 1 | ConvertTo-Json"'
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                if result.stdout:
                    import json
                    data = json.loads(result.stdout)
                    return {
                        'timestamp': datetime.now().timestamp() * 1000,
                        'user': self.username,
                        'ip': self.get_ip_address(),
                        'device': platform.node(),
                        'os': platform.system()
                    }
            except:
                pass
        return None
    
    def get_linux_logins(self):
        """Get Linux login events from /var/log/auth.log"""
        if platform.system() == "Linux":
            try:
                # Check last login from 'last' command
                result = subprocess.run(['last', '-1', self.username], capture_output=True, text=True)
                return {
                    'timestamp': datetime.now().timestamp() * 1000,
                    'user': self.username,
                    'ip': self.get_ip_address(),
                    'device': platform.node(),
                    'os': platform.system()
                }
            except:
                pass
        return None
    
    def send_login_event(self):
        """Send login event to server"""
        login_data = None
        
        if platform.system() == "Windows":
            login_data = self.get_windows_logins()
        else:
            login_data = self.get_linux_logins()
        
        if login_data:
            # Get geolocation
            geo = self.get_location_from_ip(login_data['ip'])
            
            # Prepare event
            event = {
                'id': f"evt_{int(time.time())}_{self.agent_id}",
                'userId': f"{self.username}@{self.agent_id}",
                'city': geo['city'],
                'country': geo['country'],
                'latitude': geo['lat'],
                'longitude': geo['lon'],
                'ip': login_data['ip'],
                'device': login_data['device'],
                'browser': 'System Login',
                'timestamp': login_data['timestamp']
            }
            
            # Send to server
            try:
                response = requests.post(f"{self.server}/api/events", json=event, timeout=10)
                if response.status_code == 201:
                    print(f"✓ Login event sent to server")
                    return True
            except Exception as e:
                print(f"✗ Failed to send: {e}")
        
        return False
    
    def heartbeat(self):
        """Send heartbeat to server (every 5 minutes)"""
        while self.running:
            try:
                heartbeat_data = {
                    'agent_id': self.agent_id,
                    'username': self.username,
                    'ip': self.get_ip_address(),
                    'timestamp': datetime.now().timestamp() * 1000,
                    'status': 'online'
                }
                requests.post(f"{self.server}/api/heartbeat", json=heartbeat_data, timeout=5)
                time.sleep(300)  # 5 minutes
            except:
                time.sleep(60)
    
    def run(self):
        """Main agent loop"""
        print(f"""
╔════════════════════════════════════════╗
║   TravelGuard Monitoring Agent         ║
║   Agent ID: {self.agent_id:<20} ║
║   User: {self.username:<25} ║
║   Server: {self.server:<25} ║
╚════════════════════════════════════════╝
        """)
        
        # Start heartbeat thread
        heartbeat_thread = threading.Thread(target=self.heartbeat, daemon=True)
        heartbeat_thread.start()
        
        # Monitor for logins
        print("🔍 Monitoring for login events...")
        last_check = 0
        
        while self.running:
            try:
                # Check every 10 seconds
                if time.time() - last_check > 10:
                    self.send_login_event()
                    last_check = time.time()
                time.sleep(2)
            except KeyboardInterrupt:
                print("\n🛑 Stopping agent...")
                self.running = False
                break
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(10)

if __name__ == "__main__":
    agent = TravelGuardAgent()
    agent.run()
