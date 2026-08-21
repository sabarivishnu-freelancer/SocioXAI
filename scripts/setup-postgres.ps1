$ErrorActionPreference = 'Stop'
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
$createdb = 'C:\Program Files\PostgreSQL\18\bin\createdb.exe'
$port = '5433'
$appUser = 'sociox'
$appPassword = 'sociox_dev_password'
$appDatabase = 'sociox'

if (-not (Test-Path $psql)) { throw "PostgreSQL 18 client not found at $psql" }
$securePassword = Read-Host 'PostgreSQL postgres admin password' -AsSecureString
$credential = New-Object System.Management.Automation.PSCredential('postgres', $securePassword)
$env:PGPASSWORD = $credential.GetNetworkCredential().Password
try {
  $roleSql = "DO `$`$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$appUser') THEN CREATE ROLE $appUser LOGIN PASSWORD '$appPassword'; ELSE ALTER ROLE $appUser WITH LOGIN PASSWORD '$appPassword'; END IF; END `$`$;"
  & $psql -h localhost -p $port -U postgres -d postgres -v ON_ERROR_STOP=1 -c $roleSql
  if ($LASTEXITCODE -ne 0) { throw "PostgreSQL admin authentication failed. Re-run with the correct postgres password." }
  $exists = & $psql -h localhost -p $port -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$appDatabase'"
  if ($LASTEXITCODE -ne 0) { throw "Unable to query PostgreSQL databases." }
  if ($exists.Trim() -ne '1') { & $createdb -h localhost -p $port -U postgres -O $appUser $appDatabase }
  if ($LASTEXITCODE -ne 0) { throw "Unable to create the SocioX database." }
  & $psql -h localhost -p $port -U $appUser -d $appDatabase -f (Join-Path $PSScriptRoot '..\db\schema.sql')
  if ($LASTEXITCODE -ne 0) { throw "Unable to apply the SocioX schema." }
  Write-Host "PostgreSQL setup complete. DATABASE_URL uses localhost:$port/$appDatabase" -ForegroundColor Green
}
finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
