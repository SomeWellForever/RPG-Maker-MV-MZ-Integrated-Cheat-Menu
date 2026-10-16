@echo off
setlocal
if "%~1"=="" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -File "%~dp0Setup_Windows.ps1" -Action remove
) else (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -File "%~dp0Setup_Windows.ps1" -Action remove -GamePath "%~1"
)
set "CODE=%ERRORLEVEL%"
if not "%CODE%"=="0" echo Operation failed. See the error message above.
echo.
pause
exit /b %CODE%
