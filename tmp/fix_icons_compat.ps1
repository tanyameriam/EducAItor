Get-ChildItem -Path . -Include *.tsx,*.ts -Recurse | ForEach-Object {
    $path = $_.FullName
    try {
        $content = [System.IO.File]::ReadAllText($path)
        if ($content.Contains("@gravity-ui/icons")) {
            Write-Host "Fixing icons in: $path"
            $newContent = $content.Replace("@gravity-ui/icons", "lucide-react")
            $newContent = $newContent.Replace("House", "Home")
            $newContent = $newContent.Replace("Magnifier", "Search")
            $newContent = $newContent.Replace("TriangleExclamation", "AlertTriangle")
            $newContent = $newContent.Replace("CircleExclamation", "AlertCircle")
            $newContent = $newContent.Replace("Gear", "Settings")
            $newContent = $newContent.Replace("ArrowRotateLeft", "RotateCcw")
            $newContent = $newContent.Replace("Xmark", "X")
            $newContent = $newContent.Replace("TrashBin", "Trash2")
            $newContent = $newContent.Replace("Person", "User")
            $newContent = $newContent.Replace("Persons", "Users")
            $newContent = $newContent.Replace("ChartLine", "BarChart3")
            [System.IO.File]::WriteAllText($path, $newContent)
        }
    } catch {
        Write-Warning "Failed to process $path: $_"
    }
}
