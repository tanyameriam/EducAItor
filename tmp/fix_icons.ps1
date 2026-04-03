Get-ChildItem -Path . -Include *.tsx,*.ts -Recurse | ForEach-Object {
    $path = $_.FullName
    $content = Get-Content $path -Raw
    if ($content -match '@gravity-ui/icons') {
        Write-Host "Fixing icons in: $path"
        $content = $content -replace '@gravity-ui/icons', 'lucide-react'
        $content = $content -replace 'House', 'Home'
        $content = $content -replace 'Magnifier', 'Search'
        $content = $content -replace 'TriangleExclamation', 'AlertTriangle'
        $content = $content -replace 'CircleExclamation', 'AlertCircle'
        $content = $content -replace 'Gear', 'Settings'
        $content = $content -replace 'ArrowRotateLeft', 'RotateCcw'
        $content = $content -replace 'Xmark', 'X'
        $content = $content -replace 'TrashBin', 'Trash2'
        $content = $content -replace 'Person', 'User'
        $content = $content -replace 'Persons', 'Users'
        $content = $content -replace 'ChartLine', 'BarChart3'
        $content | Set-Content $path
    }
}
