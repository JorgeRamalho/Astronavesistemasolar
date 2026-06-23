@echo off
chcp 65001 >nul
:: Libera a porta 8765 no firewall do Windows para outros dispositivos na mesma Wi-Fi.
:: Requer execução como Administrador (clique direito > Executar como administrador).

net session >nul 2>&1
if errorlevel 1 (
  echo.
  echo  [AVISO] Execute como Administrador para liberar o firewall.
  echo  Clique direito neste arquivo ^> Executar como administrador
  echo.
  pause
  exit /b 1
)

netsh advfirewall firewall delete rule name="Viagem Sistema Solar 8765" >nul 2>&1
netsh advfirewall firewall add rule name="Viagem Sistema Solar 8765" dir=in action=allow protocol=TCP localport=8765 profile=private,domain enable=yes

if errorlevel 1 (
  echo  [ERRO] Nao foi possivel criar a regra do firewall.
  pause
  exit /b 1
)

echo.
echo  OK — Porta 8765 liberada para rede privada (Wi-Fi de casa).
echo  Agora execute start-teste.bat e abra o link no celular.
echo.
pause
