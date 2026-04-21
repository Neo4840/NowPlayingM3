@echo off
echo Starting Last.fm backend server...
cd /d "%~dp0"

echo Starting backend server (port 3001)...
cd server
npm start

echo.
echo Press any key to exit...
pause > nul