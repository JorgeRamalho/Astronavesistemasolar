# Servidor local para testes responsivos em outro dispositivo (mesma rede Wi-Fi)
$Port = if ($env:PORT) { [int]$env:PORT } else { 8765 }
$Root = $PSScriptRoot

function Get-LocalIPs {
  Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.InterfaceAlias -notmatch 'Loopback' -and
      $_.IPAddress -notlike '169.254.*'
    } |
    Select-Object -ExpandProperty IPAddress
}

$ips = @(Get-LocalIPs)

Write-Host ""
Write-Host "  Viagem Sistema Solar — Servidor de teste" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Pasta: $Root"
Write-Host "  Porta: $Port"
Write-Host ""
Write-Host "  No computador:" -ForegroundColor Yellow
Write-Host "    -> http://localhost:$Port"
Write-Host ""

if ($ips.Count -gt 0) {
  Write-Host "  Em outro dispositivo (mesma rede Wi-Fi):" -ForegroundColor Green
  foreach ($ip in $ips) {
    Write-Host "    -> http://${ip}:$Port"
  }
  Write-Host ""
  Write-Host "  No jogo, abra: Teste em Outro Dispositivo" -ForegroundColor DarkGray
  Write-Host "  para copiar o link ou escanear o QR Code."
  Write-Host ""
} else {
  Write-Host "  Nao foi possivel detectar IP local." -ForegroundColor Red
  Write-Host ""
}

Set-Location $Root

if (Get-Command node -ErrorAction SilentlyContinue) {
  Write-Host "  Iniciando com Node.js..." -ForegroundColor DarkGray
  $env:PORT = $Port
  node "$Root\serve.js"
  exit $LASTEXITCODE
}

if (Get-Command python -ErrorAction SilentlyContinue) {
  Write-Host "  Iniciando com Python..." -ForegroundColor DarkGray
  python -m http.server $Port --bind 0.0.0.0
  exit $LASTEXITCODE
}

Write-Host "  Instale Node.js ou Python para iniciar o servidor." -ForegroundColor Red
Write-Host "  Alternativa: npx --yes serve -l $Port ."
exit 1
