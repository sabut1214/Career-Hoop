# Script to stop process using port 8080 (useful if backend doesn't stop properly)

Write-Host "Checking for processes using port 8080..." -ForegroundColor Yellow

$connections = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue

if ($connections) {
    $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($pid in $processIds) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Found process: $($process.ProcessName) (PID: $pid)" -ForegroundColor Yellow
            Write-Host "Stopping process..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
            Write-Host "Process stopped successfully!" -ForegroundColor Green
        }
    }
} else {
    Write-Host "No process found using port 8080." -ForegroundColor Green
}

Write-Host "`nPort 8080 should now be free. You can start your backend." -ForegroundColor Cyan

