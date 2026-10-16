param(
    [ValidateSet('install','remove')]
    [string]$Action = 'install',
    [string]$GamePath = ''
)

$ErrorActionPreference = 'Stop'
$releaseFolder = Split-Path -Parent $MyInvocation.MyCommand.Path

function Test-GameFolder([string]$Folder) {
    if ([string]::IsNullOrWhiteSpace($Folder) -or -not (Test-Path -LiteralPath $Folder -PathType Container)) { return $false }
    foreach ($jsFolder in @('www\js', 'js')) {
        $main = Join-Path $Folder (Join-Path $jsFolder 'main.js')
        $plugins = Join-Path $Folder (Join-Path $jsFolder 'plugins.js')
        if ((Test-Path -LiteralPath $main -PathType Leaf) -and
            (Test-Path -LiteralPath $plugins -PathType Leaf)) { return $true }
    }
    return $false
}

try {
    if (-not (Test-Path -LiteralPath (Join-Path $releaseFolder 'Setup.py') -PathType Leaf) -or
        ($Action -eq 'install' -and -not (Test-Path -LiteralPath (Join-Path $releaseFolder 'SWF_CheatMenu.js') -PathType Leaf))) {
        throw 'The archive is incomplete. Extract all files together, then launch the installer.'
    }

    if (-not $GamePath -and (Test-GameFolder $releaseFolder)) {
        $GamePath = $releaseFolder
    }

    while (-not (Test-GameFolder $GamePath)) {
        if ($GamePath) {
            Write-Host 'The selected folder is not an RPG Maker MV/MZ game folder.' -ForegroundColor Yellow
            Write-Host 'Choose the folder containing Game.exe / www (or js / main.js and plugins.js).'
        } else {
            Write-Host 'Select the RPG Maker game folder. The release can stay anywhere, including Downloads.'
        }
        Add-Type -AssemblyName System.Windows.Forms
        $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
        $dialog.Description = 'Select your RPG Maker MV/MZ GAME folder (not the ZIP or its installer folder)'
        $dialog.ShowNewFolderButton = $false
        $result = $dialog.ShowDialog()
        if ($result -ne [System.Windows.Forms.DialogResult]::OK) {
            Write-Host 'Cancelled. No game files were modified.'
            exit 0
        }
        $GamePath = $dialog.SelectedPath
        $dialog.Dispose()
    }

    $pythonCommand = Get-Command py -ErrorAction SilentlyContinue
    if ($pythonCommand) {
        $pythonExe = $pythonCommand.Source
        $pythonArgs = @('-3')
    } else {
        $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
        if (-not $pythonCommand) {
            throw 'Python 3 is not installed or not on PATH. Download it from python.org and retry.'
        }
        $pythonExe = $pythonCommand.Source
        $pythonArgs = @()
    }

    Write-Host ('Game folder: ' + $GamePath) -ForegroundColor Cyan
    & $pythonExe @pythonArgs (Join-Path $releaseFolder 'Setup.py') $Action $GamePath
    if ($LASTEXITCODE -ne 0) {
        throw ("Installer exited with code " + $LASTEXITCODE + ". Please check the error above.")
    }
    Write-Host 'Finished successfully.' -ForegroundColor Green
    exit 0
} catch {
    Write-Host ('ERROR: ' + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
