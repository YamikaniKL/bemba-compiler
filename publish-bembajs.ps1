# Publish bembajs to npm
# Run this from the root directory

Write-Host "🚀 Publishing bembajs@1.3.0 to npm..." -ForegroundColor Green
Write-Host ""

# Navigate to bembajs package
$bembajsPath = Join-Path $PSScriptRoot "packages\bembajs"
Set-Location $bembajsPath

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host "Package: $(Get-Content package.json | ConvertFrom-Json | Select-Object -ExpandProperty name)" -ForegroundColor Yellow
Write-Host "Version: $(Get-Content package.json | ConvertFrom-Json | Select-Object -ExpandProperty version)" -ForegroundColor Yellow
Write-Host ""

# Dry run first
Write-Host "📦 Testing publish (dry run)..." -ForegroundColor Cyan
npm publish --dry-run

Write-Host ""
$confirm = Read-Host "Does the dry run look good? Publish for real? (yes/no)"

if ($confirm -eq "yes" -or $confirm -eq "y") {
    Write-Host ""
    Write-Host "🚀 Publishing bembajs@1.3.0..." -ForegroundColor Green
    npm publish
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ bembajs@1.3.0 published successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 View on npm: https://www.npmjs.com/package/bembajs" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Publishing failed. Check the error above." -ForegroundColor Red
    }
} else {
    Write-Host "❌ Publishing cancelled." -ForegroundColor Yellow
}

# Return to original directory
Set-Location $PSScriptRoot

