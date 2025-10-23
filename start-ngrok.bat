@echo off
echo Starting development server and ngrok...

REM 첫 번째 창에서 개발 서버 시작
start "Dev Server" cmd /k "cd /d D:\meeting && npm run dev"

REM 잠시 대기 (서버가 시작될 시간)
timeout /t 5 /nobreak > nul

REM 두 번째 창에서 ngrok 시작 (ngrok 경로 확인 필요)
start "ngrok" cmd /k "ngrok http 3000"

echo Both servers are starting...
echo Check the ngrok window for the public URL!
pause
