param(
  [int]$ApiPort = 8010,
  [string]$ApiUrl = "http://localhost:8010"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackendScript = Join-Path $PSScriptRoot "start_backend_local.ps1"
$MobileScript = Join-Path $PSScriptRoot "start_mobile_local.ps1"

Start-Process powershell -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-File", $BackendScript, "-Port", $ApiPort) -WorkingDirectory $RepoRoot
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList @("-NoExit", "-ExecutionPolicy", "Bypass", "-File", $MobileScript, "-ApiUrl", $ApiUrl) -WorkingDirectory $RepoRoot

Write-Host "AuraSync local iniciado."
Write-Host "API: $ApiUrl"
Write-Host "App web: veja a URL exibida pelo Expo, normalmente http://localhost:19006 ou http://localhost:8081"
