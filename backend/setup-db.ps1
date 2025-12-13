# CareerHoop Database Setup Script
# This script will create the PostgreSQL database and user

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CareerHoop Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql exists
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCmd) {
    Write-Host "ERROR: PostgreSQL (psql) not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please add PostgreSQL to your PATH or use full path:" -ForegroundColor Yellow
    Write-Host "  Example: C:\Program Files\PostgreSQL\15\bin\psql.exe" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Creating database and user..." -ForegroundColor Yellow
Write-Host "You will be prompted for the PostgreSQL superuser password (usually 'postgres' user)" -ForegroundColor Yellow
Write-Host ""

# Create SQL commands
$sql = @"
-- Drop user if exists and recreate
DROP USER IF EXISTS careerhoop;
CREATE USER careerhoop WITH PASSWORD 'secret';

-- Create database if not exists
SELECT 'CREATE DATABASE careerhoop' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'careerhoop')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE careerhoop TO careerhoop;

-- Connect to database
\c careerhoop

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO careerhoop;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO careerhoop;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO careerhoop;

-- Verify
SELECT 'Setup complete! User: careerhoop, Password: secret' as status;
"@

# Write to temp file
$tempFile = "$env:TEMP\careerhoop_setup_$(Get-Date -Format 'yyyyMMddHHmmss').sql"
$sql | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "Running SQL commands..." -ForegroundColor Yellow
Write-Host ""

# Execute
$result = & psql -U postgres -f $tempFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Database setup complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database: careerhoop" -ForegroundColor Cyan
    Write-Host "User: careerhoop" -ForegroundColor Cyan
    Write-Host "Password: secret" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now start the backend:" -ForegroundColor Yellow
    Write-Host "  .\mvnw spring-boot:run" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "ERROR: Database setup failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Output:" -ForegroundColor Yellow
    Write-Host $result -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Run SQL manually:" -ForegroundColor Yellow
    Write-Host "  1. Open: psql -U postgres" -ForegroundColor White
    Write-Host "  2. Copy SQL from: $tempFile" -ForegroundColor White
    Write-Host "  3. Paste and run in psql" -ForegroundColor White
}

# Cleanup
Remove-Item $tempFile -ErrorAction SilentlyContinue

