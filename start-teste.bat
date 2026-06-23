@echo off
chcp 65001 >nul
title Viagem Sistema Solar - Servidor de Teste
cd /d "%~dp0"

echo.
echo  ========================================
echo   VIAGEM SISTEMA SOLAR - Teste em Rede
echo  ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo  [ERRO] Node.js nao encontrado.
  echo  Instale em: https://nodejs.org
  echo.
  pause
  exit /b 1
)

echo  Iniciando servidor na porta 8765...
echo  O navegador abrira com o link e QR Code.
echo.
echo  IMPORTANTE — primeiro acesso no celular:
echo    1. Clique direito em liberar-firewall.bat ^> Executar como administrador
echo    2. Depois mantenha esta janela aberta
echo    3. No celular abra: celular.html ou escaneie o QR Code
echo.
echo  Ou use o site online (qualquer rede):
echo    https://jorgeramalho.github.io/Astronavesistemasolar/
echo.
echo  Mantenha esta janela aberta enquanto testa.
echo  Pressione Ctrl+C para parar.
echo.

node serve.js
pause
