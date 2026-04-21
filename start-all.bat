@echo off
echo Starting Last.fm Now Playing application...
cd /d "%~dp0"

echo Starting backend server (port 3001)...
start "Last.fm Backend" cmd /k "cd server && npm start"

echo Starting frontend dev server (port 3000)...
start "Last.fm Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo Both servers have been started!
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Notes:
echo 1. The backend window shows logs and API requests
echo 2. The frontend window shows Vite build logs
echo 3. Open http://localhost:3000 in your browser to use the app
echo 4. Press any key to close this startup window (servers keep running)
echo.
pause > nul