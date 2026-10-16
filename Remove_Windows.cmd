@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3 "%~dp0Setup.py" remove "%~dp0"
) else (
  python "%~dp0Setup.py" remove "%~dp0"
)
if errorlevel 1 echo Removal failed. Python 3 is required and the release must be extracted next to Game.exe.
pause
