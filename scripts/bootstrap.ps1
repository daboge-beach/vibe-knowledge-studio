param([string]$Python = 'python')
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Push-Location $repo
try {
    New-Item -ItemType Directory -Force '.tmp', '.cache', '.cache/pip', '.cache/ms-playwright' | Out-Null
    $env:TEMP = Join-Path $repo '.tmp'
    $env:TMP = $env:TEMP
    $env:PIP_CACHE_DIR = Join-Path $repo '.cache/pip'
    $env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $repo '.cache/ms-playwright'
    $env:PYTHONDONTWRITEBYTECODE = '1'
    & $Python -m venv .venv
    if ($LASTEXITCODE -ne 0) { throw '创建虚拟环境失败' }
    & ./.venv/Scripts/python.exe -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { throw '安装依赖失败' }
    & ./.venv/Scripts/python.exe -m playwright install chromium
    if ($LASTEXITCODE -ne 0) { throw '安装 Chromium 失败' }
    & ./.venv/Scripts/python.exe tools/studio.py prepare
    if ($LASTEXITCODE -ne 0) { throw '准备资源失败' }
    & ./.venv/Scripts/python.exe tools/studio.py doctor
    if ($LASTEXITCODE -ne 0) { throw '环境检查失败，请按输出补齐 FFmpeg 等依赖' }
} finally { Pop-Location }
