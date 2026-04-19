@echo off
echo 启动Last.fm后端服务器...
cd /d "%~dp0"

echo 正在启动后端服务器 (端口3001)...
cd server
npm start

echo.
echo 按任意键退出...
pause > nul