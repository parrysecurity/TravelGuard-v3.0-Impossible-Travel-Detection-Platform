@echo off
echo ========================================
echo TravelGuard Agent Installer for Windows
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Install required packages
echo Installing required packages...
pip install requests

REM Create startup folder for autorun
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
copy agent.py "%STARTUP%\travelguard-agent.py"

REM Create a VBS script to run silently
echo Creating startup script...
echo CreateObject("Wscript.Shell").Run "python ""%STARTUP%\travelguard-agent.py""", 0, False > "%STARTUP%\travelguard-runner.vbs"

echo.
echo ========================================
echo Installation Complete!
echo The agent will start automatically on next login.
echo ========================================
echo.
echo To start now, run: python agent.py
echo.
pause
