@echo off
echo 启动Last.fm前端开发服务器...
cd /d "%~dp0"

echo 正在启动前端开发服务器 (端口3000)...
cd client
npm run dev

echo.
echo 按任意键退出...
pause > nul