@echo off
setlocal
set "KOD_DOCS_NODE=node.exe"
where.exe node.exe >nul 2>&1
if not errorlevel 1 goto node_ready
set "KOD_DOCS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if exist "%KOD_DOCS_NODE%" goto node_ready
echo Node.js 24 or later was not found. Install Node.js from https://nodejs.org/ and reopen PowerShell.
exit /b 1
:node_ready
pushd "%~dp0"
if errorlevel 1 exit /b 1
"%KOD_DOCS_NODE%" modern-docs/windows-build.mjs %*
set "KOD_DOCS_EXIT=%ERRORLEVEL%"
popd
exit /b %KOD_DOCS_EXIT%
