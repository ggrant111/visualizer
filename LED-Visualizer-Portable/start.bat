@echo off
cd /d "%~dp0"
echo ========================================
echo   LED Visualizer
echo ========================================
echo.
echo Starting server...
echo Server will be available at: http://localhost:8137
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Check if portable Node.js exists
if exist "node-v20.10.0-win-x64\node.exe" (
    node-v20.10.0-win-x64\node.exe server.js
) else if exist "node.exe" (
    node.exe server.js
) else (
    echo ERROR: Node.js not found!
    echo.
    echo Please download Node.js portable from:
    echo https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip
    echo.
    echo Extract it to: node-v20.10.0-win-x64\
    pause
    exit /b 1
)

pause
