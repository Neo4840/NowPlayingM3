@echo off
echo Starting Last.fm frontend dev server...
cd /d "%~dp0"

echo Starting frontend dev server (port 3000)...
cd client
npm run dev

echo.
echo Press any key to exit...
pause > nul