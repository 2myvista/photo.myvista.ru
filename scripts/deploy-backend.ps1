$ErrorActionPreference = "Stop"

[Environment]::SetEnvironmentVariable(
    "YC_CLI_INITIALIZATION_SILENCE",
    "true",
    "Process"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

$envFile = Join-Path $projectRoot ".env"
$backendDir = Join-Path $projectRoot "backend"

function Load-Env {
    param([string]$Path)

    if (!(Test-Path $Path)) {
        Write-Host ".env not found: $Path" -ForegroundColor Red
        exit 1
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()

        if (!$line -or $line.StartsWith("#")) {
            return
        }

        if ($line -match "=") {
            $name, $value = $line -split "=", 2
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

function Require-Env {
    param([string]$Name)

    $value = [Environment]::GetEnvironmentVariable($Name)

    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "Missing required env variable: $Name" -ForegroundColor Red
        exit 1
    }
}

function Run-Step {
    param(
        [string]$Title,
        [scriptblock]$Command
    )

    Write-Host ""
    Write-Host $Title -ForegroundColor Yellow

    & $Command

    if ($LASTEXITCODE -ne 0) {
        Write-Host "$Title failed" -ForegroundColor Red
        exit 1
    }

    Write-Host "$Title OK" -ForegroundColor Green
}

Load-Env $envFile

Require-Env "BACKEND_FUNCTION_ID"

Run-Step "Build backend" {
    Push-Location $backendDir

    npm run build

    Pop-Location
}

Run-Step "Deploy backend function" {
    yc serverless function version create `
        --function-id $env:BACKEND_FUNCTION_ID `
        --runtime nodejs22 `
        --entrypoint dist/index.handler `
        --memory 128m `
        --execution-timeout 15s `
        --source-path $backendDir `
        1> $null
}

Write-Host ""
Write-Host "Backend deploy completed" -ForegroundColor Green