@echo off
cls
chcp 1251 > nul
if exist output.zip del /f /q output.zip
if exist output.zip.tmp del /f /q output.zip.tmp
setlocal enabledelayedexpansion
set "SEVENZIP_PATH=C:\Program Files\7-Zip\7z.exe"
if not exist "%SEVENZIP_PATH%" (
    powershell -command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('7-Zip [%SEVENZIP_PATH%] not detected','Error',[System.Windows.MessageBoxButton]::OK,[System.Windows.MessageBoxImage]::Error)"
    exit /b 1
)

"%SEVENZIP_PATH%" a -tzip output.zip manifest.json icon.png popup code