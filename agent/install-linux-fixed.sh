#!/bin/bash

echo "========================================"
echo "TravelGuard Agent Installer for Linux"
echo "========================================"
echo ""

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed!"
    echo "Install it with: apt install python3 -y"
    exit 1
fi

# Install pip if not present
if ! command -v pip3 &> /dev/null; then
    echo "📦 Installing pip3..."
    apt install python3-pip -y
fi

# Install required packages
echo "📦 Installing required Python packages..."
pip3 install requests

# Create agent directory
mkdir -p /opt/travelguard-agent
cp agent.py /opt/travelguard-agent/

# Make agent executable
chmod +x /opt/travelguard-agent/agent.py

# Create systemd service (for root/system-wide)
cat > /etc/systemd/system/travelguard-agent.service << EOF
[Unit]
Description=TravelGuard Monitoring Agent
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 /opt/travelguard-agent/agent.py
Restart=always
RestartSec=10
User=root

[Install]
WantedBy=multi-user.target
