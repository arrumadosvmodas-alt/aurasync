param(
  [int]$Port = 8010
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RepoRoot "backend"

Set-Location $BackendDir
$env:PYTHONPATH = $BackendDir

python -m alembic upgrade head
python -m seeds.seed
python -m uvicorn app.main:app --host 127.0.0.1 --port $Port
