# PowerShell script to fix PostgreSQL database setup
# Run this script from the backend directory

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "CareerHoop Database Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERROR: PostgreSQL (psql) is not in your PATH." -ForegroundColor Red
    Write-Host "Please add PostgreSQL bin directory to your PATH or use full path to psql." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example: C:\Program Files\PostgreSQL\15\bin\psql.exe" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Connecting to PostgreSQL..." -ForegroundColor Yellow
Write-Host "You will be prompted for the PostgreSQL superuser password (usually 'postgres' user)" -ForegroundColor Yellow
Write-Host ""

# SQL commands to set up the database
$sqlCommands = @"
-- Create database if it doesn't exist
SELECT 'CREATE DATABASE careerhoop' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'careerhoop')\gexec

-- Create user if it doesn't exist, or update password if it does
DO `$`$`$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'careerhoop') THEN
        CREATE USER careerhoop WITH PASSWORD 'secret';
    ELSE
        ALTER USER careerhoop WITH PASSWORD 'secret';
    END IF;
END
`$`$`$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE careerhoop TO careerhoop;

-- Connect to the database
\c careerhoop

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO careerhoop;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO careerhoop;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO careerhoop;

-- Verify setup
SELECT 'Database and user setup complete!' as status;
"@

# Write SQL to temporary file
$tempSqlFile = "$env:TEMP\careerhoop_setup.sql"
$sqlCommands | Out-File -FilePath $tempSqlFile -Encoding UTF8

Write-Host "Step 2: Running database setup commands..." -ForegroundColor Yellow
Write-Host ""

# Run the SQL commands
try {
    psql -U postgres -f $tempSqlFile
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host "Database setup completed successfully!" -ForegroundColor Green
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now start the backend with:" -ForegroundColor Cyan
        Write-Host "  .\mvnw spring-boot:run" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "ERROR: Database setup failed. Please check the error messages above." -ForegroundColor Red
        Write-Host "You may need to run the SQL commands manually." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to run database setup." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Run these commands manually in psql:" -ForegroundColor Yellow
    Write-Host "  psql -U postgres" -ForegroundColor White
    Write-Host "  Then copy and paste the SQL from: $tempSqlFile" -ForegroundColor White
}

# Clean up
Remove-Item $tempSqlFile -ErrorAction SilentlyContinue

