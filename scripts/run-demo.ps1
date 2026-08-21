$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

Write-Host 'Starting SocioX AI demo environment...' -ForegroundColor Cyan

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker Desktop is required. Install it, start it, and run this command again.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'Node.js 20+ is required. Install it, then run this command again.' }

docker compose up -d postgres
if ($LASTEXITCODE -ne 0) { throw 'Unable to start PostgreSQL. Make sure Docker Desktop is running.' }
docker compose up -d --wait postgres
if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL did not become ready. Check Docker Desktop.' }

if (-not (Test-Path '.env.local')) {
  @(
    'DATABASE_URL=postgresql://sociox:sociox_dev_password@localhost:5432/sociox'
    'AUTH_SECRET=sociox-local-development-secret-change-before-production'
    'SESSION_TTL_DAYS=7'
  ) | Set-Content -Encoding utf8 '.env.local'
  Write-Host 'Created .env.local' -ForegroundColor DarkGray
}
$env:DATABASE_URL = 'postgresql://sociox:sociox_dev_password@localhost:5432/sociox'

npm install
if ($LASTEXITCODE -ne 0) { throw 'Unable to install Node.js dependencies.' }

Get-Content '.\db\schema.sql' | docker compose exec -T postgres psql -U sociox -d sociox -v ON_ERROR_STOP=1
if ($LASTEXITCODE -ne 0) { throw 'Unable to apply the PostgreSQL schema.' }

node '.\scripts\seed-demo.cjs'
if ($LASTEXITCODE -ne 0) { throw 'Unable to create demo accounts.' }

Write-Host 'SocioX AI is ready at http://localhost:3000' -ForegroundColor Green
npm run dev
