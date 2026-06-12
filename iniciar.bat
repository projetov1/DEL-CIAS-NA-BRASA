@echo off
title Churrascaria Bot WA
color 0A

echo.
echo  ==========================================
echo   Delícias na Brasa - Bot WA
echo  ==========================================
echo.

:: Tenta encontrar o Node.js em locais comuns do Windows
set NODE_CMD=node

where node >nul 2>&1
if %errorlevel% equ 0 goto :node_ok

:: Tenta caminhos comuns de instalacao
if exist "C:\Program Files\nodejs\node.exe" (
    set NODE_CMD="C:\Program Files\nodejs\node.exe"
    set PATH=%PATH%;C:\Program Files\nodejs
    goto :node_ok
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set NODE_CMD="C:\Program Files (x86)\nodejs\node.exe"
    set PATH=%PATH%;C:\Program Files (x86)\nodejs
    goto :node_ok
)
if exist "%APPDATA%\nvm\current\node.exe" (
    set NODE_CMD="%APPDATA%\nvm\current\node.exe"
    goto :node_ok
)
if exist "%ProgramFiles%\nodejs\node.exe" (
    set NODE_CMD="%ProgramFiles%\nodejs\node.exe"
    goto :node_ok
)

echo  [ERRO] Node.js nao encontrado!
echo.
echo  Instale em: https://nodejs.org  (versao LTS)
echo  Depois execute este arquivo novamente.
echo.
pause
exit /b

:node_ok
echo  [OK] Node.js encontrado!
%NODE_CMD% --version

:: Define npm com mesmo caminho
set NPM_CMD=npm

:: Instala dependencias se necessario
if not exist "node_modules" (
    echo.
    echo  Instalando dependencias, aguarde...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo  Tentando com caminho completo...
        call "%ProgramFiles%\nodejs\npm.cmd" install
    )
    echo.
)

echo.
echo  Iniciando servidor na porta 3000...
echo  Dashboard: http://localhost:3000
echo.
echo  Pressione Ctrl+C para parar.
echo.

%NODE_CMD% server.js
pause
