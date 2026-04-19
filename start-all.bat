chcp 65001
@echo off
echo 启动Last.fm Now Playing应用...
cd /d "%~dp0"

echo 正在启动后端服务器 (端口3001)...
start "Last.fm Backend" cmd /k "cd server && npm start"

echo 正在启动前端开发服务器 (端口3000)...
start "Last.fm Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo 两个服务器已启动！
echo 后端: http://localhost:3001
echo 前端: http://localhost:3000
echo ========================================
echo.
echo 注意:
echo 1. 后端窗口将显示日志和API请求
echo 2. 前端窗口将显示Vite构建日志
echo 3. 请在浏览器中打开 http://localhost:3000 使用应用
echo 4. 按任意键关闭此启动窗口（服务器将继续运行）
echo.
pause > nul