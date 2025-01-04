@echo off
setlocal enabledelayedexpansion

rem Set the directory containing zip files
set "zipDir=C:\Users\durai\Downloads\Stocks\ZIP"
set "outputDir=C:\Users\durai\Downloads\Stocks\EXTRACT"

rem Create output directory if it doesn't exist
if not exist "!outputDir!" (
    mkdir "!outputDir!"
)

rem Loop through all zip files in the directory
for %%f in ("%zipDir%\*.zip") do (
    echo Unzipping: %%f
    PowerShell -Command "Expand-Archive -Path '%%f' -DestinationPath '!outputDir!'"
)

echo All files have been unzipped.
pause
