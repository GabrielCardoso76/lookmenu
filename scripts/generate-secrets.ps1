# Gera AUTH_SECRET e CRON_SECRET para .env / Render
# Uso: powershell -ExecutionPolicy Bypass -File scripts/generate-secrets.ps1

function New-Secret {
    $bytes = New-Object byte[] 48
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

$authSecret = New-Secret
$cronSecret = New-Secret

Write-Host ""
Write-Host "=== Segredos gerados (copie para .env ou Render) ===" -ForegroundColor Green
Write-Host ""
Write-Host "AUTH_SECRET=$authSecret"
Write-Host "CRON_SECRET=$cronSecret"
Write-Host ""
Write-Host "Cole no arquivo .env na raiz do projeto ou nas Environment Variables do Render." -ForegroundColor Yellow
Write-Host ""
