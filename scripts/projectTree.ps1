function tree-exclude {
    param(
        [string]$Path = ".",
        [string[]]$Exclude = @('node_modules'),
        [string]$Indent = ""
    )

    # Папки
    Get-ChildItem -Path $Path -Directory |
        Where-Object { $_.Name -notin $Exclude } |
        ForEach-Object {
            Write-Host "$Indent+-- $($_.Name)/"
            tree-exclude -Path $_.FullName -Exclude $Exclude -Indent "$Indent    "
        }

    # Файлы
    Get-ChildItem -Path $Path -File |
        ForEach-Object {
            Write-Host "$Indent+-- $($_.Name)"
        }
}

# Запуск
tree-exclude -Path 'D:\photo.myvista.ru'