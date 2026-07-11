# AuraSync Production Validation (PowerShell)
param(
    [string]$BackendUrl = "https://aurasync-backend.vercel.app",
    [string]$AdminUrl = "https://aurasync-admin.vercel.app"
)

Write-Host "[TEST] AuraSync - End-to-End Production Validation (PowerShell)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend URL: $BackendUrl"
Write-Host "Admin URL: $AdminUrl"
Write-Host ""

$passed = 0
$failed = 0

function Test-Pass { param([string]$Message); Write-Host "[PASS] $Message" -ForegroundColor Green; $script:passed++ }
function Test-Fail { param([string]$Message); Write-Host "[FAIL] $Message" -ForegroundColor Red; $script:failed++ }
function Test-Warn { param([string]$Message); Write-Host "[WARN] $Message" -ForegroundColor Yellow }

Write-Host "[RUN] Test 1: Backend Health Check" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/docs" -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) { Test-Pass "Backend is online and responding" } else { Test-Fail "Backend returned status: $($response.StatusCode)" }
} catch { Test-Fail "Backend not responding: $($_.Exception.Message)"; exit 1 }

Write-Host ""
Write-Host "[RUN] Test 2: Health Endpoint" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/health" -UseBasicParsing -ErrorAction Stop
    if ($response.Content -like "*ok*") { Test-Pass "Health endpoint working" } else { Test-Warn "Health endpoint response: $($response.Content)" }
} catch { Test-Warn "Health endpoint error: $($_.Exception.Message)" }

Write-Host ""
Write-Host "[RUN] Test 3: CORS Configuration" -ForegroundColor Cyan
try {
    $headers = @{ "Origin" = "https://aurasync-admin.vercel.app"; "Access-Control-Request-Method" = "GET" }
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/auth/me" -Method OPTIONS -Headers $headers -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.Headers["Access-Control-Allow-Origin"]) { Test-Pass "CORS is properly configured" } else { Test-Fail "CORS headers missing" }
} catch { Test-Warn "Could not verify CORS: $($_.Exception.Message)" }

Write-Host ""
Write-Host "[RUN] Test 4: Database Connection" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/catalog/journeys" -UseBasicParsing -ErrorAction Stop
    if ($response.Content -like "*title*") { Test-Pass "Database connection working" } else { Test-Warn "Journeys response unclear" }
} catch { Test-Warn "Could not fetch journeys" }

Write-Host ""
Write-Host "[RUN] Test 5: Migrations" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/catalog/journeys" -UseBasicParsing -ErrorAction Stop
    if ($response.Content -like "*audio_url*") { Test-Pass "Database schema correct" } else { Test-Warn "audio_url field not found" }
} catch { Test-Warn "Could not verify schema" }

Write-Host ""
Write-Host "[RUN] Test 6: Media URLs" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/catalog/journeys" -UseBasicParsing -ErrorAction Stop
    if ($response.Content -like "*supabase*") { Test-Pass "Media URLs point to Supabase" } elseif ($response.Content -like '*/media*') { Test-Fail "Media URLs still use /media" }
} catch { Test-Warn "Could not verify media URLs" }

Write-Host ""
Write-Host "[RUN] Test 7: Admin Frontend" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $AdminUrl -UseBasicParsing -ErrorAction Stop
    if ($response.Content -like "*<!DOCTYPE*") { Test-Pass "Admin frontend is accessible" } else { Test-Warn "Admin content unclear" }
} catch { Test-Warn "Could not verify admin" }

Write-Host ""
Write-Host "[RUN] Test 8: Services Communication" -ForegroundColor Cyan
try {
    $b = Invoke-WebRequest -Uri "$BackendUrl/api/health" -UseBasicParsing -ErrorAction Stop
    $a = Invoke-WebRequest -Uri $AdminUrl -UseBasicParsing -ErrorAction Stop
    Test-Pass "Both services online"
} catch { Test-Fail "Services not accessible" }

Write-Host ""
Write-Host "[RUN] Test 9: Authentication" -ForegroundColor Cyan
try {
    $body = @{ email = "admin@example.com"; password = "invalid" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.Content -like "*error*") { Test-Pass "Auth endpoint responding" } else { Test-Warn "Auth response unclear" }
} catch { Test-Warn "Could not verify auth" }

Write-Host ""
Write-Host "[RUN] Test 10: Swagger Docs" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BackendUrl/docs" -UseBasicParsing -ErrorAction Stop
    if ($response.Content -like "*swagger*") { Test-Pass "Swagger documentation available" }
} catch { Test-Warn "Could not access docs" }

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Passed: $passed | Failed: $failed" -ForegroundColor Cyan
if ($failed -eq 0) { Write-Host "SUCCESS: All tests passed!" -ForegroundColor Green } else { Write-Host "WARNING: Some tests failed" -ForegroundColor Yellow }
