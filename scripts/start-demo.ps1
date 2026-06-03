# Starts the app ready for demo recording
Set-Location $PSScriptRoot\..

Write-Host "Collab Docs - Demo startup" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

if (-not (Test-Path "prisma\dev.db")) {
    Write-Host "Creating database..."
    npm run db:push
    npm run db:seed
} else {
    Write-Host "Database exists. Run 'npm run db:reset' if you need a fresh seed."
}

Write-Host ""
Write-Host "Opening browser at http://localhost:3000" -ForegroundColor Green
Write-Host "Follow DEMO_SCRIPT.md while recording." -ForegroundColor Yellow
Write-Host ""

Start-Process "http://localhost:3000"
npm run dev
