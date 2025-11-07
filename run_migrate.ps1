# Set UTF-8 encoding for the console
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Set environment variables
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"
$env:LANG = "en_US.UTF-8"

# Change to short path to avoid encoding issues
$shortPath = (New-Object -ComObject Scripting.FileSystemObject).GetFolder($PSScriptRoot).ShortPath
Set-Location $shortPath

# Run migrations
& "$shortPath\.venv\Scripts\python.exe" "$shortPath\manage.py" migrate

# Return to original directory
Set-Location $PSScriptRoot
