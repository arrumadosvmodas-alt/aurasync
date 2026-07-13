param(
  [string]$ApiUrl = "http://localhost:8010"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$MobileDir = Join-Path $RepoRoot "mobile"

Set-Location $MobileDir
$env:EXPO_PUBLIC_API_URL = $ApiUrl

npx expo start --web --clear
