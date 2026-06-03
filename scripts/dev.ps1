# Use a single dev URL so CSS/assets always match (avoids unstyled page on wrong port).
$port = 3000

function Stop-Port($p) {
  $connections = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
  foreach ($c in $connections) {
    $processId = $c.OwningProcess
    if ($processId -and $processId -ne 0) {
      Write-Host "Stopping process $processId on port $p..."
      Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
  }
}

Set-Location (Join-Path $PSScriptRoot "..")
Stop-Port $port
Start-Sleep -Seconds 1

# Clear stale webpack disk cache (prevents EBUSY when switching to memory cache).
$webpackCache = Join-Path (Get-Location) ".next\cache\webpack"
if (Test-Path $webpackCache) {
  Remove-Item -Recurse -Force $webpackCache -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "  Collab Docs dev server" -ForegroundColor Cyan
Write-Host "  Open: http://localhost:$port" -ForegroundColor Green
Write-Host ""

npx next dev -p $port
